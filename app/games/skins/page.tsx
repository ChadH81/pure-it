"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { skins, type Score } from "@/lib/games";
import ShareButton from "@/components/ShareButton";

const HOLES = 18;
const emptyCard = (): Score[] => Array(HOLES).fill(null);

function parse(v: string): Score {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

type Player = { name: string; scores: Score[] };

export default function SkinsCalculator() {
  const [players, setPlayers] = useState<Player[]>([
    { name: "Player 1", scores: emptyCard() },
    { name: "Player 2", scores: emptyCard() },
    { name: "Player 3", scores: emptyCard() },
  ]);
  const [value, setValue] = useState("2");
  const [carryover, setCarryover] = useState(true);

  const result = useMemo(
    () => skins(players.map((p) => p.scores), Number(value) || 0, carryover),
    [players, value, carryover]
  );

  const anyScores = players.some((p) => p.scores.some((s) => s != null));

  function setCell(pi: number, hi: number, v: string) {
    const val = parse(v);
    setPlayers((prev) =>
      prev.map((p, i) =>
        i === pi ? { ...p, scores: p.scores.map((s, j) => (j === hi ? val : s)) } : p
      )
    );
  }
  function setName(pi: number, name: string) {
    setPlayers((prev) => prev.map((p, i) => (i === pi ? { ...p, name } : p)));
  }
  function addPlayer() {
    if (players.length >= 6) return;
    setPlayers((prev) => [...prev, { name: `Player ${prev.length + 1}`, scores: emptyCard() }]);
  }
  function removePlayer(pi: number) {
    if (players.length <= 2) return;
    setPlayers((prev) => prev.filter((_, i) => i !== pi));
  }
  function reset() {
    setPlayers((prev) => prev.map((p) => ({ ...p, scores: emptyCard() })));
  }

  const ranked = players
    .map((p, i) => ({ name: p.name || `Player ${i + 1}`, skins: result.skinsWon[i], money: result.money[i] }))
    .sort((x, y) => y.skins - x.skins);
  const leader = ranked[0];

  const shareText =
    `⛳ Skins${Number(value) ? ` ($${Number(value)}/skin)` : ""}\n` +
    ranked
      .filter((r) => r.skins > 0)
      .map((r) => `${r.name}: ${r.skins} ${r.skins === 1 ? "skin" : "skins"} ($${r.money.toFixed(2)})`)
      .join("\n");

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumb name="Skins" />

      <h1 className="mt-3 text-3xl font-bold tracking-tight">Skins calculator</h1>
      <p className="mt-2 text-[var(--muted)]">
        Every hole is worth one skin. The outright low score wins it. Tie a hole
        and — with carryover on — that skin rolls into the next.
      </p>

      {/* Settings */}
      <div className="card mt-6 flex flex-wrap items-end gap-4 p-5">
        <Labeled label="Value per skin ($)">
          <input
            className="field w-32"
            type="number"
            min={0}
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </Labeled>
        <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={carryover}
            onChange={(e) => setCarryover(e.target.checked)}
            className="h-4 w-4 accent-[var(--fairway)]"
          />
          Carry ties over to the next hole
        </label>
        <div className="ml-auto flex gap-2 pb-1">
          <button
            onClick={addPlayer}
            disabled={players.length >= 6}
            className="btn-ghost px-3 py-1.5 text-sm disabled:opacity-40"
          >
            + Player
          </button>
          <button onClick={reset} className="text-sm font-medium text-[var(--flag)] hover:underline">
            Clear
          </button>
        </div>
      </div>

      {/* Result */}
      <div className="result-card mt-6 p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs uppercase tracking-widest text-white/60">Standings</p>
          {anyScores && leader.skins > 0 && (
            <ShareButton
              title="Skins result"
              text={shareText}
              className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/25"
            />
          )}
        </div>
        <p className="mt-1 text-2xl font-bold">
          {!anyScores
            ? "Enter scores below"
            : leader.skins === 0
            ? "No skins won yet"
            : `${leader.name} leads with ${leader.skins} ${leader.skins === 1 ? "skin" : "skins"}`}
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {ranked.map((r) => (
            <div key={r.name} className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-2.5">
              <span className="font-medium">{r.name}</span>
              <span className="text-sm">
                <span className="text-white/70">
                  {r.skins} {r.skins === 1 ? "skin" : "skins"}
                </span>{" "}
                · <span className="font-semibold">${r.money.toFixed(2)}</span>
              </span>
            </div>
          ))}
        </div>
        {carryover && result.leftover > 0 && (
          <p className="mt-3 text-sm text-white/70">
            {result.leftover} {result.leftover === 1 ? "skin is" : "skins are"} still
            carried over and unclaimed.
          </p>
        )}
      </div>

      {/* Scorecard */}
      <div className="card mt-6 overflow-x-auto p-4">
        <h2 className="px-1 pb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
          Scorecard
        </h2>
        <table className="w-full border-collapse text-center text-sm">
          <thead>
            <tr className="text-xs text-[var(--muted)]">
              <th className="sticky left-0 bg-[var(--card)] px-2 py-1 text-left font-medium">Player</th>
              {Array.from({ length: HOLES }, (_, i) => (
                <th key={i} className="px-1 py-1 font-medium">
                  {i + 1}
                </th>
              ))}
              <th className="px-2 py-1 font-medium">Skins</th>
            </tr>
          </thead>
          <tbody>
            {players.map((p, pi) => (
              <tr key={pi}>
                <td className="sticky left-0 bg-[var(--card)] py-1 pr-2 text-left">
                  <div className="flex items-center gap-1">
                    {players.length > 2 && (
                      <button
                        onClick={() => removePlayer(pi)}
                        aria-label={`Remove ${p.name}`}
                        className="text-[var(--muted)] hover:text-[var(--flag)]"
                      >
                        ×
                      </button>
                    )}
                    <input
                      value={p.name}
                      onChange={(e) => setName(pi, e.target.value)}
                      className="w-24 rounded-md border border-transparent px-1 py-0.5 font-semibold hover:border-[var(--line)] focus:border-[var(--fairway-light)] focus:outline-none"
                    />
                  </div>
                </td>
                {p.scores.map((v, hi) => {
                  const won = result.holeWinners[hi] === pi;
                  return (
                    <td key={hi} className="px-0.5 py-1">
                      <input
                        aria-label={`${p.name} hole ${hi + 1}`}
                        inputMode="numeric"
                        value={v ?? ""}
                        onChange={(e) => setCell(pi, hi, e.target.value)}
                        className={`h-9 w-9 rounded-md border text-center focus:outline-none ${
                          won
                            ? "border-[var(--fairway-light)] bg-[var(--fairway-light)]/15 font-semibold text-[var(--fairway-light)]"
                            : "border-[var(--line)] focus:border-[var(--fairway-light)]"
                        }`}
                      />
                    </td>
                  );
                })}
                <td className="px-2 py-1 font-bold">{result.skinsWon[pi]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-4 text-xs text-[var(--muted)]">
        A hole is won only by a single outright low score. Highlighted cells show
        who took each skin. Leave unplayed holes blank.
      </p>

      <section className="mt-10 border-t border-[var(--line)] pt-8">
        <h2 className="text-xl font-bold">How Skins works</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Every hole is worth one skin. To win it, you need the outright low score —
          beat everyone else on that hole outright. If two or more players tie for
          low, nobody wins, and that&apos;s where carryover comes in.
        </p>
        <h3 className="mt-5 font-bold">Carryovers</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          With carryover on, a tied hole&apos;s skin rolls forward and stacks onto
          the next hole. A run of ties can turn one ordinary hole into a
          four- or five-skin monster — which is exactly what makes the game tense
          on the closing stretch. Turn carryover off and each tied hole simply
          washes.
        </p>
        <h3 className="mt-5 font-bold">Playing for money</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Set a dollar value per skin and the calculator totals each player&apos;s
          winnings automatically. It also shows any skins still carried over and
          unclaimed at the end, so you can decide how to settle the leftover pot.
        </p>
      </section>
    </main>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-semibold">{label}</span>
      {children}
    </label>
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
