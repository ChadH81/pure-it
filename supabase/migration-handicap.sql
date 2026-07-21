-- Pure it! — handicap tracker migration
-- Run this in the Supabase SQL Editor (safe to re-run).

-- Tee-level rating data for a course (e.g. "White", 70.9 / 128)
create table if not exists course_tees (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  tee_name text not null default 'White',
  rating numeric(4,1) not null check (rating between 50 and 85),
  slope int not null check (slope between 55 and 155),
  par int check (par between 60 and 76),
  source text default 'user_submitted',   -- 'seed' | 'user_submitted' | 'licensed'
  created_at timestamptz default now(),
  unique (course_id, tee_name)
);

-- A logged round (18-hole scores in v1)
create table if not exists rounds (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references profiles(id) on delete cascade,
  course_id uuid references courses(id) on delete set null,
  course_name text not null,             -- kept even if course row is deleted
  tee_name text,
  rating numeric(4,1) not null check (rating between 50 and 85),
  slope int not null check (slope between 55 and 155),
  score int not null check (score between 40 and 160),
  date_played date not null default current_date,
  created_at timestamptz default now()
);

create index if not exists rounds_profile_idx on rounds (profile_id, date_played desc);

-- Row Level Security
alter table course_tees enable row level security;
alter table rounds enable row level security;

-- Tees: any signed-in user can read and add (crowdsourced database)
drop policy if exists course_tees_select on course_tees;
create policy course_tees_select on course_tees
  for select to authenticated using (true);

drop policy if exists course_tees_insert on course_tees;
create policy course_tees_insert on course_tees
  for insert to authenticated with check (true);

-- Rounds: private — you only see and manage your own
drop policy if exists rounds_select on rounds;
create policy rounds_select on rounds
  for select to authenticated using (auth.uid() = profile_id);

drop policy if exists rounds_insert on rounds;
create policy rounds_insert on rounds
  for insert to authenticated with check (auth.uid() = profile_id);

drop policy if exists rounds_delete on rounds;
create policy rounds_delete on rounds
  for delete to authenticated using (auth.uid() = profile_id);
