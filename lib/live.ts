"use client";

import { createClient } from "@/lib/supabase/client";
import type { Score } from "@/lib/games";

/** Shared state for a live Skins game. Extendable per game_type later. */
export type LiveState = {
  game: "skins";
  names: string[];
  scores: Score[][];
  value: number;
  carryover: boolean;
};

const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no ambiguous 0/O/1/I

function randomCode(len = 6): string {
  const bytes = new Uint8Array(len);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("");
}

/** Create a session. Returns the share code and the host's secret token. */
export async function createLive(
  state: LiveState
): Promise<{ code: string; hostToken: string }> {
  const supabase = createClient();
  const code = randomCode();
  const hostToken =
    typeof crypto.randomUUID === "function" ? crypto.randomUUID() : randomCode(24);

  const { error } = await supabase
    .from("live_games")
    .insert({ code, game_type: state.game, state, host_token: hostToken });
  if (error) throw error;

  return { code, hostToken };
}

/** One-time read of the current state for a code. */
export async function fetchLive(code: string): Promise<LiveState | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("live_games")
    .select("state")
    .eq("code", code)
    .maybeSingle();
  if (error) throw error;
  return (data?.state as LiveState | undefined) ?? null;
}

/** Subscribe to live updates for a code. Returns an unsubscribe function. */
export function subscribeLive(code: string, onState: (state: LiveState) => void): () => void {
  const supabase = createClient();
  const channel = supabase
    .channel(`live:${code}`)
    .on(
      "postgres_changes",
      { event: "UPDATE", schema: "public", table: "live_games", filter: `code=eq.${code}` },
      (payload) => {
        const next = (payload.new as { state?: LiveState }).state;
        if (next) onState(next);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/** Host-only write, gated by the host token via the live_update RPC. */
export async function pushLive(
  code: string,
  hostToken: string,
  state: LiveState
): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.rpc("live_update", {
    p_code: code,
    p_token: hostToken,
    p_state: state,
  });
  if (error) throw error;
}
