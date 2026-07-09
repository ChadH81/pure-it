"use client";

import { useSyncExternalStore } from "react";
import Link from "next/link";
import {
  formatTeeTime,
  getGames,
  prefsLine,
  slotsOpen,
  subscribe,
} from "@/lib/store";

export default function GamesPage() {
  const games = useSyncExternalStore(subscribe, getGames, getGames);

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/" className="text-sm text-[var(--fairway)] hover:underline">
            ← Pure it!
          </Link>
          <h1 className="mt-1 text-3xl font-bold">Games near you</h1>
        </div>
        <Link
          href="/games/new"
          className="rounded-lg bg-[var(--fairway)] px-4 py-2 font-semibold text-white transition hover:bg-[var(--fairway-dark)]"
        >
          + Host a round
        </Link>
      </div>

      <ul className="space-y-4">
        {games.map((game) => {
          const open = slotsOpen(game);
          return (
            <li key={game.id}>
              <Link
                href={`/games/${game.id}`}
                className="block rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{game.course}</h2>
                    <p className="text-sm text-gray-500">{game.city}</p>
                  </div>
                  <span className="rounded-full bg-[var(--sand)] px-3 py-1 text-xs font-semibold text-[var(--fairway-dark)]">
                    {game.format}
                  </span>
                </div>
                <p className="mt-3 text-sm font-medium">
                  {formatTeeTime(game.teeTime)}
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Hosted by {game.host.name} (hcp {game.host.handicap}) ·{" "}
                  {prefsLine(game)}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {open > 0
                      ? `${open} of ${game.slotsTotal} spots open`
                      : "Full"}
                  </span>
                  <span className="text-sm font-semibold text-[var(--fairway)]">
                    View & join →
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
