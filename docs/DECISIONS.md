# Decisions & Rationale

A running log of the significant product, legal, and technical choices — so we
(and future sessions) don't re-litigate settled questions. Newest at top.

## Product

- **Pivoted from partner-matching → free game calculators + ASAP tracker.**
  Matching is a cold-start marketplace (worthless until dense in a region) and is
  what sank prior golf-matching apps. Calculators are useful to one person on day
  one, rank in search, and are share/group-native. Matching may return later,
  seeded by the audience the tools build. All matching routes/code were removed;
  Supabase matching tables were left dormant.
- **Calculator lineup (6):** Nassau, Skins, Wolf (core betting), Vegas (2v2 money,
  chosen over Bingo-Bango-Bongo for popularity + score-based fit + clean input),
  Match Play (counter), Scramble (team balancer). Stableford and Best Ball are
  the leading candidates for #7/#8.
- **Live shared scoreboard model = "host enters, everyone watches"** (chosen over
  collaborative editing) for a robust v1 with no edit-conflict handling. Skins
  first (most multiplayer, score-based). Extend to Wolf/Vegas later.

## Legal / data (important — stay on this side of the line)

- **Removed all Course Rating & Slope data** that originated from a governing
  body's compiled database (was seeded from Golf Canada). That compiled DB is the
  legally sensitive part (ToS + compilation copyright). `migration-remove-seeded-
  ratings.sql` purges it from live data; seed migrations keep only course
  name/city/coords (plain facts).
- **Rating/slope is now user-supplied per round** (crowdsourced), never held as a
  redistributed database.
- **No trademarked terms.** Avoid "Handicap Index®", "WHS™", "Course Rating™",
  "Slope Rating®", and implying USGA/R&A/Golf Canada affiliation. Disclaimers on
  the ASAP page + footer state it's unofficial and not for competition.
- **Course data collection stance (for the future course DB):** OK to gather
  factual scorecard data (par, stroke index, yardage) from **primary sources**
  (a course's own site/scorecard) or by **crowdsourcing** or a **licensed dataset**
  (GolfAPI.io / GolfCourseAPI). **Not OK** to bulk-scrape an aggregator's compiled
  database. We likely **don't need rating/slope** for the games — par + stroke
  index suffice, which is cheaper and avoids the protected fields.

## Branding

- **Metric name:** coined our own to avoid "Handicap Index®". Journey:
  "Pure it! handicap" → "Average Strokes Above Par (ASAP)" → **"Adjusted Strokes
  Against Par (ASAP)"**. "Adjusted" is more accurate (it reflects rating/slope
  adjustment). Acronym **ASAP kept** as a light brand hook; the code slug stays
  `asap`. A trademark clearance pass on the app name + "ASAP" is still TODO.

## Design

- **Theme evolved:** light cream → glossy near-black → **graphite/silver
  "business-smart"** with a brushed-metal shimmer headline, gunmetal glass
  `result-card` panels with an emerald glow, and champagne accents. Chad's
  keeper. Tokens in `app/globals.css`; don't hardcode light-mode classes.

## Technical

- **Game math is pure and unit-tested** in `lib/games.ts` (node `--experimental-
  strip-types` tests before UI wiring). Keeps calculators correct and reviewable.
- **Sharing** encodes a compact payload (`lib/share.ts`, base64url, works in
  browser/edge/node) into `/r/[game]` pages with dynamic `next/og` images.
- **Live games** use a `live_games` table with public read + a host-token-gated
  `live_update()` RPC (viewers are read-only) + Supabase Realtime; 12h auto-expiry.
- **Verification** is `tsc --noEmit` in-sandbox (npm/next build can't run here);
  human runs `npm run build` as the deploy gate.
