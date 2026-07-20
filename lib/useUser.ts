"use client";

import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

export type Profile = {
  id: string;
  display_name: string;
  bio: string | null;
  home_city: string | null;
  handicap: number | null;
  pace: "relaxed" | "steady" | "fast" | null;
  vibe: "casual" | "social" | "competitive" | null;
  walk_or_ride: "walk" | "ride" | "either" | null;
};

/** Current signed-in user + their profile row. */
export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function load(u: User | null) {
      if (!u) {
        if (active) {
          setUser(null);
          setProfile(null);
          setLoading(false);
        }
        return;
      }
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", u.id)
        .single();
      if (active) {
        setUser(u);
        setProfile((data as Profile) ?? null);
        setLoading(false);
      }
    }

    supabase.auth.getUser().then(({ data }) => load(data.user));

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      load(session?.user ?? null);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { user, profile, loading };
}
