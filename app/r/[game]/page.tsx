import Link from "next/link";
import type { Metadata } from "next";
import { decodeShare } from "@/lib/share";
import { ArrowRight } from "@/components/icons";

type Params = { game: string };
type Search = { d?: string };

const CALC_SLUGS = new Set(["nassau", "skins", "wolf", "scramble", "vegas", "match-play"]);

function ogUrl(d?: string) {
  return d ? `/og?d=${encodeURIComponent(d)}` : "/og";
}

export async function generateMetadata({
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}): Promise<Metadata> {
  const { d } = await searchParams;
  const payload = decodeShare(d);
  const title = payload ? `${payload.game} result · Pure it!` : "Pure it! — golf game calculators";
  const description = payload?.headline ?? "Free golf game calculators — Wolf, Nassau & Skins.";
  const image = ogUrl(d);

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [{ url: image, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ResultPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: Promise<Search>;
}) {
  const { game } = await params;
  const { d } = await searchParams;
  const payload = decodeShare(d);

  if (!payload) {
    return (
      <main className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-3xl font-bold">That result link looks incomplete</h1>
        <p className="mt-3 text-[var(--muted)]">
          No worries — you can run your own in a few taps.
        </p>
        <Link href="/games" className="btn-primary mt-6 inline-flex px-6 py-3">
          Open the calculators <ArrowRight className="h-4 w-4" />
        </Link>
      </main>
    );
  }

  const calcHref =
    game === "asap" ? "/handicap" : CALC_SLUGS.has(game) ? `/games/${game}` : "/games";
  const ctaLabel = game === "asap" ? "Track your own ASAP" : `Try the ${payload.game} calculator`;

  return (
    <main className="mx-auto max-w-xl px-4 py-14">
      <p className="eyebrow text-center">{payload.game} result</p>

      <div className="result-card mt-4 p-7">
        <p className="text-2xl font-bold">{payload.headline}</p>
        {payload.sub && <p className="mt-1 text-sm text-white/60">{payload.sub}</p>}

        <div className="mt-5 flex flex-col gap-2">
          {payload.rows.map((r, i) => (
            <div
              key={i}
              className={`flex items-center justify-between rounded-xl px-4 py-2.5 ${
                r.lead ? "bg-[var(--fairway-light)]/15" : "bg-white/5"
              }`}
            >
              <span className="font-medium">{r.label}</span>
              <span className="font-semibold text-[var(--fairway-light)]">{r.value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 text-center">
        <h2 className="text-xl font-bold">Settle your own round free</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          No account, no ads — just enter the scores and Pure it! does the math.
        </p>
        <Link href={calcHref} className="btn-primary mt-5 inline-flex px-6 py-3">
          {ctaLabel} <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
