-- Pure it! — Hamilton + Burlington courses (batch 3)
-- Ratings from Golf Canada's public course database (July 2026).
-- NOTE: Only primary tees are included (Black/Gold, Blue, White, Red).
-- Exotic combo tees (e.g. "Gold-Blue", "White-Red") are intentionally
-- omitted to keep the dataset practical — the vast majority of golfers
-- play a standard tee. Hamilton G&CC (27 holes) is added without tee
-- data; its rating set was too large to extract cleanly. Any course
-- missing tees here will pick them up automatically the first time a
-- golfer logs a round there (see the crowdsource path in course_tees).
-- Safe to re-run.

-- 1. Courses
insert into courses (name, city, state, lat, lng, holes, source)
select v.* from (values
  ('Chedoke Golf Club',            'Hamilton',   'ON', 43.2467, -79.9087, 18, 'golf_canada'),
  ('Dragon''s Fire Golf Club',     'Hamilton',   'ON', 43.3858, -79.9574, 18, 'golf_canada'),
  ('Glendale Golf Club',           'Hamilton',   'ON', 43.2097, -79.7995, 18, 'golf_canada'),
  ('Hamilton Golf & Country Club', 'Ancaster',   'ON', 43.2187, -79.9770, 27, 'golf_canada'),
  ('King''s Forest Golf Club',     'Hamilton',   'ON', 43.2159, -79.8121, 18, 'golf_canada'),
  ('Burlington Golf & Country Club','Burlington','ON', 43.3099, -79.8265, 18, 'golf_canada'),
  ('Burlington Springs Golf',      'Burlington', 'ON', 43.3965, -79.8992, 18, 'golf_canada'),
  ('Crosswinds Golf & Country Club','Burlington','ON', 43.4480, -79.9118, 18, 'golf_canada'),
  ('Hidden Lake Golf Club',        'Burlington', 'ON', 43.3750, -79.8838, 36, 'golf_canada'),
  ('Lowville Golf Club',           'Burlington', 'ON', 43.4243, -79.9007, 18, 'golf_canada'),
  ('Millcroft Golf Club',          'Burlington', 'ON', 43.3928, -79.8088,  9, 'golf_canada'),
  ('Mount Nemo Golf Club',         'Burlington', 'ON', 43.4289, -79.8710, 18, 'golf_canada'),
  ('Tyandaga Municipal Golf Club', 'Burlington', 'ON', 43.3491, -79.8445, 18, 'golf_canada')
) as v(name, city, state, lat, lng, holes, source)
where not exists (select 1 from courses c where c.name = v.name);

-- 2. Per-tee ratings (courses where I extracted tee data)
insert into course_tees (course_id, tee_name, rating, slope, par, source)
select c.id, v.tee_name, v.rating, v.slope, v.par, 'golf_canada'
from (values
  -- Chedoke — Martin course (par 70 M / par 72 W)
  ('Chedoke Golf Club', 'Martin - Blue',         67.2, 115, 70),
  ('Chedoke Golf Club', 'Martin - Red',          66.3, 112, 70),
  ('Chedoke Golf Club', 'Martin - Blue (Women)', 72.2, 119, 72),
  ('Chedoke Golf Club', 'Martin - Red (Women)',  71.2, 118, 72),
  -- Chedoke — Beddoe course (par 70 M / par 72 W)
  ('Chedoke Golf Club', 'Beddoe - Blue',          69.0, 123, 70),
  ('Chedoke Golf Club', 'Beddoe - White',         67.8, 120, 70),
  ('Chedoke Golf Club', 'Beddoe - Red',           66.5, 117, 70),
  ('Chedoke Golf Club', 'Beddoe - Blue (Women)',  74.3, 132, 72),
  ('Chedoke Golf Club', 'Beddoe - White (Women)', 73.0, 128, 72),
  ('Chedoke Golf Club', 'Beddoe - Red (Women)',   71.1, 125, 72),
  -- Dragon's Fire Golf Club (par 72)
  ('Dragon''s Fire Golf Club', 'Black',        73.6, 135, 72),
  ('Dragon''s Fire Golf Club', 'Blue',         70.8, 129, 72),
  ('Dragon''s Fire Golf Club', 'White',        69.5, 123, 72),
  ('Dragon''s Fire Golf Club', 'Red',          63.6, 106, 72),
  ('Dragon''s Fire Golf Club', 'White (Women)',74.8, 132, 72),
  ('Dragon''s Fire Golf Club', 'Red (Women)',  67.9, 114, 72),
  -- Glendale Golf Club (par 72)
  ('Glendale Golf Club', 'Blue',         70.5, 128, 72),
  ('Glendale Golf Club', 'White',        68.6, 125, 72),
  ('Glendale Golf Club', 'Red',          66.6, 117, 72),
  ('Glendale Golf Club', 'Blue (Women)', 76.4, 143, 72),
  ('Glendale Golf Club', 'White (Women)',74.4, 138, 72),
  ('Glendale Golf Club', 'Red (Women)',  71.8, 128, 72),
  -- King's Forest Golf Club (par 72 M / par 73 W)
  ('King''s Forest Golf Club', 'Black',        74.2, 136, 72),
  ('King''s Forest Golf Club', 'Blue',         72.0, 131, 72),
  ('King''s Forest Golf Club', 'White',        70.3, 126, 72),
  ('King''s Forest Golf Club', 'Red',          67.5, 120, 72),
  ('King''s Forest Golf Club', 'White (Women)',76.0, 139, 73),
  ('King''s Forest Golf Club', 'Red (Women)',  72.4, 129, 73),
  -- Burlington Golf & Country Club (par 70)
  ('Burlington Golf & Country Club', 'Gold',         71.5, 133, 70),
  ('Burlington Golf & Country Club', 'Blue',         69.6, 132, 70),
  ('Burlington Golf & Country Club', 'White',        67.6, 124, 70),
  ('Burlington Golf & Country Club', 'Red',          62.6, 115, 70),
  ('Burlington Golf & Country Club', 'Gold (Women)', 76.8, 145, 70),
  ('Burlington Golf & Country Club', 'Blue (Women)', 75.0, 141, 70),
  ('Burlington Golf & Country Club', 'White (Women)',72.6, 134, 70),
  ('Burlington Golf & Country Club', 'Red (Women)',  66.3, 115, 70)
) as v(course_name, tee_name, rating, slope, par)
join courses c on c.name = v.course_name
on conflict (course_id, tee_name) do nothing;
