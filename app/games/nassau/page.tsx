"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { nassau, type Score, type NassauSegment } from "@/lib/games";
import ShareButton from "@/components/ShareButton";

const HOLES = 18;
const emptyCard = (): Score[] => Array(HOLES).fill(null);

function parse(v: string): Score {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function NassauCalculator() {
  const [nameA, setNameA] = useState("Player A");
  const [nameB, setNameB] = useState("Player B");
  const [bet, setBet] = useState("5");
  const [a, setA] = useState<Score[]>(emptyCard);
  const [b, setB] = useState<Score[]>(emptyCard);

  const result = useMemo(() => nassau(a, b, Number(bet) || 0), [a, b, bet]);

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

  const names = { A: nameA || "Player A", B: nameB || "Player B" };
  const settle =
    result.netA === 0
      ? "All square — nobody owes anything yet."
      : result.netA > 0
      ? `${names.B} owes ${names.A} $${result.netA.toFixed(2)}`
      : `${names.A} owes ${names.B} $${Math.abs(result.netA).toFixed(2)}`;

  const segTxt = (t: string, s: NassauSegment) =>
    s.winner === "push" ? `${t}: halved` : `${t}: ${names[s.winner]} +${s.margin}`;
  const shareText = `⛳ Nassau — ${settle}\n${segTxt("Front", result.front)} · ${segTxt(
    "Back",
    result.back
  )} · ${segTxt("Overall", result.overall)}`;

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb name="Nassau" />

      <h1 className="mt-3 text-3xl font-bold tracking-tight">Nassau calculator</h1>
      <p className="mt-2 text-[var(--muted)]">
        Three separate bets: the front nine, the back nine, and the overall
        eighteen. Each is a match — win more holes than your opponent to take it.
      </p>

      {/* Settings */}
      <div className="card mt-6 grid gap-4 p-5 sm:grid-cols-3">
        <Labeled label="Player A">
          <input className="field" value={nameA} onChange={(e) => setNameA(e.target.value)} />
        </Labeled>
        <Labeled label="Player B">
          <input className="field" value={nameB} onChange={(e) => setNameB(e.target.value)} />
        </Labeled>
        <Labeled label="Bet per segment ($)">
          <input
            className="field"
            type="number"
            min={0}
            inputMode="decimal"
            value={bet}
            onChange={(e) => setBet(e.target.value)}
          />
        </Labeled>
      </div>

      {/* Result */}
      <div className="result-card mt-6 p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs uppercase tracking-widest text-white/60">Settlement</p>
          {anyScores && (
            <ShareButton
              title="Nassau result"
              text={shareText}
              className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/25"
            />
          )}
        </div>
        <p className="mt-1 text-2xl font-bold">{anyScores ? settle : "Enter scores below"}</p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          <SegmentPill title="Front 9" seg={result.front} names={names} bet={Number(bet) || 0} />
          <SegmentPill title="Back 9" seg={result.back} names={names} bet={Number(bet) || 0} />
          <SegmentPill title="Overall 18" seg={result.overall} names={names} bet={Number(bet) || 0} />
        </div>
      </div>

      {/* Scorecard */}
      <div className="card mt-6 overflow-x-auto p-4">
        <div className="flex items-center justify-between px-1 pb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">
            Scorecard
          </h2>
          <button onClick={reset} className="text-sm font-medium text-[var(--flag)] hover:underline">
            Clear
          </button>
        </div>
        <ScoreGrid
          rows={[
            { label: names.A, values: a, side: "a" as const },
            { label: names.B, values: b, side: "b" as const },
          ]}
          onChange={setCell}
        />
      </div>

      <p className="mt-4 text-xs text-[var(--muted)]">
        Gross match play — low score wins the hole, ties halve it. Leave holes
        blank until they&apos;re played; the running result updates as you go.
      </p>

      <section className="mt-10 border-t border-[var(--line)] pt-8">
        <h2 className="text-xl font-bold">How a Nassau works</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          A Nassau is really three separate bets rolled into one round. You wager
          the same amount on the front nine, the back nine, and the overall
          eighteen. Each is its own match: whoever wins the most holes in that
          stretch takes that bet. Win the front but lose the back, and the two can
          cancel out — the overall is the tiebreaker that often decides the day.
        </p>
        <h3 className="mt-5 font-bold">A quick example</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          On a $5 Nassau, if you win the front nine, lose the back, and edge the
          overall, you collect $5 and pay $5 — netting $5 up on the overall. This
          calculator does that bookkeeping for you as you enter each hole.
        </p>
        <h3 className="mt-5 font-bold">Common variations</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Many groups add &ldquo;presses&rdquo; — a new side bet started when a
          player falls two holes down. To keep things clean, this calculator scores
          the three core bets in gross match play; you can settle presses on the
          side. Playing net? Enter each golfer&apos;s net score per hole and it
          works exactly the same.
        </p>
      </section>
    </main>
  );
}

function SegmentPill({
  title,
  seg,
  names,
  bet,
}: {
  title: string;
  seg: NassauSegment;
  names: { A: string; B: string };
  bet: number;
}) {
  const label =
    seg.winner === "push"
      ? "Halved"
      : `${names[seg.winner]} +${seg.margin} ($${bet.toFixed(0)})`;
  return (
    <div className="rounded-xl bg-white/10 p-3">
      <p className="text-xs text-white/60">{title}</p>
      <p className="mt-0.5 text-sm font-semibold">{label}</p>
      <p className="text-xs text-white/50">
        {seg.holesA}–{seg.holesB} holes
      </p>
    </div>
  );
}

function ScoreGrid({
  rows,
  onChange,
}: {
  rows: { label: string; values: Score[]; side: "a" | "b" }[];
  onChange: (side: "a" | "b", i: number, v: string) => void;
}) {
  const holeNums = Array.from({ length: HOLES }, (_, i) => i + 1);
  return (
    <table className="w-full border-collapse text-center text-sm">
      <thead>
        <tr className="text-xs text-[var(--muted)]">
          <th className="sticky left-0 bg-[var(--card)] px-2 py-1 text-left font-medium">Hole</th>
          {holeNums.map((h) => (
            <th key={h} className="px-1 py-1 font-medium">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.side}>
            <td className="sticky left-0 bg-[var(--card)] px-2 py-1 text-left font-semibold">
              {row.label}
            </td>
            {row.values.map((v, i) => (
              <td key={i} className="px-0.5 py-1">
                <input
                  aria-label={`${row.label} hole ${i + 1}`}
                  inputMode="numeric"
                  value={v ?? ""}
                  onChange={(e) => onChange(row.side, i, e.target.value)}
                  className="h-9 w-9 rounded-md border border-[var(--line)] text-center focus:border-[var(--fairway-light)] focus:outline-none"
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
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
