import Link from "next/link";
import type { Metadata } from "next";
import { NassauIcon, SkinsIcon, WolfIcon, ScrambleIcon, ArrowRight } from "@/components/icons";

export const metadata: Metadata = {
  title: "Golf game calculators — Wolf, Nassau & Skins | Pure it!",
  description:
    "Free, instant settlement calculators for the most popular golf betting games: Wolf, Nassau, and Skins. Enter scores, see who owes who. No sign-up.",
};

const games = [
  {
    href: "/games/nassau",
    name: "Nassau",
    tag: "2 players",
    blurb:
      "Three bets in one — front nine, back nine, and the full eighteen. The classic match-play wager.",
    Icon: NassauIcon,
    accent: "var(--fairway)",
  },
  {
    href: "/games/skins",
    name: "Skins",
    tag: "2–6 players",
    blurb:
      "Every hole is worth a skin. Win it outright or it carries over. Ties push the pot forward.",
    Icon: SkinsIcon,
    accent: "var(--gold)",
  },
  {
    href: "/games/wolf",
    name: "Wolf",
    tag: "4 players",
    blurb:
      "A rotating Wolf each hole picks a partner — or goes it alone against the other three for bigger points.",
    Icon: WolfIcon,
    accent: "var(--flag)",
  },
  {
    href: "/games/scramble",
    name: "Scramble",
    tag: "4–24 players",
    blurb:
      "Enter everyone's handicap and get the fairest possible teams in one tap — perfect for outings and leagues.",
    Icon: ScrambleIcon,
    accent: "#5b8bd0",
  },
];

export default function GamesHub() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <div className="max-w-2xl">
        <p className="eyebrow">Game calculators</p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight">Settle any round in seconds</h1>
        <p className="mt-3 text-lg text-[var(--muted)]">
          Pick your game, punch in the scores, and see exactly who owes who. Free,
          no account, no ads. Share the result straight to your group chat.
        </p>
      </div>

      <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {games.map(({ href, name, tag, blurb, Icon, accent }) => (
          <Link
            key={href}
            href={href}
            className="card group flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span
                className="grid h-12 w-12 place-items-center rounded-2xl text-white"
                style={{ background: accent }}
              >
                <Icon className="h-6 w-6" />
              </span>
              <span className="chip">{tag}</span>
            </div>
            <h2 className="mt-4 text-xl font-bold">{name}</h2>
            <p className="mt-1 flex-1 text-sm text-[var(--muted)]">{blurb}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[var(--fairway)]">
              Open calculator
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <div className="card mt-8 flex flex-col items-start gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-bold">Want to track how you&apos;re playing?</h3>
          <p className="text-sm text-[var(--muted)]">
            ASAP turns your rounds into one simple number — your Average Strokes
            Above Par.
          </p>
        </div>
        <Link href="/handicap" className="btn-ghost whitespace-nowrap px-4 py-2 text-sm">
          Open ASAP tracker <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
