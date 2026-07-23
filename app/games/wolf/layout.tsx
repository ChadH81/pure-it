import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { calcLd } from "@/lib/site";

export const metadata: Metadata = {
  title: "Wolf Calculator — Points & Settlement",
  description:
    "Free Wolf golf game calculator for 4 players. Rotating Wolf, partner or lone-wolf holes, automatic points and zero-sum money settlement. No sign-up.",
  alternates: { canonical: "/games/wolf" },
};

const ld = calcLd({
  name: "Wolf Calculator",
  description: "Score and settle the Wolf golf game for four players.",
  path: "/games/wolf",
  faq: [
    {
      q: "How do you play Wolf in golf?",
      a: "Four players take turns being the Wolf each hole. After the tee shots, the Wolf either picks a partner for a 2-v-2 or plays alone against the other three for more points.",
    },
    {
      q: "How is Wolf scored?",
      a: "Winning partners score points together; a winning lone wolf scores more. This calculator tallies points and settles the money zero-sum against the group average.",
    },
  ],
});

export default function WolfLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <JsonLd data={ld} />
      {children}
    </>
  );
}
