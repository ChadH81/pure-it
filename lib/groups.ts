export type SavedGroup = {
  id: string;
  label: string;
  players: string[];
};

/** localStorage key shared across every calculator. */
export const GROUPS_KEY = "pureit.groups";

/** A friendly label for a roster: "Alex & Sam" or "Alex, Sam +2". */
export function labelFor(players: string[]): string {
  const p = players.map((s) => s.trim()).filter(Boolean);
  if (p.length === 0) return "Group";
  if (p.length <= 2) return p.join(" & ");
  return `${p[0]}, ${p[1]} +${p.length - 2}`;
}

/** Case-insensitive signature so we don't save the same roster twice. */
export function signature(players: string[]): string {
  return players
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean)
    .join("|");
}
