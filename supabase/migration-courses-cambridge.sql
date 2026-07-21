-- Pure it! — Cambridge, ON launch-area courses (batch 1)
-- Ratings from Golf Canada's public course database (July 2026).
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

-- 2. Launch-area courses
insert into courses (name, city, state, lat, lng, holes, source)
select v.* from (values
  ('Whistle Bear Golf Club',   'Cambridge', 'ON', 43.369300, -80.396500, 18, 'golf_canada'),
  ('Savannah Golf Links',      'Cambridge', 'ON', 43.329300, -80.286000, 18, 'golf_canada'),
  ('Grand Valley Golf',        'Cambridge', 'ON', 43.356249, -80.399323, 18, 'golf_canada'),
  ('Cambridge Golf Club',      'Cambridge', 'ON', 43.383900, -80.246500, 18, 'golf_canada'),
  ('Doon Valley Golf Course',  'Kitchener', 'ON', 43.394072, -80.397069, 18, 'golf_canada'),
  ('Grey Silo Golf Course',    'Waterloo',  'ON', 43.517200, -80.493700, 18, 'golf_canada')
) as v(name, city, state, lat, lng, holes, source)
where not exists (select 1 from courses c where c.name = v.name);

-- 3. Per-tee ratings (batch 1: Whistle Bear + Savannah; more to come)
-- Women's-rated tees are suffixed "(Women)" until a rated_for column exists.
insert into course_tees (course_id, tee_name, rating, slope, par, source)
select c.id, v.tee_name, v.rating, v.slope, v.par, 'golf_canada'
from (values
  -- Whistle Bear Golf Club (par 72)
  ('Whistle Bear Golf Club', 'Black',              76.7, 137, 72),
  ('Whistle Bear Golf Club', 'Gold/Black',         75.2, 134, 72),
  ('Whistle Bear Golf Club', 'Gold',               73.8, 130, 72),
  ('Whistle Bear Golf Club', 'Blue/Gold',          72.5, 128, 72),
  ('Whistle Bear Golf Club', 'Blue',               71.1, 126, 72),
  ('Whistle Bear Golf Club', 'White/Blue',         68.9, 123, 72),
  ('Whistle Bear Golf Club', 'White',              67.8, 121, 72),
  ('Whistle Bear Golf Club', 'Red/White',          65.8, 114, 72),
  ('Whistle Bear Golf Club', 'Red',                64.5, 107, 72),
  ('Whistle Bear Golf Club', 'Blue (Women)',       77.2, 136, 72),
  ('Whistle Bear Golf Club', 'White/Blue (Women)', 74.8, 129, 72),
  ('Whistle Bear Golf Club', 'White (Women)',      73.5, 127, 72),
  ('Whistle Bear Golf Club', 'Red/White (Women)',  71.0, 122, 72),
  ('Whistle Bear Golf Club', 'Red (Women)',        69.2, 118, 72),
  -- Savannah Golf Links (par 71)
  ('Savannah Golf Links',    'Gold',               69.4, 129, 71),
  ('Savannah Golf Links',    'Blue',               67.7, 123, 71),
  ('Savannah Golf Links',    'White',              66.0, 111, 71),
  ('Savannah Golf Links',    'Red',                62.4, 100, 71),
  ('Savannah Golf Links',    'Gold (Women)',       76.1, 140, 71),
  ('Savannah Golf Links',    'Blue (Women)',       73.7, 133, 71),
  ('Savannah Golf Links',    'White (Women)',      71.2, 127, 71),
  ('Savannah Golf Links',    'Red (Women)',        65.8, 115, 71)
) as v(course_name, tee_name, rating, slope, par)
join courses c on c.name = v.course_name
on conflict (course_id, tee_name) do nothing;

-- ===========================================================================
-- 3b. Batch 2: remaining Cambridge/K-W courses
-- ===========================================================================
insert into course_tees (course_id, tee_name, rating, slope, par, source)
select c.id, v.tee_name, v.rating, v.slope, v.par, 'golf_canada'
from (values
  -- Grand Valley Golf & Country Club (par 70)
  ('Grand Valley Golf', 'Blue',         64.6, 103, 70),
  ('Grand Valley Golf', 'Red',          61.9, 96,  70),
  ('Grand Valley Golf', 'Blue (Women)', 69.6, 113, 70),
  ('Grand Valley Golf', 'Red (Women)',  66.5, 107, 70),
  -- Cambridge Golf Club (par 72)
  ('Cambridge Golf Club', 'Black',                69.6, 116, 72),
  ('Cambridge Golf Club', 'Blue',                 68.5, 114, 72),
  ('Cambridge Golf Club', 'White',                66.5, 111, 72),
  ('Cambridge Golf Club', 'Yellow',                64.0, 102, 72),
  ('Cambridge Golf Club', 'Orange/Family',         58.2, 86,  72),
  ('Cambridge Golf Club', 'Blue (Women)',          73.6, 123, 72),
  ('Cambridge Golf Club', 'White (Women)',         71.5, 118, 72),
  ('Cambridge Golf Club', 'Yellow (Women)',        69.2, 114, 72),
  ('Cambridge Golf Club', 'Orange/Family (Women)', 60.6, 97,  72),
  -- Grey Silo Golf Course (par 71)
  ('Grey Silo Golf Course', 'Black',         70.9, 128, 71),
  ('Grey Silo Golf Course', 'Gold',          68.8, 124, 71),
  ('Grey Silo Golf Course', 'Silver',        66.9, 119, 71),
  ('Grey Silo Golf Course', 'Bronze',        64.8, 107, 71),
  ('Grey Silo Golf Course', 'Gold (Women)',  74.9, 138, 71),
  ('Grey Silo Golf Course', 'Silver (Women)',72.4, 135, 71),
  ('Grey Silo Golf Course', 'Bronze (Women)',69.5, 127, 71),
  -- Doon Valley Golf Course — 54 holes total; "(A)" = main 18, "(B)" = second 18 (par 72 / par 70)
  ('Doon Valley Golf Course', 'Black (A)',        70.5, 132, 72),
  ('Doon Valley Golf Course', 'Blue (A)',         68.2, 113, 72),
  ('Doon Valley Golf Course', 'White (A)',        66.2, 103, 72),
  ('Doon Valley Golf Course', 'Red (A)',          63.4, 95,  72),
  ('Doon Valley Golf Course', 'Blue (A, Women)',  73.9, 126, 72),
  ('Doon Valley Golf Course', 'White (A, Women)', 71.6, 119, 72),
  ('Doon Valley Golf Course', 'Red (A, Women)',   68.7, 111, 72),
  ('Doon Valley Golf Course', 'Blue (B)',         66.0, 104, 70),
  ('Doon Valley Golf Course', 'White (B)',        64.6, 102, 70),
  ('Doon Valley Golf Course', 'Red (B)',          62.4, 96,  70),
  ('Doon Valley Golf Course', 'Blue (B, Women)',  71.6, 125, 70),
  ('Doon Valley Golf Course', 'White (B, Women)', 69.4, 122, 70),
  ('Doon Valley Golf Course', 'Red (B, Women)',   67.0, 111, 70)
) as v(course_name, tee_name, rating, slope, par)
join courses c on c.name = v.course_name
on conflict (course_id, tee_name) do nothing;
