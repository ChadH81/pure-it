"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { updateProfile, type Pace, type WalkRide } from "@/lib/db";
import { useUser } from "@/lib/useUser";

const inputCls =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-[var(--fairway)] focus:outline-none";
const labelCls = "mb-1 block text-sm font-semibold";

export default function ProfilePage() {
  const { user, profile, loading } = useUser();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [handicap, setHandicap] = useState("");
  const [bio, setBio] = useState("");
  const [pace, setPace] = useState<Pace>("steady");
  const [vibe, setVibe] = useState<"casual" | "social" | "competitive">("casual");
  const [walkRide, setWalkRide] = useState<WalkRide>("either");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.display_name ?? "");
    setCity(profile.home_city ?? "");
    setHandicap(profile.handicap != null ? String(profile.handicap) : "");
    setBio(profile.bio ?? "");
    setPace(profile.pace ?? "steady");
    setVibe(profile.vibe ?? "casual");
    setWalkRide(profile.walk_or_ride ?? "either");
  }, [profile]);

  if (loading) {
    return <main className="mx-auto max-w-xl px-4 py-10 text-gray-500">Loading…</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Sign in to edit your profile</h1>
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
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await updateProfile(user!.id, {
        display_name: name.trim() || "Golfer",
        home_city: city.trim() || null,
        handicap: handicap === "" ? null : Number(handicap),
        bio: bio.trim() || null,
        pace,
        vibe,
        walk_or_ride: walkRide,
      });
      setSaved(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-3xl font-bold">Your golf profile</h1>
      <p className="mt-1 text-sm text-gray-500">
        This is what other golfers see when you join or host a round.
      </p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <div>
          <label className={labelCls} htmlFor="name">Display name</label>
          <input id="name" className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls} htmlFor="handicap">Handicap</label>
            <input
              id="handicap"
              type="number"
              step="0.1"
              min={0}
              max={54}
              className={inputCls}
              value={handicap}
              onChange={(e) => setHandicap(e.target.value)}
              placeholder="e.g. 14"
            />
          </div>
          <div>
            <label className={labelCls} htmlFor="city">Home area</label>
            <input
              id="city"
              className={inputCls}
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Urbana, IL"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelCls} htmlFor="pace">Pace</label>
            <select id="pace" className={inputCls} value={pace} onChange={(e) => setPace(e.target.value as Pace)}>
              <option value="relaxed">Relaxed</option>
              <option value="steady">Steady</option>
              <option value="fast">Fast</option>
            </select>
          </div>
          <div>
            <label className={labelCls} htmlFor="vibe">Vibe</label>
            <select
              id="vibe"
              className={inputCls}
              value={vibe}
              onChange={(e) => setVibe(e.target.value as "casual" | "social" | "competitive")}
            >
              <option value="casual">Casual</option>
              <option value="social">Social</option>
              <option value="competitive">Competitive</option>
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

        <div>
          <label className={labelCls} htmlFor="bio">About you</label>
          <textarea
            id="bio"
            rows={3}
            className={inputCls}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="How long you've played, favorite courses, what you're looking for in a group."
          />
        </div>

        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        {saved && <p className="text-sm font-semibold text-[var(--fairway)]">Saved.</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-[var(--fairway)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--fairway-dark)] disabled:opacity-50"
        >
          {busy ? "Saving…" : "Save profile"}
        </button>
      </form>
    </main>
  );
}
