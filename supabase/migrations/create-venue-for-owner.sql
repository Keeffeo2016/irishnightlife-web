-- SECURITY DEFINER function for venue creation
-- Replaces service-role fallback in signup and venue endpoints
-- Run in Supabase SQL Editor

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
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required' USING ERRCODE = 'P0001';
  END IF;

  IF p_name IS NULL OR trim(p_name) = '' THEN
    RAISE EXCEPTION 'Venue name is required' USING ERRCODE = 'P0002';
  END IF;

  IF p_address IS NULL OR trim(p_address) = '' THEN
    RAISE EXCEPTION 'Address is required' USING ERRCODE = 'P0003';
  END IF;

  IF p_city IS NULL OR trim(p_city) = '' THEN
    RAISE EXCEPTION 'City is required' USING ERRCODE = 'P0004';
  END IF;

  IF p_county IS NULL OR trim(p_county) = '' THEN
    RAISE EXCEPTION 'County is required' USING ERRCODE = 'P0005';
  END IF;

  IF p_eircode IS NULL OR trim(p_eircode) = '' THEN
    RAISE EXCEPTION 'Eircode is required' USING ERRCODE = 'P0006';
  END IF;

  p_eircode := upper(replace(trim(p_eircode), ' ', ''));

  IF p_eircode !~ '^[A-Z][0-9]{2}[0-9A-Z]{4}$' THEN
    RAISE EXCEPTION 'Invalid eircode format' USING ERRCODE = 'P0007';
  END IF;

  IF p_venue_type NOT IN ('pub', 'club', 'restaurant', 'bar', 'live_music_venue') THEN
    RAISE EXCEPTION 'Invalid venue type' USING ERRCODE = 'P0008';
  END IF;

  SELECT id INTO v_existing_venue_id
  FROM public.venues
  WHERE owner_id = v_user_id
  LIMIT 1;

  IF v_existing_venue_id IS NOT NULL THEN
    RETURN v_existing_venue_id;
  END IF;

  v_slug := lower(trim(p_name));
  v_slug := regexp_replace(v_slug, '[^a-z0-9]+', '-', 'g');
  v_slug := regexp_replace(v_slug, '^-+|-+$', '', 'g');

  IF v_slug = '' THEN
    v_slug := 'venue-' || substr(md5(random()::text), 1, 8);
  END IF;

  IF EXISTS (SELECT 1 FROM public.venues WHERE slug = v_slug) THEN
    v_slug := v_slug || '-' || substr(md5(random()::text), 1, 6);
  END IF;

  INSERT INTO public.venues (
    owner_id, name, slug, address, city, county, postcode,
    venue_type, description, is_verified, subscription_tier, subscription_status
  )
  VALUES (
    v_user_id, trim(p_name), v_slug, trim(p_address),
    trim(p_city), trim(p_county), p_eircode,
    p_venue_type, trim(p_description),
    FALSE, 'free', 'active'
  )
  RETURNING id INTO v_venue_id;

  UPDATE public.users
  SET role = 'venue_owner'
  WHERE id = v_user_id
    AND role = 'consumer';

  RETURN v_venue_id;

EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to create venue: %', SQLERRM USING ERRCODE = 'P0000';
END;
$$;

REVOKE ALL ON FUNCTION private.create_venue_for_owner FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.create_venue_for_owner TO authenticated;
GRANT EXECUTE ON FUNCTION private.create_venue_for_owner TO service_role;
