"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { updateProfile } from "@/lib/db";
import { useUser } from "@/lib/useUser";

export default function ProfilePage() {
  const { user, profile, loading } = useUser();
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!profile) return;
    setName(profile.display_name ?? "");
    setCity(profile.home_city ?? "");
    setBio(profile.bio ?? "");
  }, [profile]);

  if (loading) {
    return <main className="mx-auto max-w-xl px-4 py-10 text-[var(--muted)]">Loading…</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Sign in to edit your profile</h1>
        <Link href="/login" className="btn-primary mt-6 inline-block px-6 py-3">
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
        bio: bio.trim() || null,
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
      <h1 className="text-3xl font-bold tracking-tight">Your profile</h1>
      <p className="mt-1 text-sm text-[var(--muted)]">
        Your name shows on shared ASAP cards. Your current ASAP number is{" "}
        {profile?.handicap != null ? (
          <span className="font-semibold text-[var(--fairway)]">{profile.handicap.toFixed(1)}</span>
        ) : (
          "not set yet"
        )}
        .
      </p>

      <form onSubmit={handleSubmit} className="card mt-8 space-y-5 p-6">
        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="name">
            Display name
          </label>
          <input id="name" className="field" value={name} onChange={(e) => setName(e.target.value)} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="city">
            Home area
          </label>
          <input
            id="city"
            className="field"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Cambridge, ON"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-semibold" htmlFor="bio">
            About you
          </label>
          <textarea
            id="bio"
            rows={3}
            className="field"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Home course, how long you've played, favorite game to gamble on."
          />
        </div>

        {error && <p className="text-sm font-semibold text-red-400">{error}</p>}
        {saved && <p className="text-sm font-semibold text-[var(--fairway)]">Saved.</p>}

        <button type="submit" disabled={busy} className="btn-primary w-full px-6 py-3">
          {busy ? "Saving…" : "Save profile"}
        </button>
      </form>

      <Link
        href="/handicap"
        className="mt-4 inline-block text-sm font-semibold text-[var(--fairway)] hover:underline"
      >
        Go to your ASAP tracker →
      </Link>
    </main>
  );
}
