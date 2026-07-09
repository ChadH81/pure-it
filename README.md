# Pure it!

Find your next golf game. Post a round at a course near you, or join one —
matched by handicap, pace, and playing preferences.

**Status:** early prototype (mock data, no backend yet).

## Stack

- [Next.js 15](https://nextjs.org) (App Router, TypeScript)
- [Tailwind CSS v4](https://tailwindcss.com)
- Planned: Supabase (auth + database), Mapbox (course map), Vercel (hosting)

## Getting started

Requires [Node.js](https://nodejs.org) 20+.

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## One-time git setup (run on your machine)

In VS Code's terminal (or any terminal) inside this folder:

```bash
git init -b main
git add .
git commit -m "Initial scaffold: Next.js + Tailwind, landing + game board"
```

Then to publish to GitHub (after creating an empty repo named `pure-it` there):

```bash
git remote add origin https://github.com/YOUR_USERNAME/pure-it.git
git push -u origin main
```

## Roadmap (MVP)

1. Game board: browse/post/join rounds (mock data → Supabase)
2. Profiles: handicap, home course, preferences
3. Auth (email + Google via Supabase)
4. Course search + map
5. In-app chat after joining a game
6. Later: handicap estimator, duo discounts, 2v2 formats, coach listings
