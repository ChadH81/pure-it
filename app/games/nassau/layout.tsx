import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nassau Calculator — Front 9, Back 9 & Overall | Pure it!",
  description:
    "Free Nassau golf bet calculator. Enter hole-by-hole scores for two players and instantly settle the front nine, back nine, and overall match. No sign-up.",
};

export default function NassauLayout({ children }: { children: React.ReactNode }) {
  return children;
}
