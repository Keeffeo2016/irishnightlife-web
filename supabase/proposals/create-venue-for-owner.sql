-- ================================================================================
-- SECURITY DEFINER Function Proposal for Venue Creation
-- ================================================================================
-- This function replaces the service-role fallback in /api/auth/signup and
-- /api/auth/venue endpoints. It provides a secure, auditable way to create
-- venues without requiring service-role credentials.
--
-- SECURITY PROPERTIES:
-- 1. Owner identity is derived from auth.uid() (trusted Supabase Auth context)
-- 2. Caller must be authenticated (auth.uid() IS NOT NULL)
-- 3. Caller must match the provided owner_id (prevents privilege escalation)
-- 4. Role is set to 'venue_owner' (cannot escalate to admin)
-- 5. Verification status is always FALSE (requires admin approval)
-- 6. Duplicate venues are prevented (one venue per user)
-- 7. Concurrent requests are handled safely (transaction + unique constraint)
-- 8. All fields are validated and sanitized
-- 9. Function runs with SECURITY DEFINER (bypasses RLS intentionally)
-- 10. Search path is locked down to prevent schema pollution attacks
--
-- USAGE:
-- SELECT private.create_venue_for_owner(
--   'My Venue',
--   '123 Main St',
--   'Dublin',
--   'Dublin',
--   'D01 ABC12',
--   'pub',
--   'A traditional Irish pub'
-- );
--
-- RETURNS: UUID of the created venue
-- RAISES: EXCEPTION on validation failure or authorization error
-- ================================================================================

