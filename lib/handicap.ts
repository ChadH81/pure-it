/**
 * Pure it!'s own scoring math. It turns a golfer's recent rounds into a single
 * "Average Strokes Above Par (ASAP)" number using standard score-differential
 * arithmetic (a public method, not anyone's proprietary system).
 *
 * ASAP is an unofficial estimate for casual play. It is not affiliated with,
 * endorsed by, or valid for competition under any golf governing body, and it
 * is not an official handicap of any kind.
 */

export type RoundInput = {
  score: number;
  rating: number;
  slope: number;
  date_played: string; // ISO date, used to pick the most recent 20
};

/** Score differential for one round, rounded to 1 decimal. */
export function differential(r: { score: number; rating: number; slope: number }): number {
  const d = ((r.score - r.rating) * 113) / r.slope;
  return Math.round(d * 10) / 10;
}

/**
 * Sliding scale: how many of the lowest differentials count, and any
 * adjustment, based on how many rounds are available (3–20).
 */
function scale(n: number): { use: number; adjustment: number } {
  if (n <= 3) return { use: 1, adjustment: -2.0 };
  if (n === 4) return { use: 1, adjustment: -1.0 };
  if (n === 5) return { use: 1, adjustment: 0 };
  if (n === 6) return { use: 2, adjustment: -1.0 };
  if (n <= 8) return { use: 2, adjustment: 0 };
  if (n <= 11) return { use: 3, adjustment: 0 };
  if (n <= 14) return { use: 4, adjustment: 0 };
  if (n <= 16) return { use: 5, adjustment: 0 };
  if (n <= 18) return { use: 6, adjustment: 0 };
  if (n === 19) return { use: 7, adjustment: 0 };
  return { use: 8, adjustment: 0 };
}

export type HandicapResult = {
  index: number | null;      // null until 3 rounds are logged
  roundsUsed: number;        // differentials counted
  roundsConsidered: number;  // rounds in the 20-round window
  roundsNeeded: number;      // more rounds needed before an index exists
};

/** Compute the handicap index from all logged rounds. */
export function handicapIndex(rounds: RoundInput[]): HandicapResult {
  const total = rounds.length;
  if (total < 3) {
    return {
      index: null,
      roundsUsed: 0,
      roundsConsidered: total,
      roundsNeeded: 3 - total,
    };
  }

  // Most recent 20 rounds by date (then recency of entry)
  const recent = [...rounds]
    .sort((a, b) => b.date_played.localeCompare(a.date_played))
    .slice(0, 20);

  const { use, adjustment } = scale(recent.length);
  const diffs = recent.map(differential).sort((a, b) => a - b).slice(0, use);
  const avg = diffs.reduce((s, d) => s + d, 0) / diffs.length + adjustment;
  const index = Math.min(Math.round(avg * 10) / 10, 54.0);

  return {
    index,
    roundsUsed: use,
    roundsConsidered: recent.length,
    roundsNeeded: 0,
  };
}
