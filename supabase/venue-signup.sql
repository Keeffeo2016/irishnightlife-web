-- Venue signup: owners can insert their own row, and new accounts
-- pick up venue_owner from the signup metadata written by the API.

DROP POLICY IF EXISTS "Venue owners can update own venues" ON public.venues;
CREATE POLICY "Venue owners can update own venues" ON public.venues
  FOR UPDATE
  TO authenticated
  USING ((select auth.uid()) = owner_id)
  WITH CHECK ((select auth.uid()) = owner_id);

DROP POLICY IF EXISTS "Venue owners can insert own venues" ON public.venues;
CREATE POLICY "Venue owners can insert own venues" ON public.venues
  FOR INSERT
  TO authenticated
  WITH CHECK ((select auth.uid()) = owner_id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    CASE
      WHEN NEW.raw_user_meta_data->>'account_type' = 'venue' THEN 'venue_owner'::public.user_role
      ELSE 'consumer'::public.user_role
    END
  );
  RETURN NEW;
END;
$$;
