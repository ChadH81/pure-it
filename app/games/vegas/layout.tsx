import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { calcLd } from "@/lib/site";

export const metadata: Metadata = {
  title: "Vegas Calculator — 2v2 Golf Game & Birdie Flip",
  description:
    "Free Vegas golf game calculator for two teams of two. Combines each team's scores into a number, handles the birdie flip, and settles the points. No sign-up.",
  alternates: { canonical: "/games/vegas" },
};

const ld = calcLd({
  name: "Vegas Calculator",
  description: "Score and settle the 2-v-2 Vegas golf gambling game, including the birdie flip.",
  path: "/games/vegas",
  faq: [
    {
      q: "How do you play Vegas in golf?",
      a: "Two teams of two. On each hole, a team's two scores make a two-digit number with the lower score first. The team with the lower number wins, and the gap between the numbers is the points.",
    },
    {
      q: "What is the birdie flip in Vegas?",
      a: "When a team makes a birdie, the opposing team's number is flipped so the higher score becomes the tens digit — a big swing that can turn an ordinary hole into a huge one.",
    },
  ],
});

export default function VegasLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={ld} />
      {children}
    </>
  );
}
