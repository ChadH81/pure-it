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

// ============================================================================
// SCRAMBLE TEAM BALANCER
// Splits players into the fairest possible teams using a snake draft by
// handicap (lowest = strongest). Team 1 picks first in round one, last in
// round two, and so on — which keeps total handicap close across teams.
// ============================================================================

export type Golfer = { name: string; handicap: number };

export type BalancedTeams = {
  teams: Golfer[][];
  totals: number[]; // summed handicap per team
  averages: number[]; // mean handicap per team
  spread: number; // max total − min total (lower = more balanced)
};

// ============================================================================
// MATCH PLAY  —  head-to-head, holes up/down. Gross low score wins the hole.
// ============================================================================

export type MatchStatus = {
  holesPlayed: number;
  remaining: number;
  diff: number; // A holes − B holes (positive = A ahead)
  leader: "A" | "B" | "AS";
  decided: boolean; // lead is larger than holes remaining
};

export function matchPlay(a: Score[], b: Score[], totalHoles = 18): MatchStatus {
  let A = 0;
  let B = 0;
  let played = 0;
  for (let i = 0; i < totalHoles; i++) {
    const x = a[i];
    const y = b[i];
    if (x == null || y == null) continue;
    played++;
    if (x < y) A++;
    else if (y < x) B++;
  }
  const remaining = totalHoles - played;
  const diff = A - B;
  return {
    holesPlayed: played,
    remaining,
    diff,
    leader: diff > 0 ? "A" : diff < 0 ? "B" : "AS",
    decided: played > 0 && Math.abs(diff) > remaining,
  };
}

// ============================================================================
// VEGAS  —  2 v 2. Each team's two scores form a two-digit number (low ball is
// the tens digit). Lower team number wins the hole; the margin is the points.
// Birdie flip: if the opposing team makes a birdie, YOUR number flips so the
// high ball becomes the tens digit — a big, punishing swing.
// ============================================================================

export type VegasResult = {
  netA: number; // total points, positive = Team A collects
  money: number; // netA × value
  holeNet: (number | null)[]; // points to A per hole (null = incomplete)
  teamNumbers: ({ a: number; b: number } | null)[];
};

function vegasNumber(lo: number, hi: number, flipped: boolean): number {
  const first = flipped ? hi : lo;
  const second = flipped ? lo : hi;
  return Number(`${first}${second}`);
}

export function vegas(
  a1: Score[],
  a2: Score[],
  b1: Score[],
  b2: Score[],
  pars: Score[],
  value: number,
  flip: boolean
): VegasResult {
  const holes = a1.length;
  let netA = 0;
  const holeNet: (number | null)[] = [];
  const teamNumbers: ({ a: number; b: number } | null)[] = [];

  for (let h = 0; h < holes; h++) {
    const av = [a1[h], a2[h]];
    const bv = [b1[h], b2[h]];
    if (av.some((v) => v == null) || bv.some((v) => v == null)) {
      holeNet.push(null);
      teamNumbers.push(null);
      continue;
    }
    const [ax, ay] = av as number[];
    const [bx, by] = bv as number[];
    const par = pars[h];
    const aBirdie = flip && par != null && (ax < par || ay < par);
    const bBirdie = flip && par != null && (bx < par || by < par);

    // Your number flips when the OTHER team birdies.
    const aNum = vegasNumber(Math.min(ax, ay), Math.max(ax, ay), bBirdie);
    const bNum = vegasNumber(Math.min(bx, by), Math.max(bx, by), aBirdie);

    const net = bNum - aNum; // positive = A's number lower = A wins points
    netA += net;
    holeNet.push(net);
    teamNumbers.push({ a: aNum, b: bNum });
  }

  return { netA, money: Math.round(netA * value * 100) / 100, holeNet, teamNumbers };
}

export function balanceTeams(players: Golfer[], numTeams: number): BalancedTeams {
  const n = Math.max(2, Math.floor(numTeams));
  const teams: Golfer[][] = Array.from({ length: n }, () => []);
  const sorted = [...players].sort((a, b) => a.handicap - b.handicap);

  sorted.forEach((p, i) => {
    const round = Math.floor(i / n);
    const pos = i % n;
    const teamIdx = round % 2 === 0 ? pos : n - 1 - pos; // snake
    teams[teamIdx].push(p);
  });

  const totals = teams.map((t) => t.reduce((s, p) => s + p.handicap, 0));
  const averages = teams.map((t, i) => (t.length ? totals[i] / t.length : 0));
  const nonEmpty = totals.filter((_, i) => teams[i].length > 0);
  const spread = nonEmpty.length ? Math.max(...nonEmpty) - Math.min(...nonEmpty) : 0;

  return { teams, totals, averages, spread };
}
