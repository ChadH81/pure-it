import type { GameFormat, Pace, WalkRide, GameRow } from "@/lib/db";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function formatTeeTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const ampm = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${DAYS[d.getDay()]}, ${MONTHS[d.getMonth()]} ${d.getDate()} · ${h12}:${min} ${ampm}`;
}

export const FORMAT_LABELS: Record<GameFormat, string> = {
  casual_18: "Casual 18",
  casual_9: "Casual 9",
  best_ball_2v2: "2v2 Best Ball",
  scramble: "Scramble",
};

export const PACE_LABELS: Record<Pace, string> = {
  relaxed: "Relaxed",
  steady: "Steady",
  fast: "Fast",
};

export const WALK_LABELS: Record<WalkRide, string> = {
  walk: "Walk",
  ride: "Ride",
  either: "Either",
};

export function prefsLine(game: GameRow): string {
  const parts: string[] = [];
  if (game.hcp_min != null && game.hcp_max != null)
    parts.push(`Handicap ${game.hcp_min}–${game.hcp_max}`);
  else if (game.hcp_max != null) parts.push(`Handicap under ${game.hcp_max}`);
  else if (game.hcp_min != null) parts.push(`Handicap ${game.hcp_min}+`);
  if (game.pace) parts.push(`${PACE_LABELS[game.pace]} pace`);
  if (game.walk_or_ride && game.walk_or_ride !== "either")
    parts.push(WALK_LABELS[game.walk_or_ride]);
  return parts.join(" · ") || "All golfers welcome";
}
