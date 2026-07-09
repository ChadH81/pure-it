import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[var(--fairway)]">
        Pure it!
      </p>
      <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
        Never hunt for a fourth again.
      </h1>
      <p className="mt-4 max-w-xl text-lg text-gray-600">
        Post a round at your course, or join one nearby. Matched by handicap,
        pace, and vibe — so every round feels like playing with old friends.
      </p>
      <div className="mt-8 flex gap-4">
        <Link
          href="/games"
          className="rounded-lg bg-[var(--fairway)] px-6 py-3 font-semibold text-white transition hover:bg-[var(--fairway-dark)]"
        >
          Browse games
        </Link>
        <Link
          href="/games/new"
          className="rounded-lg border border-[var(--fairway)] px-6 py-3 font-semibold text-[var(--fairway)] transition hover:bg-white"
        >
          Host a round
        </Link>
      </div>
      <p className="mt-12 text-xs text-gray-400">
        Prototype — mock data only. Not affiliated with any golf course.
      </p>
    </main>
  );
}
