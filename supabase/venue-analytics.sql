-- Venue owners can read view counts for their own venue and event pages only.
-- Run in the Supabase SQL editor if this migration has not already been applied.

DROP POLICY IF EXISTS "Venue owners can read their page views" ON public.page_views;
CREATE POLICY "Venue owners can read their page views"
ON public.page_views
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.venues
    WHERE venues.owner_id = (SELECT auth.uid())
      AND page_views.path = '/venues/' || venues.slug
  )
  OR EXISTS (
    SELECT 1
    FROM public.events
    JOIN public.venues ON venues.id = events.venue_id
    WHERE venues.owner_id = (SELECT auth.uid())
      AND page_views.path = '/events/' || events.slug
  )
);

CREATE OR REPLACE FUNCTION public.owner_page_view_counts(paths text[])
RETURNS TABLE (path text, views bigint)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public
AS $$
  SELECT page_views.path, count(*)::bigint AS views
  FROM public.page_views
  WHERE paths IS NOT NULL
    AND cardinality(paths) BETWEEN 1 AND 500
    AND page_views.path = ANY (paths)
  GROUP BY page_views.path
$$;

REVOKE ALL ON FUNCTION public.owner_page_view_counts(text[]) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.owner_page_view_counts(text[]) FROM anon;
GRANT EXECUTE ON FUNCTION public.owner_page_view_counts(text[]) TO authenticated;
