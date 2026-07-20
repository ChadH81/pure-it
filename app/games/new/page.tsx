"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createGame,
  listCourseNames,
  type GameFormat,
  type Pace,
  type WalkRide,
} from "@/lib/db";
import { useUser } from "@/lib/useUser";

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[var(--fairway)] focus:outline-none";
const labelCls = "mb-1 block text-sm font-semibold";

export default function HostGamePage() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const [courses, setCourses] = useState<string[]>([]);
  const [course, setCourse] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [format, setFormat] = useState<GameFormat>("casual_18");
  const [slots, setSlots] = useState(4);
  const [hcpMin, setHcpMin] = useState("");
  const [hcpMax, setHcpMax] = useState("");
  const [pace, setPace] = useState<Pace | "">("");
  const [walkRide, setWalkRide] = useState<WalkRide>("either");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) listCourseNames().then(setCourses).catch(() => {});
  }, [user]);

  if (userLoading) {
    return <main className="mx-auto max-w-xl px-4 py-10 text-gray-500">Loading…</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Sign in to host a round</h1>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-[var(--fairway)] px-6 py-3 font-semibold text-white"
        >
          Sign in
        </Link>
      </main>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!course.trim() || !date || !time) {
      setError("Course, date, and time are required.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const id = await createGame(
        {
          course_name: course.trim(),
          city: city.trim() || null,
          tee_time: new Date(`${date}T${time}:00`).toISOString(),
          format,
          slots_total: slots,
          notes: notes.trim() || null,
          hcp_min: hcpMin === "" ? null : Number(hcpMin),
          hcp_max: hcpMax === "" ? null : Number(hcpMax),
          pace: pace === "" ? null : pace,
          walk_or_ride: walkRide,
        },
        user!.id
      );
      router.push(`/games/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <Link href="/games" className="text-sm text-[var(--fairway)] hover:underline">
        ← Back to games
      </Link>
      <h1 className="mt-1 text-3xl font-bold">Host a round</h1>
      <p className="mt-1 text-sm text-gray-500">
        Post your round and let compatible golfers join you.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className={labelCls} htmlFor="course">Course *</label>
          <input
            id="course"
            className={inputCls}
            list="courses"
            value={course}
            onChange={(e) => setCourse(e.target.value)}
            placeholder="Start typing a course name"
          />
          <datalist id="courses">
            {courses.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>

        <div>
          <label className={labelCls} htmlFor="city">City</label>
          <input
            id="city"
            className={inputCls}
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Urbana, IL"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="date">Date *</label>
            <input
              id="date"
              type="date"
              className={inputCls}
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="time">Tee time *</label>
            <input
              id="time"
              type="time"
              className={inputCls}
              value={time}
              onChange={(e) => setTime(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="format">Format</label>
            <select
              id="format"
              className={inputCls}
              value={format}
              onChange={(e) => setFormat(e.target.value as GameFormat)}
            >
              <option value="casual_18">Casual 18</option>
              <option value="casual_9">Casual 9</option>
              <option value="best_ball_2v2">2v2 Best Ball</option>
              <option value="scramble">Scramble</option>
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="slots">Group size</label>
            <select
              id="slots"
              className={inputCls}
              value={slots}
              onChange={(e) => setSlots(Number(e.target.value))}
            >
              {[2, 3, 4, 5, 6, 7, 8].map((n) => (
                <option key={n} value={n}>
                  {n} players
                </option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="rounded-xl border border-gray-200 bg-white p-4">
          <legend className="px-1 text-sm font-semibold">
            Partner preferences (optional)
          </legend>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls} htmlFor="hcpMin">Handicap min</label>
              <input
                id="hcpMin"
                type="number"
                min={0}
                max={54}
                className={inputCls}
                value={hcpMin}
                onChange={(e) => setHcpMin(e.target.value)}
                placeholder="Any"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="hcpMax">Handicap max</label>
              <input
                id="hcpMax"
                type="number"
                min={0}
                max={54}
                className={inputCls}
                value={hcpMax}
                onChange={(e) => setHcpMax(e.target.value)}
                placeholder="Any"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="pace">Pace</label>
              <select
                id="pace"
                className={inputCls}
                value={pace}
                onChange={(e) => setPace(e.target.value as Pace | "")}
              >
                <option value="">Any</option>
                <option value="relaxed">Relaxed</option>
                <option value="steady">Steady</option>
                <option value="fast">Fast</option>
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="walkRide">Walk / ride</label>
              <select
                id="walkRide"
                className={inputCls}
                value={walkRide}
                onChange={(e) => setWalkRide(e.target.value as WalkRide)}
              >
                <option value="either">Either</option>
                <option value="walk">Walk</option>
                <option value="ride">Ride</option>
              </select>
            </div>
          </div>
        </fieldset>

        <div>
          <label className={labelCls} htmlFor="notes">Notes</label>
          <textarea
            id="notes"
            className={inputCls}
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Anything joiners should know — vibe, wagers, pace, plans after."
          />
        </div>

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-[var(--fairway)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--fairway-dark)] disabled:opacity-50"
        >
          {busy ? "Posting…" : "Post round"}
        </button>
      </form>
    </main>
  );
}
