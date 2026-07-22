-- Pure it! — Cambridge, ON launch-area courses (batch 1)
-- Course names, cities, and map coordinates only. These are plain facts.
--
-- We intentionally DO NOT seed course rating / slope. Those values are the
-- compiled output of a governing body's Course Rating System, and Pure it!
-- does not hold or redistribute that database. Instead, golfers enter the
-- rating and slope printed on their own scorecard the first time a course is
-- played; that crowdsourced value is then remembered for everyone (see the
-- addRound() path in lib/db.ts and the course_tees table).
--
-- Run in the Supabase SQL Editor. Safe to re-run.

-- 0. Simple lat/lng columns (easier than PostGIS for now; map uses these)
alter table courses add column if not exists lat double precision;
alter table courses add column if not exists lng double precision;

-- 1. Remove the placeholder Illinois seed courses (only if unused)
delete from courses c
where c.state = 'IL'
  and c.source = 'seed'
  and not exists (select 1 from games g where g.course_id = c.id)
  and not exists (select 1 from rounds r where r.course_id = c.id)
  and not exists (select 1 from course_tees t where t.course_id = c.id);

-- 2. Launch-area courses (name / city / coordinates only)
insert into courses (name, city, state, lat, lng, holes, source)
select v.* from (values
  ('Whistle Bear Golf Club',   'Cambridge', 'ON', 43.369300, -80.396500, 18, 'directory'),
  ('Savannah Golf Links',      'Cambridge', 'ON', 43.329300, -80.286000, 18, 'directory'),
  ('Grand Valley Golf',        'Cambridge', 'ON', 43.356249, -80.399323, 18, 'directory'),
  ('Cambridge Golf Club',      'Cambridge', 'ON', 43.383900, -80.246500, 18, 'directory'),
  ('Doon Valley Golf Course',  'Kitchener', 'ON', 43.394072, -80.397069, 18, 'directory'),
  ('Grey Silo Golf Course',    'Waterloo',  'ON', 43.517200, -80.493700, 18, 'directory')
) as v(name, city, state, lat, lng, holes, source)
where not exists (select 1 from courses c where c.name = v.name);

-- Rating & slope are deliberately omitted — golfers supply them from the
-- scorecard on first play, and the app fills the course_tees table from there.
-- Nothing further to insert.
