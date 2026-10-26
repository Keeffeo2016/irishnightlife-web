-- Lets venues say whether they take hen and stag parties.
-- NULL means the venue hasn't said; the planner treats that as neutral.

ALTER TABLE public.venues
  ADD COLUMN IF NOT EXISTS accepts_hen_stag BOOLEAN;
