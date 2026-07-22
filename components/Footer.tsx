import Link from "next/link";
import { Flag } from "@/components/icons";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-[var(--line)]">
      <div className="mx-auto max-w-5xl px-4 py-10">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="flex items-center gap-2 font-bold text-[var(--fairway-dark)]">
              <span className="grid h-6 w-6 place-items-center rounded-md bg-[var(--fairway)] text-white">
                <Flag className="h-3.5 w-3.5" />
              </span>
              Pure it!
            </p>
            <p className="mt-2 max-w-xs text-sm text-[var(--muted)]">
              Free golf game calculators and a simple way to track how you&apos;re
              playing.
            </p>
          </div>

          <nav className="flex gap-10 text-sm">
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Calculators</span>
              <Link href="/games/nassau" className="text-[var(--muted)] hover:text-[var(--fairway)]">
                Nassau
              </Link>
              <Link href="/games/skins" className="text-[var(--muted)] hover:text-[var(--fairway)]">
                Skins
              </Link>
              <Link href="/games/wolf" className="text-[var(--muted)] hover:text-[var(--fairway)]">
                Wolf
              </Link>
            </div>
            <div className="flex flex-col gap-2">
              <span className="font-semibold">Track</span>
              <Link href="/handicap" className="text-[var(--muted)] hover:text-[var(--fairway)]">
                ASAP tracker
              </Link>
              <Link href="/profile" className="text-[var(--muted)] hover:text-[var(--fairway)]">
                Profile
              </Link>
            </div>
          </nav>
        </div>

        <p className="mt-8 border-t border-[var(--line)] pt-6 text-xs text-[var(--muted)]">
          Pure it! is an independent app — not affiliated with, endorsed by, or
          sponsored by the USGA, The R&amp;A, or Golf Canada. ASAP is an unofficial
          estimate and is not a valid handicap for tournament or club competition.
        </p>
      </div>
    </footer>
  );
}
