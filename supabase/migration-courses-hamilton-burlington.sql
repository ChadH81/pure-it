-- Pure it! — Hamilton + Burlington courses (batch 3)
-- Course names, cities, and map coordinates only. These are plain facts.
--
-- We intentionally DO NOT seed course rating / slope. Those values are the
-- compiled output of a governing body's Course Rating System, and Pure it!
-- does not hold or redistribute that database. Golfers enter the rating and
-- slope from their own scorecard on first play; the app then remembers it for
-- everyone (see the addRound() crowdsource path in lib/db.ts).
--
-- Safe to re-run.

-- 1. Courses (name / city / coordinates only)
insert into courses (name, city, state, lat, lng, holes, source)
select v.* from (values
  ('Chedoke Golf Club',            'Hamilton',   'ON', 43.2467, -79.9087, 18, 'directory'),
  ('Dragon''s Fire Golf Club',     'Hamilton',   'ON', 43.3858, -79.9574, 18, 'directory'),
  ('Glendale Golf Club',           'Hamilton',   'ON', 43.2097, -79.7995, 18, 'directory'),
  ('Hamilton Golf & Country Club', 'Ancaster',   'ON', 43.2187, -79.9770, 27, 'directory'),
  ('King''s Forest Golf Club',     'Hamilton',   'ON', 43.2159, -79.8121, 18, 'directory'),
  ('Burlington Golf & Country Club','Burlington','ON', 43.3099, -79.8265, 18, 'directory'),
  ('Burlington Springs Golf',      'Burlington', 'ON', 43.3965, -79.8992, 18, 'directory'),
  ('Crosswinds Golf & Country Club','Burlington','ON', 43.4480, -79.9118, 18, 'directory'),
  ('Hidden Lake Golf Club',        'Burlington', 'ON', 43.3750, -79.8838, 36, 'directory'),
  ('Lowville Golf Club',           'Burlington', 'ON', 43.4243, -79.9007, 18, 'directory'),
  ('Millcroft Golf Club',          'Burlington', 'ON', 43.3928, -79.8088,  9, 'directory'),
  ('Mount Nemo Golf Club',         'Burlington', 'ON', 43.4289, -79.8710, 18, 'directory'),
  ('Tyandaga Municipal Golf Club', 'Burlington', 'ON', 43.3491, -79.8445, 18, 'directory')
) as v(name, city, state, lat, lng, holes, source)
where not exists (select 1 from courses c where c.name = v.name);

-- Rating & slope are deliberately omitted — crowdsourced from golfers on first
-- play. Nothing further to insert.
