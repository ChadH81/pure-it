"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { balanceTeams, type Golfer } from "@/lib/games";
import ShareButton from "@/components/ShareButton";
import { shareUrl } from "@/lib/share";
import { ScrambleIcon } from "@/components/icons";
import GroupBar from "@/components/GroupBar";

type Row = { name: string; handicap: string };

const START: Row[] = [
  { name: "Player 1", handicap: "10" },
  { name: "Player 2", handicap: "14" },
  { name: "Player 3", handicap: "18" },
  { name: "Player 4", handicap: "22" },
];

export default function ScrambleCalculator() {
  const [rows, setRows] = useState<Row[]>(START);
  const [numTeams, setNumTeams] = useState(2);

  const players: Golfer[] = useMemo(
    () =>
      rows
        .filter((r) => r.name.trim() !== "")
        .map((r) => ({ name: r.name.trim(), handicap: Number(r.handicap) || 0 })),
    [rows]
  );

  const result = useMemo(() => balanceTeams(players, numTeams), [players, numTeams]);
  const ready = players.length >= numTeams;

  function setRow(i: number, key: keyof Row, v: string) {
    setRows((prev) => prev.map((r, j) => (j === i ? { ...r, [key]: v } : r)));
  }
  function addRow() {
    if (rows.length >= 24) return;
    setRows((prev) => [...prev, { name: `Player ${prev.length + 1}`, handicap: "" }]);
  }
  function removeRow(i: number) {
    if (rows.length <= 2) return;
    setRows((prev) => prev.filter((_, j) => j !== i));
  }

  const sharePath = ready
    ? shareUrl("scramble", {
        game: "Scramble",
        headline: `Balanced ${numTeams} teams from ${players.length} players`,
        sub: `Handicap spread: ${result.spread}`,
        rows: result.teams.map((t, i) => ({
          label: `Team ${i + 1}`,
          value: t.map((p) => p.name).join(", ") || "—",
        })),
      })
    : undefined;

  const shareText =
    `⛳ Scramble teams (${numTeams})\n` +
    result.teams
      .map((t, i) => `Team ${i + 1}: ${t.map((p) => p.name).join(", ")}`)
      .join("\n");

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb name="Scramble" />

      <h1 className="mt-3 text-3xl font-bold tracking-tight">Scramble team balancer</h1>
      <p className="mt-2 text-[var(--muted)]">
        Enter everyone and their handicap, and Pure it! splits you into the fairest
        possible teams — using a snake draft so no squad runs away with it.
      </p>

      {/* Team count */}
      <div className="card mt-6 flex flex-wrap items-center gap-4 p-5">
        <span className="text-sm font-semibold">Number of teams</span>
        <div className="flex gap-2">
          {[2, 3, 4].map((n) => (
            <button
              key={n}
              onClick={() => setNumTeams(n)}
              className={`h-9 w-9 rounded-lg text-sm font-semibold transition ${
                numTeams === n
                  ? "bg-[var(--fairway)] text-[#06231a]"
                  : "border border-[var(--line)] text-[var(--muted)] hover:border-[var(--silver)]"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
        <button onClick={addRow} className="btn-ghost ml-auto px-3 py-1.5 text-sm">
          + Player
        </button>
      </div>

      <GroupBar
        current={rows.map((r) => r.name)}
        onApply={(picked) =>
          setRows((cur) => picked.map((nm, i) => ({ name: nm, handicap: cur[i]?.handicap ?? "" })))
        }
      />

      {/* Result */}
      <div className="result-card mt-6 p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs uppercase tracking-widest text-white/60">Balanced teams</p>
          {ready && sharePath && (
            <ShareButton
              title="Scramble teams"
              text={shareText}
              url={sharePath}
              className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/25"
            />
          )}
        </div>

        {!ready ? (
          <p className="mt-2 text-2xl font-bold">Add at least {numTeams} players</p>
        ) : (
          <>
            <p className="mt-1 text-2xl font-bold">
              {players.length} players · {numTeams} teams
            </p>
            <p className="text-sm text-white/60">
              Handicap spread {result.spread} — lower is fairer
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {result.teams.map((t, i) => (
                <div key={i} className="rounded-xl bg-white/5 p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">Team {i + 1}</span>
                    <span className="text-xs text-white/60">
                      total {result.totals[i]} · avg {result.averages[i].toFixed(1)}
                    </span>
                  </div>
                  <ul className="mt-2 space-y-1 text-sm text-white/85">
                    {t.map((p, j) => (
                      <li key={j} className="flex items-center justify-between">
                        <span>{p.name}</span>
                        <span className="text-white/50">{p.handicap}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Roster */}
      <div className="card mt-6 p-4">
        <h2 className="px-1 pb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
          Roster
        </h2>
        <div className="space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex items-center gap-2">
              <ScrambleIcon className="h-4 w-4 shrink-0 text-[var(--muted)]" />
              <input
                className="field flex-1"
                value={r.name}
                onChange={(e) => setRow(i, "name", e.target.value)}
                placeholder={`Player ${i + 1}`}
              />
              <input
                className="field w-24"
                type="number"
                inputMode="numeric"
                value={r.handicap}
                onChange={(e) => setRow(i, "handicap", e.target.value)}
                placeholder="hcp"
                aria-label={`${r.name || `Player ${i + 1}`} handicap`}
              />
              <button
                onClick={() => removeRow(i)}
                disabled={rows.length <= 2}
                aria-label={`Remove ${r.name || `player ${i + 1}`}`}
                className="text-[var(--muted)] transition hover:text-[var(--flag)] disabled:opacity-30"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </div>

      <section className="mt-10 border-t border-[var(--line)] pt-8">
        <h2 className="text-xl font-bold">How the balancer works</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Players are sorted by handicap and dealt out in a snake draft: the team
          that picks first in one round picks last in the next. That back-and-forth
          keeps each team&apos;s combined handicap close, so the sides are as even as
          the group allows — no captain arguments required.
        </p>
        <h3 className="mt-5 font-bold">Reading the result</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Each team shows its total and average handicap, and the &ldquo;spread&rdquo;
          is the gap between the strongest and weakest team&apos;s totals — the lower
          that number, the fairer the split. Don&apos;t have exact handicaps? A rough
          1–36 guess for each golfer works fine.
        </p>
      </section>
    </main>
  );
}

function Breadcrumb({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
      <Link href="/games" className="hover:text-[var(--fairway)] hover:underline">
        Games
      </Link>
      <span aria-hidden>/</span>
      <span className="text-[var(--ink)]">{name}</span>
    </div>
  );
}
