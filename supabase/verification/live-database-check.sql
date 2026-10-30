-- ================================================================================
-- Phase 10B: Live Database Verification Script
-- ================================================================================
-- Purpose: Verify that the live Supabase database matches repository definitions
-- Status: BLOCKED — Requires human operator to execute in Supabase SQL Editor
--
-- INSTRUCTIONS:
-- 1. Open Supabase Dashboard → SQL Editor
-- 2. Connect to the PRODUCTION Supabase project
-- 3. Execute each section separately
-- 4. Compare results with expected output
-- 5. Document any discrepancies
--
-- SAFETY: All queries are read-only and safe to execute
-- ================================================================================

-- ================================================================================
-- SECTION 1: Row Level Security Status
-- ================================================================================
-- Expected: All tables should have rowsecurity = true

SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'users', 
    'venues', 
    'events', 
    'user_favorites', 
    'user_preferences', 
    'venue_reviews', 
    'live_updates', 
    'page_views'
  )
ORDER BY tablename;

-- Expected result:
-- schemaname | tablename          | rls_enabled
-- -----------+--------------------+-------------
-- public     | events             | t
-- public     | live_updates       | t
-- public     | page_views         | t
-- public     | user_favorites     | t
-- public     | user_preferences   | t
-- public     | users              | t
-- public     | venue_reviews      | t
-- public     | venues             | t

-- ================================================================================
-- SECTION 2: Venues Table Policies
-- ================================================================================
-- Expected: 7 policies matching admin-overview.sql and venue-signup.sql

SELECT 
  polname AS policy_name,
  pg_get_expr(polqual, polrelid) AS using_expression,
  pg_get_expr(polwithcheck, polrelid) AS with_check_expression,
  CASE polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END AS command,
  polroles::regrole[] AS roles
FROM pg_policy
WHERE polrelid = 'public.venues'::regclass
ORDER BY polname;

-- Expected policies:
-- 1. "Admins can read all venues" (SELECT) - USING: private.is_admin()
-- 2. "Admins can update venues" (UPDATE) - USING/WITH CHECK: private.is_admin()
-- 3. "Owners can read own venues" (SELECT) - USING: auth.uid() = owner_id
-- 4. "Verified venues are publicly readable" (SELECT) - USING: is_verified = true
-- 5. "Venue owners can insert own venues" (INSERT) - WITH CHECK: auth.uid() = owner_id
-- 6. "Venue owners can update own venues" (UPDATE) - USING/WITH CHECK: auth.uid() = owner_id

-- ================================================================================
-- SECTION 3: Events Table Policies
-- ================================================================================
-- Expected: 6 policies matching admin-overview.sql and venue-event-approval.sql

SELECT 
  polname AS policy_name,
  pg_get_expr(polqual, polrelid) AS using_expression,
  pg_get_expr(polwithcheck, polrelid) AS with_check_expression,
  CASE polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END AS command,
  polroles::regrole[] AS roles
FROM pg_policy
WHERE polrelid = 'public.events'::regclass
ORDER BY polname;

-- Expected policies:
-- 1. "Admins can view all events" (SELECT) - USING: private.is_admin()
-- 2. "Published events at verified venues are publicly readable" (SELECT)
-- 3. "Venue owners can create events for approved venues" (INSERT)
-- 4. "Venue owners can delete own events" (DELETE)
-- 5. "Venue owners can read own events" (SELECT)
-- 6. "Venue owners can update own events" (UPDATE)

-- ================================================================================
-- SECTION 4: Users Table Policies
-- ================================================================================
-- Expected: 3 policies

SELECT 
  polname AS policy_name,
  pg_get_expr(polqual, polrelid) AS using_expression,
  pg_get_expr(polwithcheck, polrelid) AS with_check_expression,
  CASE polcmd
    WHEN 'r' THEN 'SELECT'
    WHEN 'a' THEN 'INSERT'
    WHEN 'w' THEN 'UPDATE'
    WHEN 'd' THEN 'DELETE'
    WHEN '*' THEN 'ALL'
  END AS command
FROM pg_policy
WHERE polrelid = 'public.users'::regclass
ORDER BY polname;

-- Expected policies:
-- 1. "Admins can view all users" (SELECT) - USING: private.is_admin()
-- 2. "Users can update own profile" (UPDATE) - USING: auth.uid() = id
-- 3. "Users can view own profile" (SELECT) - USING: auth.uid() = id

