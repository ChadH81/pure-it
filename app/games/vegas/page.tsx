"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { vegas, type Score } from "@/lib/games";
import ShareButton from "@/components/ShareButton";
import { shareUrl } from "@/lib/share";
import GroupBar from "@/components/GroupBar";

const HOLES = 18;
const emptyCard = (): Score[] => Array(HOLES).fill(null);
const defaultPars = (): Score[] => Array(HOLES).fill(4);

function parse(v: string): Score {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function VegasCalculator() {
  const [names, setNames] = useState(["Player 1", "Player 2", "Player 3", "Player 4"]);
  const [scores, setScores] = useState<Score[][]>([
    emptyCard(),
    emptyCard(),
    emptyCard(),
    emptyCard(),
  ]);
  const [pars, setPars] = useState<Score[]>(defaultPars);
  const [value, setValue] = useState("1");
  const [flip, setFlip] = useState(true);

  const result = useMemo(
    () => vegas(scores[0], scores[1], scores[2], scores[3], pars, Number(value) || 0, flip),
    [scores, pars, value, flip]
  );

  const teamA = `${names[0] || "Player 1"} & ${names[1] || "Player 2"}`;
  const teamB = `${names[2] || "Player 3"} & ${names[3] || "Player 4"}`;
  const anyScores = scores.some((row) => row.some((s) => s != null));

  const money = Math.abs(result.money);
  const settle =
    !anyScores
      ? "Enter scores below"
      : result.netA === 0
      ? "All square"
      : result.netA > 0
      ? `${teamB} owes ${teamA} $${money.toFixed(2)}`
      : `${teamA} owes ${teamB} $${money.toFixed(2)}`;

  function setCell(pi: number, hi: number, v: string) {
    const val = parse(v);
    setScores((prev) => prev.map((row, i) => (i === pi ? row.map((s, j) => (j === hi ? val : s)) : row)));
  }
  function setPar(hi: number, v: string) {
    const val = parse(v);
    setPars((prev) => prev.map((p, j) => (j === hi ? val : p)));
  }
  function setName(i: number, v: string) {
    setNames((prev) => prev.map((n, j) => (j === i ? v : n)));
  }
  function reset() {
    setScores([emptyCard(), emptyCard(), emptyCard(), emptyCard()]);
  }

  const sharePath = anyScores
    ? shareUrl("vegas", {
        game: "Vegas",
        headline: settle,
        sub: `$${Number(value) || 0} / point${flip ? " · birdie flip on" : ""}`,
        rows: [
          { label: teamA, value: `${result.netA >= 0 ? "+" : ""}${result.netA} pts`, lead: result.netA > 0 },
          { label: teamB, value: `${-result.netA >= 0 ? "+" : ""}${-result.netA} pts`, lead: result.netA < 0 },
        ],
      })
    : undefined;

  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Breadcrumb name="Vegas" />

      <h1 className="mt-3 text-3xl font-bold tracking-tight">Vegas calculator</h1>
      <p className="mt-2 text-[var(--muted)]">
        A high-swing 2-v-2 game. Each team&apos;s two scores combine into a
        two-digit number — low ball first — and the gap between the teams is the
        points. Birdies flip the other team&apos;s number for a painful jump.
      </p>

      {/* Settings */}
      <div className="card mt-6 flex flex-wrap items-end gap-4 p-5">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold">$ per point</span>
          <input
            className="field w-28"
            type="number"
            min={0}
            inputMode="decimal"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </label>
        <label className="flex cursor-pointer items-center gap-2 pb-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={flip}
            onChange={(e) => setFlip(e.target.checked)}
            className="h-4 w-4 accent-[var(--fairway)]"
          />
          Birdie flip (uses par row)
        </label>
        <button onClick={reset} className="ml-auto pb-2 text-sm font-medium text-[var(--flag)] hover:underline">
          Clear scores
        </button>
      </div>

      <GroupBar
        current={names}
        onApply={(picked) => setNames((cur) => cur.map((n, i) => picked[i] ?? n))}
      />

      {/* Result */}
      <div className="result-card mt-6 p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs uppercase tracking-widest text-white/60">Settlement</p>
          {anyScores && sharePath && (
            <ShareButton
              title="Vegas result"
              text={`⛳ Vegas — ${settle}`}
              url={sharePath}
              className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/25"
            />
          )}
        </div>
        <p className="mt-1 text-2xl font-bold">{settle}</p>
        {anyScores && (
          <p className="text-sm text-white/60">
            {result.netA >= 0 ? teamA : teamB} up {Math.abs(result.netA)} points
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
            </tr>
          </thead>
          <tbody>
            {/* Par row */}
            <tr className="text-[var(--muted)]">
              <td className="sticky left-0 bg-[var(--card)] px-2 py-1 text-left text-xs font-semibold uppercase tracking-wide">
                Par
              </td>
              {pars.map((p, hi) => (
                <td key={hi} className="px-0.5 py-1">
                  <input
                    aria-label={`Par hole ${hi + 1}`}
                    inputMode="numeric"
                    value={p ?? ""}
                    onChange={(e) => setPar(hi, e.target.value)}
                    className="h-8 w-9 rounded-md border border-[var(--line)] bg-transparent text-center text-xs focus:border-[var(--fairway-light)] focus:outline-none"
                  />
                </td>
              ))}
            </tr>
            {scores.map((row, pi) => (
              <tr key={pi} className={pi === 2 ? "border-t border-[var(--line)]" : ""}>
                <td className="sticky left-0 bg-[var(--card)] py-1 pr-2 text-left">
                  <div className="flex items-center gap-1">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ background: pi < 2 ? "#d98a2b" : "#5b8bd0" }}
                      aria-hidden
                    />
                    <input
                      value={names[pi]}
                      onChange={(e) => setName(pi, e.target.value)}
                      className="w-24 rounded-md border border-transparent px-1 py-0.5 font-semibold hover:border-[var(--line)] focus:border-[var(--fairway-light)] focus:outline-none"
                    />
                  </div>
                </td>
                {row.map((v, hi) => (
                  <td key={hi} className="px-0.5 py-1">
                    <input
                      aria-label={`${names[pi]} hole ${hi + 1}`}
                      inputMode="numeric"
                      value={v ?? ""}
                      onChange={(e) => setCell(pi, hi, e.target.value)}
                      className="h-9 w-9 rounded-md border border-[var(--line)] text-center focus:border-[var(--fairway-light)] focus:outline-none"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 px-1 text-xs text-[var(--muted)]">
          <span style={{ color: "#d98a2b" }}>●</span> Team 1 ({teamA}) &nbsp;·&nbsp;
          <span style={{ color: "#5b8bd0" }}>●</span> Team 2 ({teamB})
        </p>
      </div>

      <section className="mt-10 border-t border-[var(--line)] pt-8">
        <h2 className="text-xl font-bold">How Vegas works</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Two teams of two. On each hole, a team&apos;s two scores form a two-digit
          number with the lower score first — a 4 and a 6 becomes 46. The team with
          the lower number wins the hole, and the difference between the two numbers
          is the points won.
        </p>
        <h3 className="mt-5 font-bold">The birdie flip</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Here&apos;s the swing that makes Vegas wild: if a team makes a birdie, the
          other team&apos;s number flips so the high score goes first — 46 becomes 64.
          One birdie can turn a small hole into a huge one. Toggle it off for a
          simpler game, and edit the par row so birdies are detected correctly.
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
