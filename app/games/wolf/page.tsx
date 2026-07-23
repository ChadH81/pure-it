"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { wolf, wolfOnHole, type WolfHole } from "@/lib/games";
import ShareButton from "@/components/ShareButton";
import { WolfIcon } from "@/components/icons";
import { shareUrl } from "@/lib/share";
import GroupBar from "@/components/GroupBar";

const HOLES = 18;
const N = 4;

const emptyHoles = (): WolfHole[] =>
  Array.from({ length: HOLES }, () => ({ mode: null, result: null }));

function decode(value: string): WolfHole {
  if (value === "") return { mode: null, result: null };
  if (value === "halve") return { mode: null, result: "halve" };
  if (value === "lone-win") return { mode: "lone", result: "win" };
  if (value === "lone-lose") return { mode: "lone", result: "lose" };
  const m = value.match(/^p(\d+)-(win|lose)$/);
  if (m) return { mode: "partner", partner: Number(m[1]), result: m[2] as "win" | "lose" };
  return { mode: null, result: null };
}

function encode(h: WolfHole): string {
  if (h.result === "halve") return "halve";
  if (h.mode === "lone" && h.result) return `lone-${h.result}`;
  if (h.mode === "partner" && h.partner != null && h.result) return `p${h.partner}-${h.result}`;
  return "";
}

