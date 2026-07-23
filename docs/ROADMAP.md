# Roadmap & Backlog

Living list of what's next. Not a promise of order — pick by value. Check items
off as they ship. See `DECISIONS.md` for context on settled choices.

## Now / operational (do these to fully light up what's built)
- [ ] **Push & deploy** tonight's commits (`git push` → Vercel auto-deploys).
- [ ] **Run `supabase/migration-live-games.sql`** in Supabase + confirm Realtime
      is enabled for `live_games` (required for `/live` to work).
- [ ] **Two-device live test:** deployed Skins → Go live → scan QR on a phone →
      host types a score → confirm it appears live.
- [ ] **Verify OG unfurl:** paste a `/r/...` share link into a chat or opengraph.xyz.
- [ ] **Set `NEXT_PUBLIC_SITE_URL`** in Vercel to the production domain.
- [ ] **Trademark clearance** self-check on "Pure it!" and "ASAP" /
      "Adjusted Strokes Against Par" (USPTO TESS + CIPO), golf/software classes.

## Near-term features
- [ ] **Course database + selection.** Schema: facility → nines → layouts
      (mix-and-match nines) → tees → per-(hole × tee) **par + stroke index**
      (+ optional yardage). Par varies by tee. Skip rating/slope. Then a course
      dropdown auto-fills pars (esp. for Vegas flip + future Stableford).
- [ ] **Course-data ingestion pipeline** (Chad wants to run via OpenRouter/agent):
      agent visits course sites → emits **structured JSON** (not raw SQL) →
      **validator** checks invariants (stroke index = permutation of 1–18; par
      3–6; 18 pars sum ~68–74; all holes present) → splits into load-ready vs
      **manual-review queue**. Feeds a crowdsource "confirm scorecard" flow as QA.
      _Next build step Chad asked for: the schema + validator scaffolding._
- [ ] **Stableford calculator** (#7): points vs par; needs par (+ stroke index for
      net). High search volume, league retention.
- [ ] **Best Ball / Vegas-style team betting** (#8 candidate).
- [ ] **Extend live scoreboard** to Wolf and Vegas (generalize `LiveState`).
- [ ] **Recent results / history** (local-save): a list of past games to revisit.

## Growth / infra
- [ ] **Analytics** (needs a package add by the human — sandbox can't `npm i`):
      Vercel Web Analytics or privacy-friendly alternative, to see what's used.
- [ ] **Bundled QR generator** to drop the third-party QR image service.
- [ ] **Accounts value**: save your groups + game history server-side (currently
      groups are localStorage-only).

## Later / bigger bets
- [ ] Broader course coverage via a **licensed dataset** when expanding beyond the
      SW-Ontario launch region.
- [ ] Revisit **partner-matching** once the tool audience is large enough to seed it.
- [ ] Net scoring / "strokes given" helper (needs stroke index from course DB).
