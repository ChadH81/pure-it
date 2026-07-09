"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  addMessage,
  CURRENT_USER,
  formatTeeTime,
  getGames,
  isJoined,
  joinGame,
  leaveGame,
  prefsLine,
  slotsOpen,
  subscribe,
} from "@/lib/store";

export default function GameDetailPage() {
  const params = useParams<{ id: string }>();
  const games = useSyncExternalStore(subscribe, getGames, getGames);
  const game = games.find((g) => g.id === params.id);
  const [draft, setDraft] = useState("");

  if (!game) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Game not found</h1>
        <Link
          href="/games"
          className="mt-4 inline-block text-[var(--fairway)] hover:underline"
        >
          ← Back to games
        </Link>
      </main>
    );
  }

  const joined = isJoined(game);
  const open = slotsOpen(game);
  const isHost = game.host.name === CURRENT_USER.name;

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!game) return;
    addMessage(game.id, draft);
    setDraft("");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/games" className="text-sm text-[var(--fairway)] hover:underline">
        ← Back to games
      </Link>

      <div className="mt-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{game.course}</h1>
            <p className="text-sm text-gray-500">{game.city}</p>
          </div>
          <span className="rounded-full bg-[var(--sand)] px-3 py-1 text-xs font-semibold text-[var(--fairway-dark)]">
            {game.format}
          </span>
        </div>

        <p className="mt-4 text-lg font-semibold">{formatTeeTime(game.teeTime)}</p>
        <p className="mt-1 text-sm text-gray-600">{prefsLine(game)}</p>
        {game.notes && (
          <p className="mt-3 rounded-lg bg-[var(--sand)] p-3 text-sm">{game.notes}</p>
        )}

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Players ({game.players.length}/{game.slotsTotal})
        </h2>
        <ul className="mt-2 space-y-2">
          {game.players.map((p) => (
            <li
              key={p.name}
              className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm"
            >
              <span className="font-medium">
                {p.name}
                {p.name === game.host.name && (
                  <span className="ml-2 rounded bg-[var(--fairway)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    Host
                  </span>
                )}
              </span>
              <span className="text-gray-500">hcp {p.handicap}</span>
            </li>
          ))}
          {open > 0 && (
            <li className="rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-400">
              {open} open {open === 1 ? "spot" : "spots"}
            </li>
          )}
        </ul>

        <div className="mt-6">
          {isHost ? (
            <p className="text-sm text-gray-500">
              You&apos;re hosting this round.
            </p>
          ) : joined ? (
            <button
              onClick={() => leaveGame(game.id)}
              className="w-full rounded-lg border border-red-300 px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50"
            >
              Leave game
            </button>
          ) : open > 0 ? (
            <button
              onClick={() => joinGame(game.id)}
              className="w-full rounded-lg bg-[var(--fairway)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--fairway-dark)]"
            >
              Join game
            </button>
          ) : (
            <p className="text-center text-sm font-semibold text-gray-500">
              This game is full.
            </p>
          )}
        </div>
      </div>

      {(joined || isHost) && (
        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Game thread
          </h2>
          <ul className="mt-3 space-y-3">
            {game.messages.length === 0 && (
              <li className="text-sm text-gray-400">
                No messages yet. Say hi and sort out the details.
              </li>
            )}
            {game.messages.map((m) => (
              <li key={m.id} className="text-sm">
                <span className="font-semibold">{m.author}: </span>
                <span>{m.body}</span>
              </li>
            ))}
          </ul>
          <form onSubmit={handleSend} className="mt-4 flex gap-2">
            <input
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[var(--fairway)] focus:outline-none"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Message the group…"
            />
            <button
              type="submit"
              className="rounded-lg bg-[var(--fairway)] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[var(--fairway-dark)]"
            >
              Send
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