export default function WolfCalculator() {
  const [names, setNames] = useState(["Player 1", "Player 2", "Player 3", "Player 4"]);
  const [value, setValue] = useState("1");
  const [holes, setHoles] = useState<WolfHole[]>(emptyHoles);

  const result = useMemo(() => wolf(holes, Number(value) || 0, N), [holes, value]);
  const anyPlayed = holes.some((h) => h.result && h.result !== "halve");

  const name = (i: number) => names[i] || `Player ${i + 1}`;

  function setName(i: number, v: string) {
    setNames((prev) => prev.map((n, j) => (j === i ? v : n)));
  }
  function setHole(i: number, v: string) {
    setHoles((prev) => prev.map((h, j) => (j === i ? decode(v) : h)));
  }
  function reset() {
    setHoles(emptyHoles());
  }

  const ranked = names
    .map((_, i) => ({ i, name: name(i), points: result.points[i], money: result.money[i] }))
    .sort((a, b) => b.points - a.points);
  const leader = ranked[0];

  const shareText =
    `⛳ Wolf${Number(value) ? ` ($${Number(value)}/pt)` : ""}\n` +
    ranked
      .map(
        (r) => `${r.name}: ${r.points} pts (${r.money < 0 ? "-" : "+"}$${Math.abs(r.money).toFixed(2)})`
      )
      .join("\n");
  const sharePath = shareUrl("wolf", {
    game: "Wolf",
    headline: `${leader.name} leads with ${leader.points} pts`,
    sub: Number(value) ? `$${Number(value)} / point` : undefined,
    rows: ranked.slice(0, 4).map((r, i) => ({
      label: r.name,
      value: `${r.points} pts · ${r.money < 0 ? "-" : "+"}$${Math.abs(r.money).toFixed(2)}`,
      lead: i === 0,
    })),
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Breadcrumb name="Wolf" />

      <h1 className="mt-3 text-3xl font-bold tracking-tight">Wolf calculator</h1>
      <p className="mt-2 text-[var(--muted)]">
        Four players, and a different Wolf each hole (rotating by tee order). The
        Wolf watches the tee shots, then either picks a partner for a 2-v-2 or
        goes it alone against the other three.
      </p>

      {/* Players + value */}
      <div className="card mt-6 p-5">
        <div className="grid gap-3 sm:grid-cols-4">
          {names.map((n, i) => (
            <label key={i} className="block">
              <span className="mb-1 block text-xs font-semibold text-[var(--muted)]">
                Player {i + 1}
              </span>
              <input className="field" value={n} onChange={(e) => setName(i, e.target.value)} />
            </label>
          ))}
        </div>
        <div className="mt-4 flex items-end gap-4">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold">$ per point</span>
            <input
              className="field w-32"
              type="number"
              min={0}
              inputMode="decimal"
              value={value}
              onChange={(e) => setValue(e.target.value)}
            />
          </label>
          <button onClick={reset} className="pb-2 text-sm font-medium text-[var(--flag)] hover:underline">
            Clear holes
          </button>
        </div>
      </div>

      <GroupBar
        current={names}
        onApply={(picked) => setNames((cur) => cur.map((n, i) => picked[i] ?? n))}
      />

      {/* Result */}
      <div className="result-card mt-6 p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs uppercase tracking-widest text-white/60">Standings</p>
          {anyPlayed && (
            <ShareButton
              title="Wolf result"
              text={shareText}
              url={sharePath}
              className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/25"
            />
          )}
        </div>
        <p className="mt-1 text-2xl font-bold">
          {!anyPlayed
            ? "Set each hole's result below"
            : `${leader.name} leads with ${leader.points} pts`}
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {ranked.map((r) => (
            <div key={r.i} className="flex items-center justify-between rounded-xl bg-white/10 px-4 py-2.5">
              <span className="font-medium">{r.name}</span>
              <span className="text-sm">
                <span className="text-white/70">{r.points} pts</span> ·{" "}
                <span className={`font-semibold ${r.money < 0 ? "text-red-200" : ""}`}>
                  {r.money < 0 ? "-" : "+"}${Math.abs(r.money).toFixed(2)}
                </span>
              </span>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-white/50">
          Money is zero-sum: each player settles against the group average, so the
          plusses and minuses always cancel out.
        </p>
      </div>

      {/* Holes */}
      <div className="card mt-6 divide-y divide-[var(--line)] p-2">
        {holes.map((h, i) => {
          const wolfIdx = wolfOnHole(i, N);
          const partners = [0, 1, 2, 3].filter((p) => p !== wolfIdx);
          return (
            <div key={i} className="flex items-center gap-3 px-3 py-2.5">
              <span className="w-6 text-sm font-semibold text-[var(--muted)]">{i + 1}</span>
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[var(--flag)]/10 px-2.5 py-1 text-xs font-semibold text-[var(--flag)]">
                  <WolfIcon className="h-3.5 w-3.5" />
                  {name(wolfIdx)}
                </span>
                <select
                  value={encode(h)}
                  onChange={(e) => setHole(i, e.target.value)}
                  className="field min-w-0 flex-1 py-1.5"
                >
                  <option value="">— not played —</option>
                  <option value="halve">Halved (no points)</option>
                  <option value="lone-win">Lone Wolf won (+4)</option>
                  <option value="lone-lose">Lone Wolf lost (others +1)</option>
                  {partners.map((p) => (
                    <option key={`${p}-win`} value={`p${p}-win`}>
                      With {name(p)}: won (+2 each)
                    </option>
                  ))}
                  {partners.map((p) => (
                    <option key={`${p}-lose`} value={`p${p}-lose`}>
                      With {name(p)}: lost (opponents +3)
                    </option>
                  ))}
                </select>
              </div>
            </div>
          );
        })}
      </div>

      <details className="mt-4 text-sm text-[var(--muted)]">
        <summary className="cursor-pointer font-medium">How points work</summary>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Wolf + partner win a hole: Wolf and partner each score 2.</li>
          <li>Wolf + partner lose: each of the two opponents scores 3.</li>
          <li>Lone Wolf wins alone: Wolf scores 4.</li>
          <li>Lone Wolf loses: each of the other three scores 1.</li>
          <li>Halved hole: nobody scores.</li>
        </ul>
        <p className="mt-2">
          Conventions vary by group — this is a common one. Adjust the $-per-point
          to match your stakes.
        </p>
      </details>

      <section className="mt-10 border-t border-[var(--line)] pt-8">
        <h2 className="text-xl font-bold">How Wolf works</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Wolf is a four-player game built around one rotating role: the Wolf. Tee
          order sets who&apos;s Wolf each hole, and it rotates so everyone takes the
          role the same number of times. The Wolf tees off last so they can watch
          everyone else&apos;s drive before deciding what to do.
        </p>
        <h3 className="mt-5 font-bold">The decision</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          After each opponent tees off, the Wolf can either pick that player as a
          partner for a 2-v-2 hole, or pass. Pass on everyone and the Wolf plays the
          hole alone — the Lone Wolf — against all three, for a bigger reward and a
          bigger risk. This calculator assigns the Wolf automatically and lets you
          record how each hole played out.
        </p>
        <h3 className="mt-5 font-bold">Strategy in a sentence</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--muted)]">
          Go Lone Wolf when you&apos;ve striped your tee shot and the field hasn&apos;t;
          take a partner when someone else is sitting pretty and you&apos;re not. The
          money settles zero-sum against the group average, so points only matter
          relative to everyone else.
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
