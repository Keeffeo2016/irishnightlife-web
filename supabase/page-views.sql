-- Page views for the admin overview. Stores the path only, not who visited.
-- Run in the Supabase SQL editor. Safe to run more than once.
-- Admin and sign-in pages are not recorded.

CREATE TABLE IF NOT EXISTS public.page_views (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  CONSTRAINT page_views_path_check CHECK (
    char_length(path) BETWEEN 1 AND 200
    AND path ~ '^/[A-Za-z0-9/_~.-]*$'
  )
);

CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON public.page_views (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_page_views_path_created ON public.page_views (path, created_at DESC);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can record a page view" ON public.page_views;
CREATE POLICY "Anyone can record a page view" ON public.page_views
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    char_length(path) BETWEEN 1 AND 200
    AND path ~ '^/[A-Za-z0-9/_~.-]*$'
    AND path NOT LIKE '/admin%'
    AND path NOT LIKE '/auth%'
    AND path NOT LIKE '/api%'
  );

DROP POLICY IF EXISTS "Admins can read page views" ON public.page_views;
CREATE POLICY "Admins can read page views" ON public.page_views
  FOR SELECT
  TO authenticated
  USING ((SELECT private.is_admin()));

GRANT INSERT ON public.page_views TO anon, authenticated;
GRANT SELECT ON public.page_views TO authenticated;
