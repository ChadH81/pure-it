# Pure it! — Product Spec & Data Model (v0.1)

> ⚠️ **HISTORICAL / SUPERSEDED.** This spec describes the original
> partner-**matching** product, which was removed in the pivot to free game
> calculators + the ASAP tracker. It's kept for history only. For the current
> product see [`../CLAUDE.md`](../CLAUDE.md), [`DECISIONS.md`](DECISIONS.md), and
> [`ROADMAP.md`](ROADMAP.md).

_Last updated: July 8, 2026_

## 1. One-liner

Post a round at a course near you, or join one — matched by handicap, pace,
and playing preferences. A game board for golfers, not a swipe app.

## 2. The problem

Golfers who want to play can't reliably find compatible partners. Courses pair
singles randomly; group chats go stale; existing apps (GolfMatch, goolf) died
because matching alone didn't create a habit. The unit of value is a **round
with a real tee time**, not a "match."

## 3. Target user (launch)

- Golfers in one launch metro (TBD) who play 1+ times/month
- Solo/duo players wanting a full group, new-to-town golfers, retirees with
  flexible schedules, after-work 9-hole players

## 4. MVP scope

### In

- Account + profile (handicap, home course, preferences, photo, bio)
- Game board: browse public games by area/date, filtered by preferences
- Host a round: course, date/time, format, open slots, partner preferences
- Join a round instantly; host can remove a player; leave anytime
- Per-game message thread (players + host only)
- Course list: seeded manually for launch metro + free-text fallback
- Block user + report user/game (minimum viable trust & safety)
- Email + Google sign-in (Supabase Auth)

### Out (phase 2+)

- Tee-time booking / payments / course partnerships
- Handicap calculator (v1 = self-reported number)
- Direct messages, duo discounts, coach subscriptions, course ads
- Age/gender preference filters (deferred pending legal review; see §8)
- Native mobile apps (v1 = responsive web, installable PWA later)
- Ratings/reviews of players (revisit once there's volume)

## 5. Core flows

1. **Onboard:** sign up → display name, photo → handicap (self-reported) +
   preferences (pace, walk/ride, vibe) → home area
   (city or geolocation).
2. **Host:** pick course → date/tee time → format (casual 9/18, 2v2 best
   ball, scramble) → open slots → partner preferences (handicap range,
   pace, walk/ride) → optional note → post.
3. **Join:** browse board (default: 25-mile radius, next 14 days, games
   whose preferences I fit and vice versa) → game detail → join → thread
   opens for coordination.
4. **Play & close:** game auto-completes after tee time passes; host may
   cancel (players notified).

**Preference semantics:** preferences are *filters on visibility/join*, set
per-game by the host. A user who doesn't fit sees the game greyed out with
"outside host preferences" (not hidden — reduces confusion) and cannot join.

## 6. Screens (MVP)

Landing · Auth · Onboarding (3 steps) · Game board (list; map later) ·
Game detail + thread · Host form · My games (upcoming/past) · Profile
(mine + public view) · Report/block dialogs · Settings

## 7. Data model (Postgres / Supabase)

```sql
-- Enums
create type game_format as enum ('casual_9','casual_18','best_ball_2v2','scramble');
create type game_status as enum ('open','full','completed','cancelled');
create type player_status as enum ('joined','removed','left');
create type pace_pref as enum ('relaxed','steady','fast');
create type vibe_pref as enum ('casual','social','competitive');
create type walk_ride as enum ('walk','ride','either');

-- Profiles: 1:1 with auth.users
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  bio text,
  home_city text,
  home_point geography(point),          -- for radius search
  handicap numeric(4,1),                 -- self-reported in v1
  pace pace_pref default 'steady',
  vibe vibe_pref default 'casual',
  walk_or_ride walk_ride default 'either',
  created_at timestamptz default now()
);

-- Courses: seeded for launch metro; users can submit missing ones
create table courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  state text,
  point geography(point),
  holes int default 18,
  source text default 'seed',            -- 'seed' | 'user_submitted'
  created_at timestamptz default now()
);

-- Games: the core object
create table games (
  id uuid primary key default gen_random_uuid(),
  host_id uuid not null references profiles(id) on delete cascade,
  course_id uuid not null references courses(id),
  tee_time timestamptz not null,
  format game_format not null default 'casual_18',
  slots_total int not null default 4 check (slots_total between 2 and 8),
  status game_status not null default 'open',
  notes text,
  -- host's partner preferences (null = no restriction)
  hcp_min numeric(4,1),
  hcp_max numeric(4,1),
  pace_pref pace_pref,
  walk_pref walk_ride,
  created_at timestamptz default now()
);
create index games_teetime_idx on games (tee_time) where status = 'open';
create index courses_point_idx on courses using gist (point);

-- Membership: host is also a row (role derived from games.host_id)
create table game_players (
  game_id uuid references games(id) on delete cascade,
  profile_id uuid references profiles(id) on delete cascade,
  status player_status not null default 'joined',
  joined_at timestamptz default now(),
  primary key (game_id, profile_id)
);

-- Per-game thread
create table game_messages (
  id uuid primary key default gen_random_uuid(),
  game_id uuid not null references games(id) on delete cascade,
  profile_id uuid not null references profiles(id) on delete cascade,
  body text not null check (char_length(body) <= 2000),
  created_at timestamptz default now()
);

-- Trust & safety
create table blocks (
  blocker_id uuid references profiles(id) on delete cascade,
  blocked_id uuid references profiles(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (blocker_id, blocked_id)
);
create table reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references profiles(id),
  subject_profile_id uuid references profiles(id),
  subject_game_id uuid references games(id),
  reason text not null,
  created_at timestamptz default now()
);
```

**Row-level security (Supabase):** profiles readable by any signed-in user
(public fields only); games readable by all, writable by host; game_players
insertable by self when game is open + preferences fit; messages readable/
writable only by that game's players; blocks/reports writable by self.
Blocked users' games and messages are filtered out of each other's views.

**Derived logic (app or SQL views):** `slots_open = slots_total − active
players`; auto-set `status = 'full'` on join when slots hit 0; nightly job
marks past games `completed`.

## 8. Legal & safety notes

- **Age/gender preference filters are deferred by owner decision** to avoid
  discrimination-claim exposure (e.g., California's Unruh Act). Matching in
  v1 is golf-only: handicap, pace, walk/ride, vibe. If demand emerges,
  revisit with an attorney (possible framings: host-side preferences like a
  private group, women's/senior league *events* rather than filters).
- Real-name-ish profiles + report/block from day one; host can remove
  disruptive players; minimum age 18 in Terms of Service.
- Location: store only coarse home point (city-level) by default; exact
  location never shown to other users — only distance/course.

## 9. Success metrics (first 90 days post-launch)

- **Liquidity (north star):** % of posted games that get ≥1 joiner within
  48h (target 50%+); median time-to-first-join
- Games completed per weekly active user; % of joiners who host later
- Week-4 retention of users who completed a round vs. those who didn't

## 10. Roadmap

1. **Now:** host form + game detail + thread on mock data
2. Supabase: auth, schema above, RLS; real games persist
3. Map view + course seed for launch metro; geolocation radius search
4. Beta with a real golf group; watch liquidity metric
5. Phase 2: handicap estimator, booking/commission pilot with 5–10 courses,
   duo discounts, 2v2 team mechanics, coach listings
