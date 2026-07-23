import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { calcLd } from "@/lib/site";

export const metadata: Metadata = {
  title: "Nassau Calculator — Front 9, Back 9 & Overall",
  description:
    "Free Nassau golf bet calculator. Enter hole-by-hole scores for two players and instantly settle the front nine, back nine, and overall match. No sign-up.",
  alternates: { canonical: "/games/nassau" },
};

const ld = calcLd({
  name: "Nassau Calculator",
  description: "Settle a Nassau golf bet — front nine, back nine, and overall.",
  path: "/games/nassau",
  faq: [
    {
      q: "What is a Nassau in golf?",
      a: "A Nassau is three bets in one round: the front nine, the back nine, and the overall eighteen. Each is a separate match won by taking the most holes.",
    },
    {
      q: "How do you settle a Nassau bet?",
      a: "Score each nine and the full round as its own match. Whoever wins more holes wins that portion of the bet; the calculator totals the money owed automatically.",
    },
  ],
});

export default function NassauLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={ld} />
      {children}
    </>
  );
}
