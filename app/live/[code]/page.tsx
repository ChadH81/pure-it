"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { skins, type Score } from "@/lib/games";
import {
  fetchLive,
  subscribeLive,
  pushLive,
  type LiveState,
} from "@/lib/live";
import ShareButton from "@/components/ShareButton";
import QrCode from "@/components/QrCode";

const HOLES = 18;

function parse(v: string): Score {
  if (v.trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export default function LiveGamePage() {
  const params = useParams();
  const search = useSearchParams();
  const code = String(params.code ?? "").toUpperCase();

  const [hostToken, setHostToken] = useState<string | null>(null);
  const [state, setState] = useState<LiveState | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [joinUrl, setJoinUrl] = useState("");
  const pushTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isHost = hostToken != null;

  // Resolve host token from the URL (?h=) or localStorage, and the join URL.
  useEffect(() => {
    if (typeof window === "undefined") return;
    setJoinUrl(`${window.location.origin}/live/${code}`);
    const key = `pureit.live.host.${code}`;
    const fromUrl = search.get("h");
    const stored = window.localStorage.getItem(key);
    const token = fromUrl ?? stored;
    if (token) {
      setHostToken(token);
      if (fromUrl) window.localStorage.setItem(key, fromUrl);
    }
  }, [code, search]);

  // Initial load + realtime subscription.
  useEffect(() => {
    if (!code) return;
    let active = true;
    fetchLive(code)
      .then((s) => {
        if (!active) return;
        setState(s);
        setStatus(s ? "ready" : "missing");
      })
      .catch(() => active && setStatus("error"));

    const unsub = subscribeLive(code, (s) => {
      // The host is the source of truth; ignore echoes of our own writes.
      if (!isHostRef.current) setState(s);
    });
    return () => {
      active = false;
      unsub();
    };
  }, [code]);

  // Keep a ref of host status for the subscription closure.
  const isHostRef = useRef(false);
  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  const schedulePush = useCallback(
    (next: LiveState) => {
      if (!hostToken) return;
      if (pushTimer.current) clearTimeout(pushTimer.current);
      pushTimer.current = setTimeout(() => {
        pushLive(code, hostToken, next).catch(() => {});
      }, 350);
    },
    [code, hostToken]
  );

  function setCell(pi: number, hi: number, v: string) {
    setState((prev) => {
      if (!prev) return prev;
      const scores = prev.scores.map((row, i) =>
        i === pi ? row.map((s, j) => (j === hi ? parse(v) : s)) : row
      );
      const next = { ...prev, scores };
      schedulePush(next);
      return next;
    });
  }

  const result = useMemo(
    () => (state ? skins(state.scores, state.value, state.carryover) : null),
    [state]
  );

  const ranked = useMemo(() => {
    if (!state || !result) return [];
    return state.names
      .map((name, i) => ({
        name: name || `Player ${i + 1}`,
        skins: result.skinsWon[i],
        money: result.money[i],
      }))
      .sort((a, b) => b.skins - a.skins);
  }, [state, result]);

  if (status === "loading") {
    return <main className="mx-auto max-w-3xl px-4 py-16 text-[var(--muted)]">Loading live game…</main>;
  }

  if (status === "missing" || status === "error" || !state || !result) {
    return (
      <main className="mx-auto max-w-lg px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">This live game isn&apos;t available</h1>
        <p className="mt-3 text-[var(--muted)]">
          It may have ended or expired. Live games run for 12 hours.
        </p>
        <Link href="/games/skins" className="btn-primary mt-6 inline-flex px-6 py-3">
          Start a Skins game
        </Link>
      </main>
    );
  }

  const leader = ranked[0];

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-[var(--muted)]">
          <Link href="/games/skins" className="hover:text-[var(--fairway)] hover:underline">
            Skins
          </Link>
          <span aria-hidden>/</span>
          <span className="text-[var(--ink)]">Live</span>
        </div>
        <span className="chip">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--fairway-light)]" />
          Live · {code}
        </span>
      </div>

      <h1 className="mt-3 text-3xl font-bold tracking-tight">Skins — live scoreboard</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        {isHost
          ? "You're keeping score. Everyone with the link sees updates instantly."
          : "Watching live — scores update as the host enters them."}
      </p>

      {/* Standings */}
      <div className="result-card mt-6 p-6">
        <div className="flex items-start justify-between gap-3">
          <p className="text-xs uppercase tracking-widest text-white/60">Standings</p>
          <ShareButton
            title="Live Skins"
            text={`⛳ Watch our Skins game live on Pure it!`}
            url={`/live/${code}`}
            className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/25"
          />
        </div>
        <p className="mt-1 text-2xl font-bold">
          {leader && leader.skins > 0 ? `${leader.name} leads with ${leader.skins}` : "No skins won yet"}
          {state.value ? <span className="text-base font-normal text-white/60"> · ${state.value}/skin</span> : null}
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {ranked.map((r) => (
            <div key={r.name} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-2.5">
              <span className="font-medium">{r.name}</span>
              <span className="text-sm text-white/70">
                {r.skins} {r.skins === 1 ? "skin" : "skins"} ·{" "}
                <span className="font-semibold text-white">${r.money.toFixed(2)}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Host QR / invite */}
      {isHost && (
        <div className="card mt-6 flex flex-col items-center gap-4 p-6 text-center sm:flex-row sm:text-left">
          <QrCode url={joinUrl} size={148} />
          <div>
            <h2 className="font-bold">Invite the group</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Have everyone scan this to watch the scoreboard on their own phone.
            </p>
            <p className="mt-2 break-all text-xs text-[var(--muted)]">{joinUrl}</p>
          </div>
        </div>
      )}

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
            {state.names.map((name, pi) => (
              <tr key={pi}>
                <td className="sticky left-0 bg-[var(--card)] px-2 py-1 text-left font-semibold">
                  {name || `Player ${pi + 1}`}
                </td>
                {state.scores[pi].map((v, hi) => {
                  const won = result.holeWinners[hi] === pi;
                  const cls = won
                    ? "border-[var(--fairway-light)] bg-[var(--fairway-light)]/15 font-semibold text-[var(--fairway-light)]"
                    : "border-[var(--line)]";
                  return (
                    <td key={hi} className="px-0.5 py-1">
                      {isHost ? (
                        <input
                          aria-label={`${name} hole ${hi + 1}`}
                          inputMode="numeric"
                          value={v ?? ""}
                          onChange={(e) => setCell(pi, hi, e.target.value)}
                          className={`h-9 w-9 rounded-md border text-center focus:border-[var(--fairway-light)] focus:outline-none ${cls}`}
                        />
                      ) : (
                        <div
                          className={`grid h-9 w-9 place-items-center rounded-md border ${cls}`}
                        >
                          {v ?? ""}
                        </div>
                      )}
                    </td>
                  );
                })}
                <td className="px-2 py-1 font-bold">{result.skinsWon[pi]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {!isHost && (
        <p className="mt-4 text-center text-xs text-[var(--muted)]">
          Want to run your own? <Link href="/games/skins" className="text-[var(--fairway)] hover:underline">Open the Skins calculator →</Link>
        </p>
      )}
    </main>
  );
}
