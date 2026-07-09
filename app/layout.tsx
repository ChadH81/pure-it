import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pure it! — Find your next golf game",
  description:
    "Post a round, join a round. Pure it! connects golfers with compatible playing partners at courses near them.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
