"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for use in browser ("use client") components.
 * Reads config from .env.local — see .env.local.example.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

/** True when Supabase env vars are present. Lets the app fall back to mock data. */
export const supabaseConfigured =
  !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
  !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
