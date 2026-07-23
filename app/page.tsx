import Link from "next/link";
import {
  NassauIcon,
  SkinsIcon,
  WolfIcon,
  ScrambleIcon,
  MatchPlayIcon,
  VegasIcon,
  ArrowRight,
} from "@/components/icons";

const calculators = [
  {
    href: "/games/nassau",
    name: "Nassau",
    tag: "2 players",
    blurb: "Front nine, back nine, and the full eighteen — three bets, one match.",
    Icon: NassauIcon,
    accent: "var(--fairway)",
  },
  {
    href: "/games/skins",
    name: "Skins",
    tag: "2–6 players",
    blurb: "A skin on every hole. Win it outright or watch it carry over.",
    Icon: SkinsIcon,
    accent: "var(--gold)",
  },
  {
    href: "/games/wolf",
    name: "Wolf",
    tag: "4 players",
    blurb: "A rotating Wolf picks a partner — or takes on all three alone.",
    Icon: WolfIcon,
    accent: "var(--flag)",
  },
  {
    href: "/games/vegas",
    name: "Vegas",
    tag: "2v2",
    blurb: "Two-digit team numbers and a birdie flip that swings the pot.",
    Icon: VegasIcon,
    accent: "#d98a2b",
  },
  {
    href: "/games/match-play",
    name: "Match Play",
    tag: "2 players",
    blurb: "Head-to-head, hole by hole — up, down, or closed out.",
    Icon: MatchPlayIcon,
    accent: "#8b7cf0",
  },
  {
    href: "/games/scramble",
    name: "Scramble",
    tag: "4–24 players",
    blurb: "Enter handicaps, get perfectly balanced teams in one tap.",
    Icon: ScrambleIcon,
    accent: "#5b8bd0",
  },
];

const steps = [
  { n: "1", t: "Pick your game", d: "Nassau, Skins, or Wolf — open the calculator, no account needed." },
  { n: "2", t: "Punch in the scores", d: "Enter as you play. The result updates live, hole by hole." },
  { n: "3", t: "Share the settlement", d: "One tap drops who-owes-who straight into your group chat." },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4">
      {/* Hero */}
      <section className="grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2">
        <div>
          <span className="chip text-[var(--fairway-light)]">
            Free · No sign-up · No ads
          </span>
          <h1 className="shine-text mt-5 text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl">
            Golf&apos;s side games,{" "}
            <span className="shine-gold">settled in seconds.</span>
          </h1>
          <p className="mt-5 max-w-md text-lg text-[var(--muted)]">
            Punch in the scores and Pure it! tells you exactly who owes who — for
            Wolf, Nassau, and Skins. Then track how you&apos;re playing with ASAP.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/games" className="btn-primary px-6 py-3">
              Open the calculators <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/handicap" className="btn-ghost px-6 py-3">
              Track your ASAP
            </Link>
          </div>
          <p className="mt-6 text-xs font-medium text-[var(--muted)]">
            Works on any phone · Settles Nassau, Skins &amp; Wolf · Free forever
          </p>
        </div>

        {/* Product mock — a live settlement card */}
        <div className="relative">
          <div className="absolute -inset-4 -z-10 rounded-[1.8rem] bg-[var(--fairway-light)]/20 blur-3xl" />
          <div className="result-card rounded-3xl p-6 shadow-xl sm:p-7">
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-2 text-sm font-semibold">
                <SkinsIcon className="h-5 w-5 text-[var(--gold)]" />
                Skins · $2 / skin
              </span>
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                Share result
              </span>
            </div>
            <p className="mt-5 text-xs uppercase tracking-widest text-white/50">Standings</p>
            {[
              { name: "Dana", skins: 5, money: "+$10", lead: true },
              { name: "You", skins: 3, money: "+$6" },
              { name: "Priya", skins: 1, money: "+$2" },
              { name: "Marcus", skins: 0, money: "$0" },
            ].map((r) => (
              <div
                key={r.name}
                className={`mt-2 flex items-center justify-between rounded-xl px-4 py-2.5 ${
                  r.lead ? "bg-white/15" : "bg-white/5"
                }`}
              >
                <span className="font-medium">{r.name}</span>
                <span className="text-sm text-white/70">
                  {r.skins} {r.skins === 1 ? "skin" : "skins"} ·{" "}
                  <span className="font-semibold text-white">{r.money}</span>
                </span>
              </div>
            ))}
            <p className="mt-4 text-xs text-white/40">Live preview · your real card looks just like this</p>
          </div>
        </div>
      </section>

      {/* Game cards */}
      <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {calculators.map(({ href, name, tag, blurb, Icon, accent }) => (
          <Link key={href} href={href} className="card group flex flex-col p-6 transition hover:-translate-y-1 hover:shadow-lg">
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
              Calculate
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </section>

      {/* How it works */}
      <section className="mt-16">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-2 text-3xl font-bold tracking-tight">From first tee to final tab</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="relative">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-[var(--fairway)] text-sm font-bold text-white">
                {s.n}
              </span>
              <h3 className="mt-3 font-bold">{s.t}</h3>
              <p className="mt-1 text-sm text-[var(--muted)]">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ASAP band */}
      <section className="result-card my-16 grid items-center gap-6 rounded-3xl p-8 sm:grid-cols-[1.4fr_1fr] sm:p-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-white/60">Your ASAP</p>
          <h2 className="mt-2 text-3xl font-bold text-white">One number for how you&apos;re playing</h2>
          <p className="mt-3 max-w-md text-white/70">
            Log your rounds and Pure it! keeps a running Adjusted Strokes Against Par —
            a simple, casual read on your game. Free, and yours to share.
          </p>
          <Link
            href="/handicap"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-2.5 font-semibold text-[var(--fairway-dark)] transition hover:bg-white/90"
          >
            Start tracking <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="rounded-2xl bg-white/10 p-6 text-center ring-1 ring-white/10">
          <p className="text-xs uppercase tracking-widest text-white/60">Adjusted Strokes Against Par</p>
          <p className="mt-2 text-6xl font-bold">12.4</p>
          <p className="mt-2 text-sm text-white/60">Best 8 of your last 20 rounds</p>
        </div>
      </section>
    </main>
  );
}
