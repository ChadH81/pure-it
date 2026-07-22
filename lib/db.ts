"use client";

import { createClient } from "@/lib/supabase/client";

// --- Profile -----------------------------------------------------------------

export async function updateProfile(
  id: string,
  fields: {
    display_name?: string;
    bio?: string | null;
    home_city?: string | null;
    handicap?: number | null;
  }
) {
  const supabase = createClient();
  const { error } = await supabase.from("profiles").update(fields).eq("id", id);
  if (error) throw error;
}

// --- ASAP tracker (handicap-style rounds) ------------------------------------

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
    return [
      {
        course_id: row.courses.id,
        course_name: row.courses.name,
        tee_id: row.id,
        tee_name: row.tee_name,
        rating: Number(row.rating),
        slope: row.slope,
      },
    ];
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
 * database so the next golfer gets it in the dropdown (crowdsourced ratings).
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

/** Store the computed ASAP number on the profile. */
export async function saveHandicap(profileId: string, index: number | null) {
  const supabase = createClient();
  await supabase.from("profiles").update({ handicap: index }).eq("id", profileId);
}
