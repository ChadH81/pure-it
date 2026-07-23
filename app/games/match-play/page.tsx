"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { matchPlay, type Score } from "@/lib/games";
import ShareButton from "@/components/ShareButton";
import { shareUrl } from "@/lib/share";
import GroupBar from "@/components/GroupBar";

const HOLES = 18;
const emptyCard = (): Score[] => Array(HOLES).fill(null);

function parse(v: string): Score {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function MatchPlayCalculator() {
  const [nameA, setNameA] = useState("Player A");
  const [nameB, setNameB] = useState("Player B");
  const [a, setA] = useState<Score[]>(emptyCard);
  const [b, setB] = useState<Score[]>(emptyCard);

  const m = useMemo(() => matchPlay(a, b), [a, b]);
  const names = { A: nameA || "Player A", B: nameB || "Player B" };
  const anyScores = a.some((x) => x != null) || b.some((x) => x != null);

  function setCell(side: "a" | "b", i: number, v: string) {
    const val = parse(v);
    if (side === "a") setA((p) => p.map((x, j) => (j === i ? val : x)));
    else setB((p) => p.map((x, j) => (j === i ? val : x)));
  }
  function reset() {
    setA(emptyCard());
    setB(emptyCard());
  }

  const leaderName = m.leader === "AS" ? null : names[m.leader];
  const status = !anyScores
    ? "Enter scores below"
    : m.leader === "AS"
    ? m.remaining === 0
      ? "Match halved"
      : "All square"
    : m.decided
    ? `${leaderName} wins ${Math.abs(m.diff)} & ${m.remaining}`
    : m.remaining === 0
    ? `${leaderName} wins ${Math.abs(m.diff)} up`
    : `${leaderName} ${Math.abs(m.diff)} up`;

  const sub =
    !anyScores || m.decided || m.remaining === 0
      ? `${m.holesPlayed} holes played`
      : `${m.remaining} to play`;

  const sharePath = anyScores
    ? shareUrl("match-play", {
        game: "Match Play",
        headline: status,
        sub,
        rows: [
          { label: names.A, value: `${countHoles(a, b)} holes`, lead: m.leader === "A" },
          { label: names.B, value: `${countHoles(b, a)} holes`, lead: m.leader === "B" },
        ],
      })
    : undefined;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb name="Match Play" />

      <h1 className="mt-3 text-3xl font-bold tracking-tight">Match play counter</h1>
      <p className="mt-2 text-[var(--muted)]">
        Head-to-head, hole by hole. Win a hole to go one up; the match is over once
        a lead is bigger than the number of holes left.
      </p>

      <div className="card mt-6 grid gap-4 p-5 sm:grid-cols-2">
        <Labeled label="Player A">
          <input className="field" value={nameA} onChange={(e) => setNameA(e.target.value)} />
        </Labeled>
        <Labeled label="Player B">
          <input className="field" value={nameB} onChange={(e) => setNameB(e.target.value)} />
        </Labeled>
      </div>

      <GroupBar
        current={[nameA, nameB]}
        onApply={(picked) => {
          if (picked[0]) setNameA(picked[0]);
          if (picked[1]) setNameB(picked[1]);
        }}
      />

      <div className="result-card mt-6 p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs uppercase tracking-widest text-white/60">Match status</p>
          {anyScores && sharePath && (
            <ShareButton
              title="Match play"
              text={`⛳ Match play — ${status} (${sub})`}
              url={sharePath}
              className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/25"
            />
          )}
        </div>
        <p className="mt-1 text-2xl font-bold">{status}</p>
        <p className="text-sm text-white/60">{sub}</p>
      </div>

      <div className="card mt-6 overflow-x-auto p-4">
        <div className="flex items-center justify-between px-1 pb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Scorecard
          </h2>
          <button onClick={reset} className="text-sm font-medium text-[var(--flag)] hover:underline">
            Clear
          </button>
        </div>
        <table className="w-full border-collapse text-center text-sm">
          <thead>
            <tr className="text-xs text-[var(--muted)]">
              <th className="sticky left-0 bg-[var(--card)] px-2 py-1 text-left font-medium">Hole</th>
              {Array.from({ length: HOLES }, (_, i) => (
                <th key={i} className="px-1 py-1 font-medium">
                  {i + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {([
              { label: names.A, values: a, side: "a" as const, me: "A" as const },
              { label: names.B, values: b, side: "b" as const, me: "B" as const },
            ]).map((row) => (
              <tr key={row.side}>
                <td className="sticky left-0 bg-[var(--card)] px-2 py-1 text-left font-semibold">
                  {row.label}
                </td>
                {row.values.map((v, i) => {
                  const other = row.side === "a" ? b[i] : a[i];
                  const won = v != null && other != null && v < other;
                  return (
                    <td key={i} className="px-0.5 py-1">
                      <input
                        aria-label={`${row.label} hole ${i + 1}`}
                        inputMode="numeric"
                        value={v ?? ""}
                        onChange={(e) => setCell(row.side, i, e.target.value)}
                        className={`h-9 w-9 rounded-md border text-center focus:outline-none ${
                          won
                            ? "border-[var(--fairway-light)] bg-[var(--fairway-light)]/15 font-semibold text-[var(--fairway-light)]"
                            : "border-[var(--line)] focus:border-[var(--fairway-light)]"
                        }`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="mt-10 border-t border-[var(--line)] pt-8">
        <h2 className="text-xl font-bold">How match play scoring works</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Unlike stroke play, match play is decided hole by hole. Win a hole and you
          go &ldquo;one up&rdquo;; lose one and you drop back. Your total score
          doesn&apos;t matter — only how many holes you&apos;re ahead or behind.
        </p>
        <h3 className="mt-5 font-bold">Closing out a match</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          The match ends the moment your lead is larger than the holes remaining —
          &ldquo;3 &amp; 2&rdquo; means three up with two to play, so the last two
          holes can&apos;t change the result. Highlighted cells show who won each hole.
        </p>
      </section>
    </main>
  );
}

function countHoles(x: Score[], y: Score[]): number {
  let w = 0;
  for (let i = 0; i < x.length; i++) {
    if (x[i] != null && y[i] != null && (x[i] as number) < (y[i] as number)) w++;
  }
  return w;
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
