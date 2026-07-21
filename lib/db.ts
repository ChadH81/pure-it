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

// --- Handicap tracker --------------------------------------------------------

export type TeeOption = {
  course_id: string;
  course_name: string;
  tee_id: string;
  tee_name: string;
  rating: number;
  slope: number;
};

export type RoundRow = {
  id: string;
  course_name: string;
  tee_name: string | null;
  rating: number;
  slope: number;
  score: number;
  date_played: string;
};

/** All courses with their known tees (for the score-entry dropdown). */
export async function listTeeOptions(): Promise<TeeOption[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("course_tees")
    .select("id, tee_name, rating, slope, courses ( id, name )")
    .order("tee_name");
  if (error) throw error;
  return (data ?? []).flatMap((t) => {
    const row = t as unknown as {
      id: string;
      tee_name: string;
      rating: number;
      slope: number;
      courses: { id: string; name: string } | null;
    };
    if (!row.courses) return [];
    return [{
      course_id: row.courses.id,
      course_name: row.courses.name,
      tee_id: row.id,
      tee_name: row.tee_name,
      rating: Number(row.rating),
      slope: row.slope,
    }];
  });
}

export async function listRounds(profileId: string): Promise<RoundRow[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("rounds")
    .select("id, course_name, tee_name, rating, slope, score, date_played")
    .eq("profile_id", profileId)
    .order("date_played", { ascending: false })
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((r) => ({ ...r, rating: Number(r.rating) })) as RoundRow[];
}

export type NewRound = {
  course_name: string;
  tee_name: string | null;
  rating: number;
  slope: number;
  score: number;
  date_played: string;
};

/**
 * Log a round. If the course/tee is new, quietly add it to the shared
 * database so the next golfer gets it in the dropdown.
 */
export async function addRound(profileId: string, input: NewRound): Promise<void> {
  const supabase = createClient();

  let courseId: string | null = null;
  const { data: existing } = await supabase
    .from("courses")
    .select("id")
    .ilike("name", input.course_name)
    .maybeSingle();

  if (existing) {
    courseId = existing.id as string;
  } else {
    const { data: created } = await supabase
      .from("courses")
      .insert({ name: input.course_name, source: "user_submitted" })
      .select("id")
      .single();
    courseId = (created?.id as string) ?? null;
  }

  if (courseId && input.tee_name) {
    await supabase.from("course_tees").upsert(
      {
        course_id: courseId,
        tee_name: input.tee_name,
        rating: input.rating,
        slope: input.slope,
      },
      { onConflict: "course_id,tee_name", ignoreDuplicates: true }
    );
  }

  const { error } = await supabase.from("rounds").insert({
    profile_id: profileId,
    course_id: courseId,
    course_name: input.course_name,
    tee_name: input.tee_name,
    rating: input.rating,
    slope: input.slope,
    score: input.score,
    date_played: input.date_played,
  });
  if (error) throw error;
}

export async function deleteRound(id: string): Promise<void> {
  const supabase = createClient();
  const { error } = await supabase.from("rounds").delete().eq("id", id);
  if (error) throw error;
}

/** Store the computed index on the profile so games show a tracked handicap. */
export async function saveHandicap(profileId: string, index: number | null) {
  const supabase = createClient();
  await supabase.from("profiles").update({ handicap: index }).eq("id", profileId);
}
