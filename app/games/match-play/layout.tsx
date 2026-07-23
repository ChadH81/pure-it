import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { calcLd } from "@/lib/site";

export const metadata: Metadata = {
  title: "Match Play Counter — Holes Up & Down",
  description:
    "Free golf match play calculator. Track a head-to-head match hole by hole and see the status instantly — 2 up, all square, or closed out 3 & 2. No sign-up.",
  alternates: { canonical: "/games/match-play" },
};

const ld = calcLd({
  name: "Match Play Counter",
  description: "Track a head-to-head golf match play round hole by hole.",
  path: "/games/match-play",
  faq: [
    {
      q: "How is match play scored in golf?",
      a: "Each hole is a separate contest — the lower score wins it. You go one 'up' for each hole won. Total strokes don't matter, only how many holes you are ahead or behind.",
    },
    {
      q: "What does 3 & 2 mean?",
      a: "It means a player was three holes up with only two holes left to play, so the match is mathematically won and ends early.",
    },
  ],
});

export default function MatchPlayLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={ld} />
      {children}
    </>
  );
}
