import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skins Calculator — Payouts & Carryovers | Pure it!",
  description:
    "Free golf Skins game calculator for 2–6 players. Handles carryovers and ties automatically, shows who won each hole, and splits the pot. No sign-up.",
};

export default function SkinsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
