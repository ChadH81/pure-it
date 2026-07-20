-- Pure it! — database schema v1
-- Paste this whole file into the Supabase SQL Editor and click Run.
-- Safe to re-run: drops and recreates policies, uses IF NOT EXISTS where possible.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type game_format as enum ('casual_9','casual_18','best_ball_2v2','scramble');
exception when duplicate_object then null; end $$;

do $$ begin
  create type game_status as enum ('open','full','completed','cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type pace_pref as enum ('relaxed','steady','fast');
exception when duplicate_object then null; end $$;

do $$ begin
  create type vibe_pref as enum ('casual','social','competitive');
exception when duplicate_object then null; end $$;

do $$ begin
  create type walk_ride as enum ('walk','ride','either');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'New golfer',
  avatar_url text,
  bio text,
  home_city text,
  home_lat double precision,
  home_lng double precision,
  handicap numeric(4,1),
  pace pace_pref default 'steady',
  vibe vibe_pref default 'casual',
  walk_or_ride walk_ride default 'either',
  created_at timestamptz default now()
);

-- Auto-create a profile row whenever someone signs up
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------------
-- Courses
-- ---------------------------------------------------------------------------
create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  state text,
  lat double precision,
  lng double precision,
  holes int default 18,
  source text default 'seed',
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Games
-- ---------------------------------------------------------------------------
create table if not exists games (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references profiles(id) on delete cascade,
  course_id uuid references courses(id),
  course_name text not null,          -- denormalized for free-text entry in v1
  city text,
  tee_time timestamptz not null,
  format game_format not null default 'casual_18',
  slots_total int not null default 4 check (slots_total between 2 and 8),
  status game_status not null default 'open',
  notes text,
  hcp_min numeric(4,1),
  hcp_max numeric(4,1),
  pace pace_pref,
  walk_or_ride walk_ride default 'either',
  created_at timestamptz default now()
);

create index if not exists games_teetime_idx on games (tee_time);

-- ---------------------------------------------------------------------------
-- Game players
-- ---------------------------------------------------------------------------
create table if not exists game_players (
  game_id uuid references games(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  joined_at timestamptz default now(),
  primary key (game_id, profile_id)
);

-- Host is auto-added as a player
create or replace function add_host_as_player()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.game_players (game_id, profile_id)
  values (new.id, new.host_id)
  on conflict do nothing;
  return new;
end $$;

drop trigger if exists on_game_created on games;
create trigger on_game_created
  after insert on games
  for each row execute function add_host_as_player();

-- ---------------------------------------------------------------------------
-- Game messages
-- ---------------------------------------------------------------------------
create table if not exists game_messages (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz default now()
);

create index if not exists game_messages_game_idx on game_messages (game_id, created_at);

-- ---------------------------------------------------------------------------
-- Trust & safety
-- ---------------------------------------------------------------------------
create table if not exists blocks (
  blocker_id uuid references profiles(id) on delete cascade,
  blocked_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id)
);

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id) on delete cascade,
  subject_profile_id uuid references profiles(id) on delete set null,
  subject_game_id uuid references games(id) on delete set null,
  reason text not null,
  created_at timestamptz default now()
);

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table profiles       enable row level security;
alter table courses        enable row level security;
alter table games          enable row level security;
alter table game_players   enable row level security;
alter table game_messages  enable row level security;
alter table blocks         enable row level security;
alter table reports        enable row level security;

-- Profiles: anyone signed in can read; you can only write your own
drop policy if exists profiles_select on profiles;
create policy profiles_select on profiles
  for select to authenticated using (true);

drop policy if exists profiles_update on profiles;
create policy profiles_update on profiles
  for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists profiles_insert on profiles;
create policy profiles_insert on profiles
  for insert to authenticated with check (auth.uid() = id);

-- Courses: readable by all signed-in users; anyone signed in may add one
drop policy if exists courses_select on courses;
create policy courses_select on courses
  for select to authenticated using (true);

drop policy if exists courses_insert on courses;
create policy courses_insert on courses
  for insert to authenticated with check (true);

-- Games: readable by all; only the host can create/edit/delete their own
drop policy if exists games_select on games;
create policy games_select on games
  for select to authenticated using (true);

drop policy if exists games_insert on games;
create policy games_insert on games
  for insert to authenticated with check (auth.uid() = host_id);

drop policy if exists games_update on games;
create policy games_update on games
  for update to authenticated using (auth.uid() = host_id);

drop policy if exists games_delete on games;
create policy games_delete on games
  for delete to authenticated using (auth.uid() = host_id);

-- Game players: readable by all; you join/leave as yourself, host can remove
drop policy if exists game_players_select on game_players;
create policy game_players_select on game_players
  for select to authenticated using (true);

drop policy if exists game_players_insert on game_players;
create policy game_players_insert on game_players
  for insert to authenticated with check (
    auth.uid() = profile_id
    and exists (
      select 1 from games g
      where g.id = game_id
        and g.status = 'open'
        and (select count(*) from game_players p where p.game_id = g.id) < g.slots_total
    )
  );

drop policy if exists game_players_delete on game_players;
create policy game_players_delete on game_players
  for delete to authenticated using (
    auth.uid() = profile_id
    or auth.uid() = (select host_id from games g where g.id = game_id)
  );

-- Messages: only that game's players can read or post
drop policy if exists game_messages_select on game_messages;
create policy game_messages_select on game_messages
  for select to authenticated using (
    exists (
      select 1 from game_players p
      where p.game_id = game_messages.game_id and p.profile_id = auth.uid()
    )
  );

drop policy if exists game_messages_insert on game_messages;
create policy game_messages_insert on game_messages
  for insert to authenticated with check (
    auth.uid() = profile_id
    and exists (
      select 1 from game_players p
      where p.game_id = game_messages.game_id and p.profile_id = auth.uid()
    )
  );

-- Blocks & reports: you manage your own
drop policy if exists blocks_all on blocks;
create policy blocks_all on blocks
  for all to authenticated using (auth.uid() = blocker_id) with check (auth.uid() = blocker_id);

drop policy if exists reports_insert on reports;
create policy reports_insert on reports
  for insert to authenticated with check (auth.uid() = reporter_id);

-- ---------------------------------------------------------------------------
-- Seed courses (launch metro placeholder — edit freely)
-- ---------------------------------------------------------------------------
insert into courses (name, city, state, holes)
select * from (values
  ('Stone Creek Golf Club', 'Urbana', 'IL', 18),
  ('Lake of the Woods Golf Club', 'Mahomet', 'IL', 18),
  ('University of Illinois Orange Course', 'Savoy', 'IL', 18),
  ('University of Illinois Blue Course', 'Savoy', 'IL', 18),
  ('Urbana Country Club', 'Urbana', 'IL', 18),
  ('Willow Pond Golf Course', 'Rantoul', 'IL', 9)
) as v(name, city, state, holes)
where not exists (select 1 from courses);
