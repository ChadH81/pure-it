"use client";

import { useLocalStorage } from "@/lib/useLocalStorage";
import { GROUPS_KEY, labelFor, signature, type SavedGroup } from "@/lib/groups";

/**
 * One-tap saved groups, shared across every calculator. Save the current
 * roster once and reload it into any game — no more re-typing names.
 */
export default function GroupBar({
  current,
  onApply,
}: {
  current: string[];
  onApply: (names: string[]) => void;
}) {
  const [groups, setGroups] = useLocalStorage<SavedGroup[]>(GROUPS_KEY, []);

  const cleaned = current.map((s) => s.trim()).filter(Boolean);
  const canSave = cleaned.length >= 2;
  const already = groups.some((g) => signature(g.players) === signature(cleaned));

  function save() {
    if (!canSave || already) return;
    const g: SavedGroup = {
      id: Date.now().toString(36),
      label: labelFor(cleaned),
      players: cleaned,
    };
    setGroups([g, ...groups].slice(0, 12));
  }

  function remove(id: string) {
    setGroups(groups.filter((g) => g.id !== id));
  }

  if (groups.length === 0 && !canSave) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
        Your groups
      </span>
      {groups.map((g) => (
        <span key={g.id} className="chip gap-1.5">
          <button
            type="button"
            onClick={() => onApply(g.players)}
            className="font-semibold text-[var(--ink)] transition hover:text-[var(--fairway-light)]"
          >
            {g.label}
          </button>
          <button
            type="button"
            onClick={() => remove(g.id)}
            aria-label={`Remove ${g.label}`}
            className="text-[var(--muted)] transition hover:text-[var(--flag)]"
          >
            ×
          </button>
        </span>
      ))}
      {canSave && !already && (
        <button type="button" onClick={save} className="btn-ghost px-2.5 py-1 text-xs">
          + Save this group
        </button>
      )}
    </div>
  );
}
