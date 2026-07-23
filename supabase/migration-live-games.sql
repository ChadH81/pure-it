-- Pure it! — live shared games (host enters, everyone watches)
-- ============================================================================
-- A "live game" is a short-coded, real-time session. The host creates it and
-- enters scores; anyone with the code (via QR or link) subscribes and watches
-- the scoreboard update live. Writes are gated by a random host_token so only
-- the host can change scores — viewers are read-only.
--
-- Run once in the Supabase SQL Editor. Safe to re-run.

create extension if not exists pgcrypto;

create table if not exists live_games (
  id          uuid primary key default gen_random_uuid(),
  code        text unique not null,           -- short share code (in the URL / QR)
  game_type   text not null,                  -- 'skins', etc.
  state       jsonb not null default '{}'::jsonb,
  host_token  text not null,                  -- secret; only the host holds it
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '12 hours'
);

create index if not exists live_games_code_idx on live_games (code);

alter table live_games enable row level security;

-- Anyone can READ a session (needed for viewers + realtime subscription).
drop policy if exists "live read" on live_games;
create policy "live read" on live_games for select using (true);

-- Anyone can CREATE a session (hosts may be signed out).
drop policy if exists "live insert" on live_games;
create policy "live insert" on live_games for insert with check (true);

-- No UPDATE/DELETE policy: score changes only happen through live_update(),
-- which checks the host_token. That keeps viewers read-only.

create or replace function live_update(p_code text, p_token text, p_state jsonb)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  update live_games
     set state = p_state, updated_at = now()
   where code = p_code
     and host_token = p_token
     and expires_at > now();
end;
$$;

grant execute on function live_update(text, text, jsonb) to anon, authenticated;

-- Broadcast row changes over Realtime so viewers update instantly.
do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'live_games'
  ) then
    alter publication supabase_realtime add table live_games;
  end if;
end $$;

-- Optional housekeeping: delete expired sessions (safe to run anytime / cron).
-- delete from live_games where expires_at < now();