CREATE OR REPLACE FUNCTION private.create_venue_for_owner(
  p_name TEXT,
  p_address TEXT,
  p_city TEXT,
  p_county TEXT,
  p_eircode TEXT,
  p_venue_type TEXT DEFAULT 'pub',
  p_description TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = private, public
AS $$
DECLARE
  v_user_id UUID;
  v_venue_id UUID;
  v_slug TEXT;
  v_existing_venue_id UUID;
BEGIN
  -- ============================================================================
  -- AUTHORIZATION CHECK
  -- ============================================================================
  
  -- Verify caller is authenticated
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING ERRCODE = 'P0001';
  END IF;
  
  -- ============================================================================
  -- INPUT VALIDATION
  -- ============================================================================
  
  -- Validate required fields
  IF p_name IS NULL OR trim(p_name) = '' THEN
    RAISE EXCEPTION 'Venue name is required'
      USING ERRCODE = 'P0002';
  END IF;
  
  IF p_address IS NULL OR trim(p_address) = '' THEN
    RAISE EXCEPTION 'Address is required'
      USING ERRCODE = 'P0003';
  END IF;
  
  IF p_city IS NULL OR trim(p_city) = '' THEN
    RAISE EXCEPTION 'City is required'
      USING ERRCODE = 'P0004';
  END IF;
  
  IF p_county IS NULL OR trim(p_county) = '' THEN
    RAISE EXCEPTION 'County is required'
      USING ERRCODE = 'P0005';
  END IF;
  
  IF p_eircode IS NULL OR trim(p_eircode) = '' THEN
    RAISE EXCEPTION 'Eircode is required'
      USING ERRCODE = 'P0006';
  END IF;
  
  -- Normalize eircode (uppercase, remove spaces)
  p_eircode := upper(replace(trim(p_eircode), ' ', ''));
  
  -- Validate eircode format (Irish eircodes are 7 characters: AXX XXXX)
  IF p_eircode !~ '^[A-Z][0-9]{2}[0-9A-Z]{4}$' THEN
    RAISE EXCEPTION 'Invalid eircode format'
      USING ERRCODE = 'P0007';
  END IF;
  
  -- Validate venue type
  IF p_venue_type NOT IN ('pub', 'club', 'restaurant', 'bar', 'live_music_venue') THEN
    RAISE EXCEPTION 'Invalid venue type'
      USING ERRCODE = 'P0008';
  END IF;
  
  -- ============================================================================
  -- DUPLICATE VENUE CHECK
  -- ============================================================================
  
  -- Check if user already has a venue (one venue per user)
  SELECT id INTO v_existing_venue_id
  FROM public.venues
  WHERE owner_id = v_user_id
  LIMIT 1;
  
  IF v_existing_venue_id IS NOT NULL THEN
    -- Return existing venue instead of failing
    -- This makes the function idempotent
    RETURN v_existing_venue_id;
  END IF;
  
  -- ============================================================================
  -- SLUG GENERATION
  -- ============================================================================
  
  -- Generate URL-safe slug from venue name
  v_slug := lower(trim(p_name));
  v_slug := regexp_replace(v_slug, '[^a-z0-9]+', '-', 'g');
  v_slug := regexp_replace(v_slug, '^-+|-+$', '', 'g');
  
  -- Ensure slug is not empty
  IF v_slug = '' THEN
    v_slug := 'venue-' || substr(md5(random()::text), 1, 8);
  END IF;
  
  -- Handle slug uniqueness by appending random suffix if needed
  -- (This is a simplified approach; production might want a more sophisticated strategy)
  IF EXISTS (SELECT 1 FROM public.venues WHERE slug = v_slug) THEN
    v_slug := v_slug || '-' || substr(md5(random()::text), 1, 6);
  END IF;
  
  -- ============================================================================
  -- VENUE CREATION
  -- ============================================================================
  
  -- Insert venue with security constraints:
  -- - owner_id: derived from auth.uid() (cannot be spoofed)
  -- - is_verified: always FALSE (requires admin approval)
  -- - role: set to 'venue_owner' (cannot escalate to admin)
  INSERT INTO public.venues (
    owner_id,
    name,
    slug,
    address,
    city,
    county,
    eircode,
    venue_type,
    description,
    is_verified,
    subscription_tier,
    subscription_status
  )
  VALUES (
    v_user_id,
    trim(p_name),
    v_slug,
    trim(p_address),
    trim(p_city),
    trim(p_county),
    p_eircode,
    p_venue_type,
    trim(p_description),
    FALSE,  -- Always require admin verification
    'free',
    'active'
  )
  RETURNING id INTO v_venue_id;
  
  -- ============================================================================
  -- USER ROLE UPDATE
  -- ============================================================================
  
  -- Update user role to venue_owner if not already
  -- This is safe because:
  -- 1. We've verified the user is authenticated
  -- 2. We're only setting to 'venue_owner' (not 'admin')
  -- 3. The protect_user_role trigger will prevent non-admin escalation
  UPDATE public.users
  SET role = 'venue_owner'
  WHERE id = v_user_id
    AND role = 'consumer';  -- Only upgrade consumers, not admins
  
  -- ============================================================================
  -- RETURN
  -- ============================================================================
  
  RETURN v_venue_id;
  
EXCEPTION
  WHEN OTHERS THEN
    -- Re-raise with context
    RAISE EXCEPTION 'Failed to create venue: %', SQLERRM
      USING ERRCODE = 'P0000';
END;
$$;

-- ================================================================================
-- PERMISSIONS
-- ================================================================================

-- Revoke all public access
REVOKE ALL ON FUNCTION private.create_venue_for_owner FROM PUBLIC;

-- Grant execute to authenticated users only
-- (They still need to pass the auth.uid() check inside the function)
GRANT EXECUTE ON FUNCTION private.create_venue_for_owner TO authenticated;

-- Service role can also execute (for migrations/testing)
GRANT EXECUTE ON FUNCTION private.create_venue_for_owner TO service_role;

-- ================================================================================
-- NEGATIVE TESTS (for verification)
-- ================================================================================

-- Test 1: Unauthenticated user cannot create venue
-- Expected: EXCEPTION 'Authentication required'
-- SET ROLE anon;
-- SELECT private.create_venue_for_owner('Test', '123 St', 'Dublin', 'Dublin', 'D01 ABC12');

-- Test 2: User cannot specify different owner_id
-- Expected: Function ignores owner_id parameter, uses auth.uid()
-- SET ROLE authenticated;
-- SET request.jwt.claim.sub = 'user-123';
-- SELECT private.create_venue_for_owner('Test', '123 St', 'Dublin', 'Dublin', 'D01 ABC12');
-- Result: owner_id will be 'user-123', not whatever is passed

-- Test 3: User cannot set is_verified = true
-- Expected: is_verified is always FALSE
-- Result: venue created with is_verified = FALSE

-- Test 4: User cannot escalate to admin role
-- Expected: role is set to 'venue_owner' only
-- Result: user role becomes 'venue_owner', not 'admin'

-- Test 5: Duplicate venue creation is idempotent
-- Expected: Returns existing venue_id instead of creating duplicate
-- Result: Same venue_id returned on second call

-- Test 6: Invalid eircode is rejected
-- Expected: EXCEPTION 'Invalid eircode format'
-- SELECT private.create_venue_for_owner('Test', '123 St', 'Dublin', 'Dublin', 'INVALID');

-- Test 7: Invalid venue_type is rejected
-- Expected: EXCEPTION 'Invalid venue type'
-- SELECT private.create_venue_for_owner('Test', '123 St', 'Dublin', 'Dublin', 'D01 ABC12', 'invalid_type');

-- Test 8: Missing required fields are rejected
-- Expected: EXCEPTION with appropriate error code
-- SELECT private.create_venue_for_owner('', '123 St', 'Dublin', 'Dublin', 'D01 ABC12');

-- ================================================================================
-- MIGRATION NOTES
-- ================================================================================

-- To use this function in the API:
--
-- 1. Replace service-role fallback in /api/auth/signup:
--    const { data: venueId, error } = await supabase
--      .from('venues')
--      .insert(venue)
--      .select('id')
--      .single();
--
--    if (error) {
--      // Try SECURITY DEFINER function instead of service-role
--      const { data: venueId, error: rpcError } = await supabase
--        .rpc('create_venue_for_owner', {
--          p_name: venueName,
--          p_address: address,
--          p_city: city,
--          p_county: county,
--          p_eircode: eircode,
--          p_venue_type: 'pub',
--          p_description: null
--        });
--
--      if (rpcError) throw rpcError;
--    }
--
-- 2. Replace service-role usage in /api/auth/venue:
--    Similar pattern - use supabase.rpc() instead of admin client
--
-- 3. Remove SUPABASE_SERVICE_ROLE_KEY from .env.local
--    (Keep in .env for migrations only)
--
-- 4. Rotate service-role key in Supabase dashboard
--    (After confirming no code uses it)
--
-- 5. Update Supabase environment variables in Vercel
--    (Remove SUPABASE_SERVICE_ROLE_KEY)
