/**
 * Pure, framework-free math for the Pure it! game calculators.
 * No dependencies, no side effects — easy to unit test.
 *
 * Scoring conventions are documented per game. Golf side-game rules vary by
 * group; these implement widely used defaults and are surfaced in the UI so
 * players can see exactly how a result was reached.
 */

// A hole score is a number of strokes, or null if not entered yet.
export type Score = number | null;

const money2 = (n: number) => Math.round(n * 100) / 100;

// ============================================================================
// NASSAU  —  three match-play bets: front 9, back 9, overall 18.
// ============================================================================

export type NassauSegment = {
  holesA: number;
  holesB: number;
  winner: "A" | "B" | "push";
  margin: number;
};

export type NassauResult = {
  front: NassauSegment;
  back: NassauSegment;
  overall: NassauSegment;
  /** Net money from Player A's perspective (positive = A collects). */
  netA: number;
};

function segment(a: Score[], b: Score[], from: number, to: number): NassauSegment {
  let holesA = 0;
  let holesB = 0;
  for (let i = from; i < to; i++) {
    const x = a[i];
    const y = b[i];
    if (x == null || y == null) continue;
    if (x < y) holesA++;
    else if (y < x) holesB++;
  }
  const diff = holesA - holesB;
  return {
    holesA,
    holesB,
    winner: diff > 0 ? "A" : diff < 0 ? "B" : "push",
    margin: Math.abs(diff),
  };
}

export function nassau(a: Score[], b: Score[], bet: number): NassauResult {
  const front = segment(a, b, 0, 9);
  const back = segment(a, b, 9, 18);
  const overall = segment(a, b, 0, 18);
  const cash = (s: NassauSegment) => (s.winner === "A" ? bet : s.winner === "B" ? -bet : 0);
  const netA = money2(cash(front) + cash(back) + cash(overall));
  return { front, back, overall, netA };
}

// ============================================================================
// SKINS  —  each hole is worth one skin (× value). Outright low score wins it.
// Ties either carry the skin forward (carryover) or wash (no carryover).
// ============================================================================

export type SkinsResult = {
  /** Skins won per player (index-aligned with the players array). */
  skinsWon: number[];
  /** Money won per player. */
  money: number[];
  /** Winner player index per hole, or null if halved/incomplete. */
  holeWinners: (number | null)[];
  /** Skins still unclaimed at the end (carryover mode only). */
  leftover: number;
};

export function skins(
  scores: Score[][], // scores[player][hole]
  value: number,
  carryover: boolean
): SkinsResult {
  const nPlayers = scores.length;
  const nHoles = nPlayers > 0 ? scores[0].length : 0;
  const skinsWon = new Array(nPlayers).fill(0);
  const holeWinners: (number | null)[] = [];
  let carry = 0;

  for (let h = 0; h < nHoles; h++) {
    const col = scores.map((p) => p[h]);
    if (col.some((v) => v == null)) {
      holeWinners.push(null); // incomplete hole — leave carry as-is
      continue;
    }
    const nums = col as number[];
    const min = Math.min(...nums);
    const winners = nums.map((v, i) => (v === min ? i : -1)).filter((i) => i >= 0);
    const potThisHole = 1 + (carryover ? carry : 0);

    if (winners.length === 1) {
      skinsWon[winners[0]] += potThisHole;
      carry = 0;
      holeWinners.push(winners[0]);
    } else {
      holeWinners.push(null); // tie
      carry = carryover ? potThisHole : 0;
    }
  }

  return {
    skinsWon,
    money: skinsWon.map((s) => money2(s * value)),
    holeWinners,
    leftover: carry,
  };
}

// ============================================================================
// WOLF  —  4 players, a rotating "Wolf" each hole (by tee order).
// The Wolf either partners up (2 v 2) or plays alone (1 v 3).
//
// Points (a common convention, shown in the UI):
//   • Wolf + partner win a hole ....... Wolf +2, partner +2
//   • Wolf + partner lose a hole ...... each opponent +3
//   • Lone Wolf wins .................. Wolf +4
//   • Lone Wolf loses ................. each of the other three +1
//   • Halved hole ..................... no points
// Money settlement is zero-sum: each player's net = (points − group average)
// × value per point.
// ============================================================================

export type WolfHole = {
  mode: "partner" | "lone" | null;
  partner?: number; // player index when mode === "partner"
  result: "win" | "lose" | "halve" | null; // from the Wolf's side
};

export type WolfResult = {
  points: number[];
  money: number[];
};

export function wolf(holes: WolfHole[], value: number, nPlayers = 4): WolfResult {
  const points = new Array(nPlayers).fill(0);

  holes.forEach((hole, h) => {
    if (!hole.mode || !hole.result || hole.result === "halve") return;
    const wolfIdx = h % nPlayers;

    if (hole.mode === "lone") {
      if (hole.result === "win") {
        points[wolfIdx] += 4;
      } else {
        for (let i = 0; i < nPlayers; i++) if (i !== wolfIdx) points[i] += 1;
      }
      return;
    }

    // partner mode
    const partner = hole.partner;
    if (partner == null || partner === wolfIdx) return;
    const team = [wolfIdx, partner];
    const opponents = Array.from({ length: nPlayers }, (_, i) => i).filter(
      (i) => !team.includes(i)
    );
    if (hole.result === "win") {
      points[wolfIdx] += 2;
      points[partner] += 2;
    } else {
      opponents.forEach((i) => (points[i] += 3));
    }
  });

  const avg = points.reduce((s, x) => s + x, 0) / nPlayers;
  return {
    points,
    money: points.map((p) => money2((p - avg) * value)),
  };
}

/** Which player index is the Wolf on a given 0-indexed hole. */
export function wolfOnHole(hole: number, nPlayers = 4): number {
  return hole % nPlayers;
}
