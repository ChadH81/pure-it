import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Wolf Calculator — Points & Settlement | Pure it!",
  description:
    "Free Wolf golf game calculator for 4 players. Rotating Wolf, partner or lone-wolf holes, automatic points and zero-sum money settlement. No sign-up.",
};

export default function WolfLayout({ children }: { children: React.ReactNode }) {
  return children;
}