-- ================================================================================
-- SECTION 5: Protection Triggers
-- ================================================================================
-- Expected: 2 triggers (protect_user_role, protect_venue_verification)

SELECT 
  trigger_name,
  event_object_table AS table_name,
  event_object_schema AS schema_name,
  action_statement,
  action_timing,
  event_manipulation AS event_type
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND trigger_name IN ('protect_user_role', 'protect_venue_verification')
ORDER BY trigger_name;

-- Expected result:
-- trigger_name                | table_name | schema_name | action_statement                                      | action_timing | event_type
-- ----------------------------+------------+-------------+-------------------------------------------------------+---------------+-----------
-- protect_user_role           | users      | public      | EXECUTE FUNCTION private.protect_user_role()         | BEFORE        | UPDATE
-- protect_venue_verification  | venues     | public      | EXECUTE FUNCTION private.protect_venue_verification()| BEFORE        | UPDATE

-- ================================================================================
-- SECTION 6: Trigger Status (Enabled/Disabled)
-- ================================================================================
-- Expected: All triggers should be enabled (tgenabled = 'O')

SELECT 
  tgname AS trigger_name,
  tgrelid::regclass AS table_name,
  CASE tgenabled
    WHEN 'O' THEN 'enabled'
    WHEN 'D' THEN 'disabled'
    WHEN 'R' THEN 'replica'
    WHEN 'A' THEN 'always'
  END AS status
FROM pg_trigger
WHERE tgname IN ('protect_user_role', 'protect_venue_verification', 'on_auth_user_created')
  AND NOT tgisinternal
ORDER BY tgname;

-- Expected result:
-- trigger_name                | table_name | status
-- ----------------------------+------------+--------
-- on_auth_user_created        | auth.users | enabled
-- protect_user_role           | users      | enabled
-- protect_venue_verification  | venues     | enabled

-- ================================================================================
-- SECTION 7: SECURITY DEFINER Functions
-- ================================================================================
-- Expected: 4 functions with SECURITY DEFINER

SELECT 
  n.nspname AS schema_name,
  p.proname AS function_name,
  CASE p.prosecdef
    WHEN true THEN 'DEFINER'
    WHEN false THEN 'INVOKER'
  END AS security_type,
  pg_get_function_identity_arguments(p.oid) AS arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname IN ('public', 'private')
  AND p.proname IN (
    'is_admin', 
    'protect_user_role', 
    'protect_venue_verification', 
    'handle_new_user'
  )
ORDER BY n.nspname, p.proname;

-- Expected result:
-- schema_name | function_name              | security_type | arguments
-- ------------+----------------------------+---------------+-----------
-- private     | is_admin                   | DEFINER       | 
-- private     | protect_user_role          | DEFINER       | 
-- private     | protect_venue_verification | DEFINER       | 
-- public      | handle_new_user            | DEFINER       | 

-- ================================================================================
-- SECTION 8: Function Privileges
-- ================================================================================
-- Expected: private functions grant EXECUTE to authenticated and service_role

SELECT 
  n.nspname AS schema,
  p.proname AS function_name,
  has_function_privilege('authenticated', p.oid, 'EXECUTE') AS authenticated_execute,
  has_function_privilege('service_role', p.oid, 'EXECUTE') AS service_role_execute,
  has_function_privilege('anon', p.oid, 'EXECUTE') AS anon_execute
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'private'
  AND p.proname IN ('is_admin', 'protect_user_role', 'protect_venue_verification')
ORDER BY p.proname;

-- Expected result:
-- schema  | function_name              | authenticated_execute | service_role_execute | anon_execute
-- --------+----------------------------+-----------------------+----------------------+-------------
-- private | is_admin                   | t                     | t                    | f
-- private | protect_user_role          | t                     | t                    | f
-- private | protect_venue_verification | t                     | t                    | f

-- ================================================================================
-- SECTION 9: Schema Privileges
-- ================================================================================
-- Expected: authenticated and service_role have USAGE on private schema

SELECT 
  nspname AS schema_name,
  has_schema_privilege('authenticated', nspname, 'USAGE') AS authenticated_usage,
  has_schema_privilege('service_role', nspname, 'USAGE') AS service_role_usage,
  has_schema_privilege('anon', nspname, 'USAGE') AS anon_usage
