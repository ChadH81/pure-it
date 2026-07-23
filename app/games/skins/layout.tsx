import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { calcLd } from "@/lib/site";

export const metadata: Metadata = {
  title: "Skins Calculator — Payouts & Carryovers",
  description:
    "Free golf Skins game calculator for 2–6 players. Handles carryovers and ties automatically, shows who won each hole, and splits the pot. No sign-up.",
  alternates: { canonical: "/games/skins" },
};

const ld = calcLd({
  name: "Skins Calculator",
  description: "Calculate a golf Skins game with carryovers and payouts for 2–6 players.",
  path: "/games/skins",
  faq: [
    {
      q: "How does a Skins game work?",
      a: "Every hole is worth one skin. You win it only with an outright low score. If two or more players tie, the skin carries over to the next hole.",
    },
    {
      q: "What is a carryover in Skins?",
      a: "When a hole is tied, its skin rolls forward and stacks onto the next hole, so a run of ties can make a single hole worth several skins.",
    },
  ],
});

export default function SkinsLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={ld} />
      {children}
    </>
  );
}
