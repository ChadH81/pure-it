"use client";

// In-memory mock store. Replaced by Supabase in a later phase.
// Data lives for one browser session; refreshing resets to seed data.

export type GameFormat = "Casual 9" | "Casual 18" | "2v2 Best Ball" | "Scramble";
export type Pace = "Relaxed" | "Steady" | "Fast";
export type WalkRide = "Walk" | "Ride" | "Either";

export type Player = { name: string; handicap: number };
export type Message = { id: string; author: string; body: string; at: string };

export type Game = {
  id: string;
  course: string;
  city: string;
  teeTime: string; // ISO datetime
  format: GameFormat;
  slotsTotal: number;
  host: Player;
  players: Player[]; // includes host
  hcpMin?: number;
  hcpMax?: number;
  pace?: Pace;
  walkRide?: WalkRide;
  notes?: string;
  messages: Message[];
};

export const CURRENT_USER: Player = { name: "You", handicap: 14 };

export const SEED_COURSES = [
  "Stone Creek Golf Club",
  "Lake of the Woods GC",
  "University of Illinois Orange",
  "University of Illinois Blue",
  "Urbana Country Club",
  "Willow Pond Golf Course",
];

const seed: Game[] = [
  {
    id: "g1",
    course: "Stone Creek Golf Club",
    city: "Urbana, IL",
    teeTime: "2026-07-11T08:30:00",
    format: "Casual 18",
    slotsTotal: 4,
    host: { name: "Mike T.", handicap: 12 },
    players: [
      { name: "Mike T.", handicap: 12 },
      { name: "Jenn L.", handicap: 18 },
    ],
    hcpMin: 5,
    hcpMax: 20,
    walkRide: "Either",
    pace: "Relaxed",
    notes: "Easygoing weekend round. Walkers welcome.",
    messages: [
      {
        id: "m1",
        author: "Jenn L.",
        body: "Looking forward to it! Range beforehand?",
        at: "2026-07-08T10:15:00",
      },
      {
        id: "m2",
        author: "Mike T.",
        body: "I'll be there 45 min early if you want to hit balls.",
        at: "2026-07-08T11:02:00",
      },
    ],
  },
  {
    id: "g2",
    course: "Lake of the Woods GC",
    city: "Mahomet, IL",
    teeTime: "2026-07-12T13:00:00",
    format: "2v2 Best Ball",
    slotsTotal: 4,
    host: { name: "Sarah K.", handicap: 8 },
    players: [
      { name: "Sarah K.", handicap: 8 },
      { name: "Tom W.", handicap: 11 },
      { name: "Priya S.", handicap: 9 },
    ],
    hcpMax: 15,
    pace: "Steady",
    notes: "Friendly wager optional. Need a 4th for best ball.",
    messages: [],
  },
  {
    id: "g3",
    course: "University of Illinois Orange",
    city: "Savoy, IL",
    teeTime: "2026-07-15T17:15:00",
    format: "Casual 9",
    slotsTotal: 4,
    host: { name: "Dave R.", handicap: 22 },
    players: [{ name: "Dave R.", handicap: 22 }],
    pace: "Relaxed",
    walkRide: "Ride",
    notes: "After-work twilight nine. Beginners welcome.",
    messages: [],
  },
];

let games: Game[] = seed;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function getGames(): Game[] {
  return games;
}

export function getGame(id: string): Game | undefined {
  return games.find((g) => g.id === id);
}

export type NewGameInput = Omit<Game, "id" | "host" | "players" | "messages">;

export function addGame(input: NewGameInput): string {
  const id = `g${Date.now()}`;
  const game: Game = {
    ...input,
    id,
    host: CURRENT_USER,
    players: [CURRENT_USER],
    messages: [],
  };
  games = [game, ...games];
  emit();
  return id;
}

export function slotsOpen(game: Game): number {
  return game.slotsTotal - game.players.length;
}

export function isJoined(game: Game): boolean {
  return game.players.some((p) => p.name === CURRENT_USER.name);
}

export function joinGame(id: string): void {
  games = games.map((g) =>
    g.id === id && !isJoined(g) && slotsOpen(g) > 0
      ? { ...g, players: [...g.players, CURRENT_USER] }
      : g
  );
  emit();
}

export function leaveGame(id: string): void {
  games = games.map((g) =>
    g.id === id && isJoined(g) && g.host.name !== CURRENT_USER.name
      ? { ...g, players: g.players.filter((p) => p.name !== CURRENT_USER.name) }
      : g
  );
  emit();
}

export function addMessage(gameId: string, body: string): void {
  const trimmed = body.trim();
  if (!trimmed) return;
  games = games.map((g) =>
    g.id === gameId
      ? {
          ...g,
          messages: [
            ...g.messages,
            {
              id: `m${Date.now()}`,
              author: CURRENT_USER.name,
              body: trimmed,
              at: new Date().toISOString(),
            },
          ],
        }
      : g
  );
  emit();
}

// Deterministic date formatting (avoids server/client hydration mismatches)
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

export function prefsLine(game: Game): string {
  const parts: string[] = [];
  if (game.hcpMin != null && game.hcpMax != null)
    parts.push(`Handicap ${game.hcpMin}–${game.hcpMax}`);
  else if (game.hcpMax != null) parts.push(`Handicap under ${game.hcpMax}`);
  else if (game.hcpMin != null) parts.push(`Handicap ${game.hcpMin}+`);
  if (game.pace) parts.push(`${game.pace} pace`);
  if (game.walkRide && game.walkRide !== "Either") parts.push(game.walkRide);
  return parts.join(" · ") || "All golfers welcome";
}