FROM pg_namespace
WHERE nspname = 'private';

-- Expected result:
-- schema_name | authenticated_usage | service_role_usage | anon_usage
-- ------------+---------------------+--------------------+-----------
-- private     | t                   | t                  | f

-- ================================================================================
-- SECTION 10: Storage Bucket Configuration
-- ================================================================================
-- Expected: venue-images bucket with correct restrictions

SELECT 
  id AS bucket_name,
  public AS is_public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets
WHERE id = 'venue-images';

-- Expected result:
-- bucket_name   | is_public | file_size_limit | allowed_mime_types
-- --------------+-----------+-----------------+-------------------------------------------
-- venue-images  | t         | 5242880         | {image/jpeg,image/png,image/webp,image/gif}

-- ================================================================================
-- SECTION 11: Storage Policies
-- ================================================================================
-- Expected: 4 policies on storage.objects for venue-images bucket

SELECT 
  polname AS policy_name,
  pg_get_expr(polqual, polrelid) AS using_expression,
  pg_get_expr(polwithcheck, polrelid) AS with_check_expression
FROM pg_policy
WHERE polrelid = 'storage.objects'::regclass
  AND polname LIKE '%venue%image%'
ORDER BY polname;

-- Expected policies:
-- 1. "Public can view venue images" (SELECT)
-- 2. "Venue owners can delete venue images" (DELETE)
-- 3. "Venue owners can update venue images" (UPDATE)
-- 4. "Venue owners can upload venue images" (INSERT)

-- ================================================================================
-- SECTION 12: Admin User Audit
-- ================================================================================
-- Expected: Only known admin accounts (review manually)

SELECT 
  id,
  email,
  role,
  created_at,
  updated_at
FROM public.users
WHERE role = 'admin'
ORDER BY created_at;

-- Manual review required: Verify all admin accounts are authorized

-- ================================================================================
-- SECTION 13: Venue Verification Status
-- ================================================================================
-- Expected: Some venues should be verified (grandfathered by admin-overview.sql)

SELECT 
  is_verified,
  COUNT(*) AS venue_count
FROM public.venues
GROUP BY is_verified
ORDER BY is_verified;

-- Expected result:
-- is_verified | venue_count
-- ------------+-------------
-- f           | <some number>
-- t           | <some number>

-- ================================================================================
-- SECTION 14: Unauthorized Role Escalation Test
-- ================================================================================
-- This test verifies that the protect_user_role trigger is working
-- DO NOT execute this in production without proper authorization

-- Test setup (requires admin privileges):
-- CREATE TEMP TABLE test_users AS SELECT * FROM public.users LIMIT 1;
-- UPDATE test_users SET role = 'admin' WHERE role = 'consumer';
-- 
-- Expected: Trigger should prevent non-admin users from escalating to admin

-- ================================================================================
-- SECTION 15: Unauthorized Verification Test
-- ================================================================================
-- This test verifies that the protect_venue_verification trigger is working
-- DO NOT execute this in production without proper authorization

-- Test setup (requires admin privileges):
-- CREATE TEMP TABLE test_venues AS SELECT * FROM public.venues LIMIT 1;
-- UPDATE test_venues SET is_verified = true WHERE is_verified = false;
--
-- Expected: Trigger should prevent non-admin users from verifying venues

-- ================================================================================
-- VERIFICATION CHECKLIST
-- ================================================================================
-- After executing all sections, verify:
--
-- [ ] All 8 tables have RLS enabled
-- [ ] Venues table has 6 correct policies
-- [ ] Events table has 6 correct policies
-- [ ] Users table has 3 correct policies
-- [ ] Both protection triggers exist and are enabled
-- [ ] All 4 SECURITY DEFINER functions exist
-- [ ] Private functions have correct privileges
-- [ ] Private schema has correct privileges
-- [ ] Storage bucket is configured correctly
-- [ ] Storage policies are in place
-- [ ] Admin accounts are authorized
-- [ ] Venue verification status is as expected
--
-- If any check fails, document the discrepancy and investigate before release.

-- ================================================================================
-- REPORTING
-- ================================================================================
-- After execution, provide:
-- 1. Timestamp of verification
-- 2. Supabase project URL
-- 3. Results of each section (pass/fail)
-- 4. Any discrepancies found
-- 5. Screenshots or exported results
--
-- This verification must be completed before production release.
