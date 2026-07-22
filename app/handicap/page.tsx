"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  addRound,
  deleteRound,
  listRounds,
  listTeeOptions,
  saveHandicap,
  type RoundRow,
  type TeeOption,
} from "@/lib/db";
import { differential, handicapIndex } from "@/lib/handicap";
import { useUser } from "@/lib/useUser";
import ShareButton from "@/components/ShareButton";

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[var(--fairway)] focus:outline-none";
const labelCls = "mb-1 block text-sm font-semibold";

function today(): string {
  const d = new Date();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export default function HandicapPage() {
  const { user, loading: userLoading } = useUser();
  const [rounds, setRounds] = useState<RoundRow[]>([]);
  const [tees, setTees] = useState<TeeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // form state
  const [course, setCourse] = useState("");
  const [teeName, setTeeName] = useState("");
  const [rating, setRating] = useState("");
  const [slope, setSlope] = useState("");
  const [score, setScore] = useState("");
  const [date, setDate] = useState(today());
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!user) return;
    const [r, t] = await Promise.all([listRounds(user.id), listTeeOptions()]);
    setRounds(r);
    setTees(t);
  }, [user]);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    refresh()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, userLoading, refresh]);

  const result = useMemo(() => handicapIndex(rounds), [rounds]);

  const courseNames = useMemo(
    () => [...new Set(tees.map((t) => t.course_name))],
    [tees]
  );
  const teesForCourse = useMemo(
    () => tees.filter((t) => t.course_name.toLowerCase() === course.trim().toLowerCase()),
    [tees, course]
  );

  // When a known tee is picked, autofill rating/slope
  useEffect(() => {
    const match = teesForCourse.find((t) => t.tee_name === teeName);
    if (match) {
      setRating(String(match.rating));
      setSlope(String(match.slope));
    }
  }, [teeName, teesForCourse]);

  if (userLoading || loading) {
    return <main className="mx-auto max-w-2xl px-4 py-10 text-gray-500">Loading…</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Track your ASAP</h1>
        <p className="mt-2 text-gray-600">
          Log your rounds and get your Average Strokes Above Par — a free,
          casual estimate of how you&apos;re playing.
        </p>
        <Link
          href="/login?mode=signup"
          className="mt-6 inline-block rounded-lg bg-[var(--fairway)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--fairway-dark)]"
        >
          Create an account
        </Link>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const r = Number(rating), s = Number(slope), sc = Number(score);
    if (!course.trim() || !rating || !slope || !score) {
      setError("Course, rating, slope, and score are required.");
      return;
    }
    if (r < 50 || r > 85) return setError("Course rating is usually between 60 and 80 — check the scorecard.");
    if (s < 55 || s > 155) return setError("Slope must be between 55 and 155.");
    if (sc < 40 || sc > 160) return setError("Score must be between 40 and 160.");

    setBusy(true);
    setError("");
    try {
      await addRound(user!.id, {
        course_name: course.trim(),
        tee_name: teeName.trim() || null,
        rating: r,
        slope: s,
        score: sc,
        date_played: date,
      });
      const updated = await listRounds(user!.id);
      setRounds(updated);
      await saveHandicap(user!.id, handicapIndex(updated).index);
      setScore("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save the round.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(id: string) {
    setError("");
    try {
      await deleteRound(id);
      const updated = await listRounds(user!.id);
      setRounds(updated);
      await saveHandicap(user!.id, handicapIndex(updated).index);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not delete the round.");
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-3xl font-bold">Your ASAP</h1>

      {/* ASAP card */}
      <div className="mt-4 rounded-xl bg-[var(--fairway-dark)] p-6 text-white shadow-sm">
        {result.index != null ? (
          <>
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm uppercase tracking-widest text-white/70">
                Average Strokes Above Par (ASAP)
              </p>
              <ShareButton
                title="My ASAP"
                text={`⛳ My ASAP (Average Strokes Above Par) is ${result.index.toFixed(
                  1
                )} — tracked free on Pure it!`}
                className="shrink-0 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white transition hover:bg-white/25"
              />
            </div>
            <p className="mt-1 text-5xl font-bold">{result.index.toFixed(1)}</p>
            <p className="mt-2 text-sm text-white/70">
              Best {result.roundsUsed} of your last {result.roundsConsidered}{" "}
              {result.roundsConsidered === 1 ? "round" : "rounds"} · updates your
              profile automatically
            </p>
          </>
        ) : (
          <>
            <p className="text-sm uppercase tracking-widest text-white/70">
              Average Strokes Above Par (ASAP)
            </p>
            <p className="mt-1 text-3xl font-bold">
              {result.roundsNeeded} more {result.roundsNeeded === 1 ? "round" : "rounds"} to go
            </p>
            <p className="mt-2 text-sm text-white/70">
              Log {result.roundsNeeded === 3 ? "your first three rounds" : "a few more rounds"} and
              your ASAP appears here.
            </p>
          </>
        )}
      </div>
      <p className="mt-3 rounded-lg border border-gray-200 bg-[var(--sand)] px-4 py-3 text-xs text-gray-600">
        <span className="font-semibold">ASAP is an unofficial estimate for casual play.</span>{" "}
        Pure it! is an independent app — not affiliated with, endorsed by, or
        sponsored by the USGA, The R&amp;A, or Golf Canada. ASAP is not an
        official handicap and is not valid for tournament or club competition.
      </p>

      {/* Log a round */}
      <section className="mt-8 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Log a round (18 holes)
        </h2>
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className={labelCls} htmlFor="course">Course</label>
            <input
              id="course"
              className={inputCls}
              list="hc-courses"
              value={course}
              onChange={(e) => { setCourse(e.target.value); setTeeName(""); }}
              placeholder="Start typing a course name"
            />
            <datalist id="hc-courses">
              {courseNames.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelCls} htmlFor="tee">Tee</label>
              {teesForCourse.length > 0 ? (
                <select
                  id="tee"
                  className={inputCls}
                  value={teeName}
                  onChange={(e) => setTeeName(e.target.value)}
                >
                  <option value="">Pick a tee</option>
                  {teesForCourse.map((t) => (
                    <option key={t.tee_id} value={t.tee_name}>{t.tee_name}</option>
                  ))}
                </select>
              ) : (
                <input
                  id="tee"
                  className={inputCls}
                  value={teeName}
                  onChange={(e) => setTeeName(e.target.value)}
                  placeholder="e.g. White"
                />
              )}
            </div>
            <div>
              <label className={labelCls} htmlFor="rating">Rating</label>
              <input
                id="rating"
                type="number"
                step="0.1"
                className={inputCls}
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                placeholder="71.2"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="slope">Slope</label>
              <input
                id="slope"
                type="number"
                className={inputCls}
                value={slope}
                onChange={(e) => setSlope(e.target.value)}
                placeholder="128"
              />
            </div>
          </div>
          {teesForCourse.length === 0 && course.trim() !== "" && (
            <p className="text-xs text-gray-400">
              New course for us — rating and slope are printed on the scorecard,
              usually next to each tee. You only do this once; we&apos;ll remember it
              for everyone.
            </p>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="score">Your score</label>
              <input
                id="score"
                type="number"
                className={inputCls}
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="88"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="date">Date played</label>
              <input
                id="date"
                type="date"
                className={inputCls}
                value={date}
                max={today()}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
          </div>

          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-[var(--fairway)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--fairway-dark)] disabled:opacity-50"
          >
            {busy ? "Saving…" : "Log round"}
          </button>
        </form>
      </section>

      {/* Round history */}
      {rounds.length > 0 && (
        <section className="mt-8">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Round history
          </h2>
          <ul className="mt-3 space-y-2">
            {rounds.map((r) => (
              <li
                key={r.id}
                className="flex items-center justify-between rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-semibold">
                    {r.score} <span className="font-normal text-gray-500">at</span>{" "}
                    {r.course_name}
                    {r.tee_name && (
                      <span className="text-gray-500"> ({r.tee_name})</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500">
                    {r.date_played} · {r.rating}/{r.slope} · differential{" "}
                    {differential(r).toFixed(1)}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  className="text-xs text-gray-400 hover:text-red-600"
                  aria-label={`Delete round at ${r.course_name}`}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
