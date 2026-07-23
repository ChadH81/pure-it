import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { calcLd } from "@/lib/site";

export const metadata: Metadata = {
  title: "Scramble Team Generator — Balanced Golf Teams",
  description:
    "Free golf scramble team generator. Enter players and handicaps and get fair, balanced teams in one tap using a snake draft. Great for outings and leagues.",
  alternates: { canonical: "/games/scramble" },
};

const ld = calcLd({
  name: "Scramble Team Balancer",
  description: "Split golfers into fair, balanced scramble teams by handicap.",
  path: "/games/scramble",
  faq: [
    {
      q: "How do you make fair golf scramble teams?",
      a: "Rank players by handicap and deal them out in a snake draft — first pick one round, last pick the next. This keeps each team's total handicap close, which balances the field.",
    },
    {
      q: "How many teams can I make?",
      a: "The balancer supports 2, 3, or 4 teams from up to 24 players, showing each team's total and average handicap plus the overall spread.",
    },
  ],
});

export default function ScrambleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={ld} />
      {children}
    </>
  );
}
