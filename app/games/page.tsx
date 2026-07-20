"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { listGames, type GameWithPlayers } from "@/lib/db";
import { formatTeeTime, prefsLine, FORMAT_LABELS } from "@/lib/format";
import { useUser } from "@/lib/useUser";

export default function GamesPage() {
  const { user, loading: userLoading } = useUser();
  const [games, setGames] = useState<GameWithPlayers[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    listGames()
      .then(setGames)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [user, userLoading]);

  if (userLoading || loading) {
    return <main className="mx-auto max-w-2xl px-4 py-10 text-gray-500">Loading…</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Sign in to see games</h1>
        <p className="mt-2 text-gray-600">
          Games are visible to signed-in golfers.
        </p>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-[var(--fairway)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--fairway-dark)]"
        >
          Sign in or create an account
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Games near you</h1>
        <Link
          href="/games/new"
          className="rounded-lg bg-[var(--fairway)] px-4 py-2 font-semibold text-white transition hover:bg-[var(--fairway-dark)]"
        >
          + Host a round
        </Link>
      </div>

      {error && <p className="mb-4 text-sm font-semibold text-red-600">{error}</p>}

      {games.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
          <p className="font-semibold">No upcoming games yet.</p>
          <p className="mt-1 text-sm text-gray-500">
            Be the first — post a round and let others join you.
          </p>
        </div>
      ) : (
        <ul className="space-y-4">
          {games.map((game) => {
            const open = game.slots_total - game.players.length;
            return (
              <li key={game.id}>
                <Link
                  href={`/games/${game.id}`}
                  className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">{game.course_name}</h2>
                      <p className="text-sm text-gray-500">{game.city}</p>
                    </div>
                    <span className="rounded-full bg-[var(--sand)] px-3 py-1 text-xs font-semibold text-[var(--fairway-dark)]">
                      {FORMAT_LABELS[game.format]}
                    </span>
                  </div>
                  <p className="mt-3 text-sm font-medium">
                    {formatTeeTime(game.tee_time)}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">
                    Hosted by {game.host?.display_name ?? "Golfer"}
                    {game.host?.handicap != null && ` (hcp ${game.host.handicap})`} ·{" "}
                    {prefsLine(game)}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      {open > 0
                        ? `${open} of ${game.slots_total} spots open`
                        : "Full"}
                    </span>
                    <span className="text-sm font-semibold text-[var(--fairway)]">
                      View &amp; join →
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
