# Supabase setup — one-time steps

These are the steps only you can do (they need your accounts). Should take
about 15 minutes. Do them in order, then tell Claude you're done.

---

## 1. Create the project

1. Go to [supabase.com](https://supabase.com) → **Start your project** → sign in
   with GitHub (easiest — you already have an account).
2. **New project**:
   - Organization: create one (any name, e.g. "Pure it")
   - Name: `pure-it`
   - Database password: click **Generate a password** and **save it in your
     password manager**. You won't need it day to day, but it can't be recovered.
   - Region: pick the one closest to you (e.g. East US)
   - Plan: **Free**
3. Click **Create new project** and wait ~2 minutes while it provisions.

---

## 2. Run the database schema

1. In your project, click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open `supabase/schema.sql` from this project in VS Code, copy the **entire
   file**, and paste it into the editor.
4. Click **Run** (or Ctrl+Enter).

You should see "Success. No rows returned." Verify by clicking **Table Editor**
in the sidebar — you should see `profiles`, `courses`, `games`, `game_players`,
`game_messages`, `blocks`, and `reports`, with six rows already in `courses`.

---

## 3. Turn on Google sign-in (optional today, easy to add later)

Email sign-in works out of the box — you can skip this and come back to it.

1. **Authentication** → **Sign In / Providers** → enable **Google**.
2. It will ask for a Client ID and Secret from Google Cloud Console. If that
   feels like a detour, skip it for now; email sign-in is enough to build on.

---

## 4. Copy your API keys into the project

1. In Supabase: **Project Settings** (gear icon) → **API Keys**.
2. Copy two values:
   - **Project URL** — from Settings → **Data API**; looks like
     `https://abcdefgh.supabase.co`
   - **Publishable key** — on the API Keys page, starts with `sb_publishable_`
     (this is the new name for what used to be called the "anon key")

   ⚠️ Do **not** use the **Secret key** on that page. It bypasses all row-level
   security and must never appear in the app, in git, or in a chat window.
3. In VS Code, make a copy of `.env.local.example` in the project root and
   name the copy **`.env.local`**.
4. Paste your two values in, so it reads:

```
NEXT_PUBLIC_SUPABASE_URL=https://abcdefgh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_xxxxxxxxxxxx
```

(The variable name still says ANON_KEY — that's just our label, and the
Supabase library accepts the publishable key there.)

5. Save. Restart the dev server (Ctrl+C in the terminal, then `npm run dev`).

**Is it safe that this key is in the browser?** Yes — it's designed to be
public. Security comes from the Row Level Security policies in `schema.sql`,
which control what any given signed-in user can read or write.

---

## 5. Install the new packages

In the VS Code terminal:

```
npm install
```

This pulls in `@supabase/supabase-js` and `@supabase/ssr`.

---

## 6. Add the same keys to Vercel (so the live site works)

1. Go to your project on [vercel.com](https://vercel.com) → **Settings** →
   **Environment Variables**.
2. Add both variables with the same names and values as `.env.local`.
3. **Deployments** tab → latest deployment → **⋯** → **Redeploy**.

---

## Done?

Tell Claude "Supabase is set up" and he'll wire the app to it: real sign-up
and sign-in, profiles, and games that persist.

**Note:** free projects pause after 7 days with no activity. If the app ever
seems dead after a break, open the Supabase dashboard and click **Restore**.
