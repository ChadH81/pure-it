"use client";

import { createClient } from "@/lib/supabase/client";

// --- Types matching the database enums -------------------------------------

export type GameFormat = "casual_9" | "casual_18" | "best_ball_2v2" | "scramble";
export type Pace = "relaxed" | "steady" | "fast";
export type WalkRide = "walk" | "ride" | "either";

export type GameRow = {
  id: string;
  host_id: string;
  course_name: string;
  city: string | null;
  tee_time: string;
  format: GameFormat;
  slots_total: number;
  status: "open" | "full" | "completed" | "cancelled";
  notes: string | null;
  hcp_min: number | null;
  hcp_max: number | null;
  pace: Pace | null;
  walk_or_ride: WalkRide | null;
  created_at: string;
};

export type PlayerRow = {
  profile_id: string;
  display_name: string;
  handicap: number | null;
};

export type GameWithPlayers = GameRow & {
  host: { display_name: string; handicap: number | null } | null;
  players: PlayerRow[];
};

export type MessageRow = {
  id: string;
  body: string;
  created_at: string;
  profile_id: string;
  author: string;
};

// --- Queries ----------------------------------------------------------------

const GAME_SELECT = `
  *,
  host:profiles!games_host_id_fkey ( display_name, handicap ),
  game_players ( profile_id, profiles ( display_name, handicap ) )
`;

type RawGame = GameRow & {
  host: { display_name: string; handicap: number | null } | null;
  game_players: {
    profile_id: string;
    profiles: { display_name: string; handicap: number | null } | null;
  }[];
};

function shape(row: RawGame): GameWithPlayers {
  const { game_players, ...rest } = row;
  return {
    ...rest,
    players: (game_players ?? []).map((p) => ({
      profile_id: p.profile_id,
      display_name: p.profiles?.display_name ?? "Golfer",
      handicap: p.profiles?.handicap ?? null,
    })),
  };
}

export async function listGames(): Promise<GameWithPlayers[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("games")
    .select(GAME_SELECT)
    .gte("tee_time", new Date().toISOString())
    .order("tee_time", { ascending: true });
  if (error) throw error;
  return (data as unknown as RawGame[]).map(shape);
}

export async function getGame(id: string): Promise<GameWithPlayers | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("games")
    .select(GAME_SELECT)
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  return data ? shape(data as unknown as RawGame) : null;
}

export type NewGame = {
  course_name: string;
  city: string | null;
  tee_time: string;
  format: GameFormat;
  slots_total: number;
  notes: string | null;
  hcp_min: number | null;
  hcp_max: number | null;
  pace: Pace | null;
  walk_or_ride: WalkRide;
};

export async function createGame(input: NewGame, hostId: string): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("games")
    .insert({ ...input, host_id: hostId })
    .select("id")
    .single();
  if (error) throw error;
  return data.id as string;
}

export async function joinGame(gameId: string, profileId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("game_players")
    .insert({ game_id: gameId, profile_id: profileId });
  if (error) throw error;
}

export async function leaveGame(gameId: string, profileId: string) {
  const supabase = createClient();
  const { error } = await supabase
    .from("game_players")
    .delete()
    .eq("game_id", gameId)
    .eq("profile_id", profileId);
  if (error) throw error;
}

export async function listMessages(gameId: string): Promise<MessageRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("game_messages")
    .select("id, body, created_at, profile_id, profiles ( display_name )")
    .eq("game_id", gameId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []).map((m) => {
    const row = m as unknown as {
      id: string;
      body: string;
      created_at: string;
      profile_id: string;
      profiles: { display_name: string } | null;
    };
    return {
      id: row.id,
      body: row.body,
      created_at: row.created_at,
      profile_id: row.profile_id,
      author: row.profiles?.display_name ?? "Golfer",
    };
  });
}

export async function sendMessage(
  gameId: string,
  profileId: string,
  body: string
) {
  const supabase = createClient();
  const { error } = await supabase
    .from("game_messages")
    .insert({ game_id: gameId, profile_id: profileId, body: body.trim() });
  if (error) throw error;
}

export async function updateProfile(
  id: string,
  fields: {
    display_name?: string;
    bio?: string | null;
    home_city?: string | null;
    handicap?: number | null;
    pace?: Pace;
    vibe?: "casual" | "social" | "competitive";
    walk_or_ride?: WalkRide;
  }
) {
  const supabase = createClient();
  const { error } = await supabase.from("profiles").update(fields).eq("id", id);
  if (error) throw error;
}

export async function listCourseNames(): Promise<string[]> {
  const supabase = createClient();
  const { data } = await supabase.from("courses").select("name").order("name");
  return (data ?? []).map((c) => c.name as string);
}
