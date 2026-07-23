# Pure it! — Project Context (read me first)

> This file is the single source of truth for what **Pure it!** is today and how
> to work in this repo. If you're an AI agent starting a fresh session, read this
> top to bottom before doing anything. For _why_ we made key choices, see
> [`docs/DECISIONS.md`](docs/DECISIONS.md). For _what's next_, see
> [`docs/ROADMAP.md`](docs/ROADMAP.md).

_Last updated: 2026-07-22._

## What it is

**Pure it!** is a suite of **free golf side-game calculators** plus a personal
scoring tracker. It settles who-owes-who from a scorecard in seconds — no
sign-up, no ads. A signed-in extra ("ASAP") tracks how you're playing over time.

> ⚠️ **The product pivoted.** It began as a "Tinder-for-golf" partner-matching
> app. That was **removed**. `docs/SPEC.md` and parts of git history describe the
> old matching product and are **historical only** — ignore them for current work.

### Features (all shipped)
- **6 game calculators** at `/games/*`: **Nassau**, **Skins**, **Wolf**,
  **Vegas** (2v2 + birdie flip), **Match Play** (counter), **Scramble** (team
  balancer). All math lives in `lib/games.ts` and is unit-tested.
- **ASAP** (`/handicap`): a signed-in round tracker producing "Adjusted Strokes
  Against Par (ASAP)" — a casual, unofficial handicap-style number.
- **Share loop**: every result builds a `/r/[game]?d=...` link with a dynamic
  Open Graph image (`/og`) that unfurls in group chats.
- **Live shared scoreboard** (Skins): host taps "Go live" → QR code → viewers
  watch scores update in real time (Supabase Realtime).
- **Remembered groups**: save a roster once, one-tap reload it in any calculator
  (localStorage, no account).
- **SEO/PWA**: sitemap, robots, per-page metadata + JSON-LD, installable manifest.

## Stack
- **Next.js 15** (App Router, TypeScript, React 19), **Tailwind CSS v4**.
- **Supabase** (Postgres + Auth + Realtime) for accounts, ASAP rounds, and live games.
- **Vercel** hosting. Deploy = push to `main` → auto-deploy.

## Repo map
```
app/
  page.tsx                 Landing (hero, calculator grid, ASAP band)
  games/page.tsx           Calculator hub
  games/{nassau,skins,wolf,vegas,match-play,scramble}/
                           page.tsx (client UI) + layout.tsx (metadata + JSON-LD)
  handicap/page.tsx        ASAP tracker (auth-gated)
  live/[code]/page.tsx     Live shared scoreboard (host edits / viewer reads)
  r/[game]/page.tsx        Public shared-result page (+ OG metadata)
  og/route.tsx             Dynamic OG image (next/og, edge)
  profile, login/          Account pages
  sitemap.ts, robots.ts, manifest.ts, icon.svg
components/
  Nav, Footer, ShareButton, GroupBar, QrCode, JsonLd, icons.tsx
lib/
  games.ts                 ALL game math (pure, tested): nassau/skins/wolf/vegas/
                           matchPlay/balanceTeams
  handicap.ts              ASAP index math
  share.ts                 base64url codec for share payloads
  live.ts                  Supabase Realtime helpers (create/fetch/subscribe/push)
  groups.ts, useLocalStorage.ts
  db.ts                    Supabase queries (profile + ASAP rounds)
  site.ts                  SITE_URL + JSON-LD builders
  supabase/                client.ts, server.ts, middleware.ts
supabase/                  *.sql migrations (run manually in Supabase SQL editor)
docs/                      DECISIONS.md, ROADMAP.md, SUPABASE_SETUP.md, SPEC.md(legacy)
```

## Conventions
- **Design tokens** live in `app/globals.css` (`--fairway`, `--ink`, `--muted`,
  `--line`, etc.). Theme is dark **graphite/silver**. Reuse `.card`,
  `.result-card`, `.field`, `.btn-primary`, `.btn-ghost`, `.chip`, `.eyebrow`,
  `.shine-text`. **Never hardcode `bg-white`/`text-gray-*`** — use tokens.
- **Game math is pure & tested.** Add new game logic to `lib/games.ts` as pure
  functions and add a node test before wiring UI (see how existing ones are tested).
- **ASAP naming**: user-facing text says "Adjusted Strokes Against Par (ASAP)".
  The **code slug stays `asap`** (route `/r/asap`, share `game: "ASAP"`) — do not
  rename the slug.
- **Share**: build payloads with `shareUrl(slug, {...})` from `lib/share.ts` and
  pass `url` to `<ShareButton>`.
- New calculator checklist: pure fn in `lib/games.ts` (+test) → `page.tsx` +
  `layout.tsx` (metadata + `calcLd`) → icon in `components/icons.tsx` → add to
  `app/page.tsx` + `app/games/page.tsx` grids → `app/sitemap.ts` → `CALC_SLUGS`
  in `app/r/[game]/page.tsx` → `<GroupBar>` if it has a roster.

## Verify / build
- **Type-check (the reliable check here):** `./node_modules/.bin/tsc --noEmit`
  (exit 0 = clean). Run after every change.
- `npm run build` is the real deploy gate (strict). **Note:** in the sandbox
  `npm install` / `next build` / `next lint` can't run (no network for the swc
  binary), so `tsc` is the proxy and the human runs `npm run build` before deploy.
- Commit style: short imperative subject + a body summarizing what/why.

## Environment & setup
Env vars (Vercel → Settings → Environment Variables, and `.env.local` for dev):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` — required.
- `NEXT_PUBLIC_SITE_URL` — production URL (e.g. `https://pure-it.vercel.app`) so
  OG/share/sitemap URLs are absolute. Falls back to `VERCEL_URL` then localhost.

**Migrations** (run once each in the Supabase SQL editor; see `supabase/`):
- schema/auth/profiles, ASAP `courses`+`course_tees`+`rounds`,
  `migration-remove-seeded-ratings.sql` (legal cleanup),
  `migration-live-games.sql` (live scoreboard — needed for `/live` to work).

## Known caveats / to-verify live
- **Live scoreboard** requires `migration-live-games.sql` + Realtime enabled;
  only truly testable with two devices against the real DB.
- **OG images** only render in a real deploy — verify via a shared link / opengraph.xyz.
- **QR** is rendered via a third-party image service (only the game code is sent);
  swappable for a bundled generator later.
