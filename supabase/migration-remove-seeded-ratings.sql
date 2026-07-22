-- Pure it! — remove governing-body-sourced rating/slope from the live database
-- ============================================================================
-- Earlier migrations seeded course_tees rating/slope values that originated
-- from a golf governing body's compiled Course Rating System. Pure it! is
-- moving to a clean, crowdsourced-only model: golfers enter rating/slope from
-- their own scorecards, and the app remembers those. This migration removes
-- the previously seeded ratings from your live Supabase database and keeps the
-- course names / cities / coordinates (plain facts).
--
-- Run ONCE in the Supabase SQL Editor. Safe to re-run (idempotent).
--
-- What is preserved:
--   * All rows in `courses` (names, cities, lat/lng) — just relabeled.
--   * Any tee a real golfer added themselves (source = 'user_submitted').
--   * All `rounds` a golfer has logged. A round stores its own rating/slope/
--     score at insert time, so deleting seeded tees does NOT change anyone's
--     already-logged rounds or their computed number.
-- What is removed:
--   * course_tees rows that were seeded from the governing-body database
--     (source = 'golf_canada').

begin;

-- 1. Delete the seeded rating/slope rows (only the governing-body-sourced ones)
delete from course_tees
where source = 'golf_canada';

-- 2. Relabel the seeded course rows so no provenance points at that database.
--    (Names + coordinates are facts; only the label changes.)
update courses
set source = 'directory'
where source = 'golf_canada';

commit;

-- After running, the tee dropdown on the handicap page will be empty for these
-- courses until golfers supply rating/slope from their scorecards — which is
-- the intended clean model. Verify with:
--   select source, count(*) from course_tees group by source;
--   select source, count(*) from courses    group by source;
