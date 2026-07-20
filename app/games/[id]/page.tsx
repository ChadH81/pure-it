"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  getGame,
  joinGame,
  leaveGame,
  listMessages,
  sendMessage,
  type GameWithPlayers,
  type MessageRow,
} from "@/lib/db";
import { formatTeeTime, prefsLine, FORMAT_LABELS } from "@/lib/format";
import { useUser } from "@/lib/useUser";

export default function GameDetailPage() {
  const params = useParams<{ id: string }>();
  const { user, loading: userLoading } = useUser();
  const [game, setGame] = useState<GameWithPlayers | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    const g = await getGame(params.id);
    setGame(g);
    if (g && user && g.players.some((p) => p.profile_id === user.id)) {
      setMessages(await listMessages(params.id));
    } else {
      setMessages([]);
    }
  }, [params.id, user]);

  useEffect(() => {
    if (userLoading || !user) {
      if (!userLoading) setLoading(false);
      return;
    }
    refresh()
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [refresh, user, userLoading]);

  if (userLoading || loading) {
    return <main className="mx-auto max-w-2xl px-4 py-10 text-gray-500">Loading…</main>;
  }

  if (!user) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Sign in to view this game</h1>
        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-[var(--fairway)] px-6 py-3 font-semibold text-white"
        >
          Sign in
        </Link>
      </main>
    );
  }

  if (!game) {
    return (
      <main className="mx-auto max-w-2xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Game not found</h1>
        <Link href="/games" className="mt-4 inline-block text-[var(--fairway)] hover:underline">
          ← Back to games
        </Link>
      </main>
    );
  }

  const joined = game.players.some((p) => p.profile_id === user.id);
  const isHost = game.host_id === user.id;
  const open = game.slots_total - game.players.length;

  async function action(fn: () => Promise<void>) {
    setError("");
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/games" className="text-sm text-[var(--fairway)] hover:underline">
        ← Back to games
      </Link>

      <div className="mt-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold">{game.course_name}</h1>
            <p className="text-sm text-gray-500">{game.city}</p>
          </div>
          <span className="rounded-full bg-[var(--sand)] px-3 py-1 text-xs font-semibold text-[var(--fairway-dark)]">
            {FORMAT_LABELS[game.format]}
          </span>
        </div>

        <p className="mt-4 text-lg font-semibold">{formatTeeTime(game.tee_time)}</p>
        <p className="mt-1 text-sm text-gray-600">{prefsLine(game)}</p>
        {game.notes && (
          <p className="mt-3 rounded-lg bg-[var(--sand)] p-3 text-sm">{game.notes}</p>
        )}

        <h2 className="mt-6 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Players ({game.players.length}/{game.slots_total})
        </h2>
        <ul className="mt-2 space-y-2">
          {game.players.map((p) => (
            <li
              key={p.profile_id}
              className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2 text-sm"
            >
              <span className="font-medium">
                {p.display_name}
                {p.profile_id === game.host_id && (
                  <span className="ml-2 rounded bg-[var(--fairway)] px-1.5 py-0.5 text-[10px] font-bold uppercase text-white">
                    Host
                  </span>
                )}
              </span>
              <span className="text-gray-500">
                {p.handicap != null ? `hcp ${p.handicap}` : "hcp —"}
              </span>
            </li>
          ))}
          {open > 0 && (
            <li className="rounded-lg border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-400">
              {open} open {open === 1 ? "spot" : "spots"}
            </li>
          )}
        </ul>

        {error && <p className="mt-4 text-sm font-semibold text-red-600">{error}</p>}

        <div className="mt-6">
          {isHost ? (
            <p className="text-sm text-gray-500">You&apos;re hosting this round.</p>
          ) : joined ? (
            <button
              onClick={() => action(() => leaveGame(game.id, user.id))}
              className="w-full rounded-lg border border-red-300 px-6 py-3 font-semibold text-red-600 transition hover:bg-red-50"
            >
              Leave game
            </button>
          ) : open > 0 ? (
            <button
              onClick={() => action(() => joinGame(game.id, user.id))}
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

      {joined && (
        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Game thread
          </h2>
          <ul className="mt-3 space-y-3">
            {messages.length === 0 && (
              <li className="text-sm text-gray-400">
                No messages yet. Say hi and sort out the details.
              </li>
            )}
            {messages.map((m) => (
              <li key={m.id} className="text-sm">
                <span className="font-semibold">{m.author}: </span>
                <span>{m.body}</span>
              </li>
            ))}
          </ul>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.trim()) return;
              const body = draft;
              setDraft("");
              action(() => sendMessage(game.id, user.id, body));
            }}
            className="mt-4 flex gap-2"
          >
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
