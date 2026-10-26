-- Superadmin overview: admins can read the whole site, venue approval
-- sticks, and unverified venues stay off the public site.
-- Run this in the Supabase SQL editor. Safe to run more than once.
-- The first run marks venues that already exist as verified so the live
-- site stays up. Later runs leave pending and revoked venues alone.

CREATE SCHEMA IF NOT EXISTS private;

CREATE OR REPLACE FUNCTION private.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.users
    WHERE id = (SELECT auth.uid())
      AND role = 'admin'
  );
$$;

-- private is not exposed by the Data API. authenticated still needs
-- EXECUTE because RLS policies run as the signed-in caller.
REVOKE ALL ON FUNCTION private.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.is_admin() FROM anon;
REVOKE ALL ON FUNCTION private.is_admin() FROM authenticated;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_admin() TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.protect_venue_verification()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.is_verified IS DISTINCT FROM OLD.is_verified
     AND auth.uid() IS NOT NULL
     AND NOT private.is_admin() THEN
    NEW.is_verified := OLD.is_verified;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION private.protect_user_role()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role
     AND auth.uid() IS NOT NULL
     AND NOT private.is_admin() THEN
    NEW.role := OLD.role;
  END IF;
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION private.protect_venue_verification() FROM PUBLIC;
REVOKE ALL ON FUNCTION private.protect_user_role() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.protect_venue_verification() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.protect_user_role() TO authenticated, service_role;

DROP TRIGGER IF EXISTS protect_venue_verification ON public.venues;
CREATE TRIGGER protect_venue_verification
  BEFORE UPDATE ON public.venues
  FOR EACH ROW EXECUTE FUNCTION private.protect_venue_verification();

DROP TRIGGER IF EXISTS protect_user_role ON public.users;
CREATE TRIGGER protect_user_role
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION private.protect_user_role();

DROP POLICY IF EXISTS "Venues are publicly readable" ON public.venues;
DROP POLICY IF EXISTS "Verified venues are publicly readable" ON public.venues;
CREATE POLICY "Verified venues are publicly readable" ON public.venues
  FOR SELECT
  USING (is_verified = true);

DROP POLICY IF EXISTS "Owners can read own venues" ON public.venues;
CREATE POLICY "Owners can read own venues" ON public.venues
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = owner_id);

DROP POLICY IF EXISTS "Admins can read all venues" ON public.venues;
CREATE POLICY "Admins can read all venues" ON public.venues
  FOR SELECT
  TO authenticated
  USING ((SELECT private.is_admin()));

DROP POLICY IF EXISTS "Admins can update venues" ON public.venues;
CREATE POLICY "Admins can update venues" ON public.venues
  FOR UPDATE
  TO authenticated
  USING ((SELECT private.is_admin()))
  WITH CHECK ((SELECT private.is_admin()));

DROP POLICY IF EXISTS "Published events are publicly readable" ON public.events;
DROP POLICY IF EXISTS "Published events at verified venues are publicly readable" ON public.events;
CREATE POLICY "Published events at verified venues are publicly readable" ON public.events
  FOR SELECT
  USING (
    is_published = true
    AND EXISTS (
      SELECT 1
      FROM public.venues
      WHERE venues.id = events.venue_id
        AND venues.is_verified = true
    )
  );

DROP POLICY IF EXISTS "Admins can view all events" ON public.events;
CREATE POLICY "Admins can view all events" ON public.events
  FOR SELECT
  TO authenticated
  USING ((SELECT private.is_admin()));

DROP POLICY IF EXISTS "Admins can view all users" ON public.users;
CREATE POLICY "Admins can view all users" ON public.users
  FOR SELECT
  TO authenticated
  USING ((SELECT private.is_admin()));

CREATE INDEX IF NOT EXISTS idx_venues_owner_id ON public.venues (owner_id);
CREATE INDEX IF NOT EXISTS idx_venues_is_verified ON public.venues (is_verified);

CREATE TABLE IF NOT EXISTS private.admin_overview_state (
  id boolean PRIMARY KEY DEFAULT true,
  grandfathered_at timestamptz,
  CONSTRAINT admin_overview_state_singleton CHECK (id)
);

ALTER TABLE private.admin_overview_state ENABLE ROW LEVEL SECURITY;

INSERT INTO private.admin_overview_state (id)
VALUES (true)
ON CONFLICT (id) DO NOTHING;

-- SQL editor has no JWT, so the verification trigger allows this.
UPDATE public.venues
SET is_verified = true
WHERE is_verified = false
  AND EXISTS (
    SELECT 1
    FROM private.admin_overview_state
    WHERE grandfathered_at IS NULL
  );

UPDATE private.admin_overview_state
SET grandfathered_at = COALESCE(grandfathered_at, NOW())
WHERE id = true;
