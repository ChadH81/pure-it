# Pure it!

**Free golf side-game calculators + a casual scoring tracker.** Settle Nassau,
Skins, Wolf, Vegas, Match Play, and balance Scramble teams in seconds — no
sign-up, no ads. Track how you're playing with ASAP, and share results or run a
live scoreboard your whole group can watch.

**Status:** live on Vercel. Six calculators, share/OG loop, live Skins scoreboard,
remembered groups, SEO/PWA.

> **New here / AI agent?** Read [`CLAUDE.md`](CLAUDE.md) first — it's the current
> source of truth. See [`docs/DECISIONS.md`](docs/DECISIONS.md) for the "why" and
> [`docs/ROADMAP.md`](docs/ROADMAP.md) for what's next.
>
> _Note: this project pivoted away from partner-matching. `docs/SPEC.md` describes
> that old product and is kept for history only._

## Stack
- [Next.js 15](https://nextjs.org) (App Router, TypeScript, React 19)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Supabase](https://supabase.com) (auth, database, realtime)
- [Vercel](https://vercel.com) (hosting; push to `main` to deploy)

## Getting started
Requires Node.js 20+.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # production build (the real deploy gate)
```

### Environment
Create `.env.local` (and set the same in Vercel):

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_SITE_URL=https://your-domain   # for absolute share/OG URLs
```

### Database
Run the SQL files in [`supabase/`](supabase/) once each in the Supabase SQL
editor (see [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md)). The live
scoreboard needs `migration-live-games.sql` and Realtime enabled.

## Project layout
See [`CLAUDE.md`](CLAUDE.md#repo-map) for the full map. Game math lives in
`lib/games.ts` (pure, unit-tested); calculators are under `app/games/*`.
