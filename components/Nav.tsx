"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/useUser";
import { Flag } from "@/components/icons";

const links = [
  { href: "/games", label: "Games" },
  { href: "/handicap", label: "ASAP" },
];

export default function Nav() {
  const { user, profile, loading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  const isActive = (href: string) =>
    href === "/games" ? pathname.startsWith("/games") : pathname === href;

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--line)] bg-[var(--sand)]/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-bold text-[var(--ink)]">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-[var(--fairway)] text-white">
            <Flag className="h-4 w-4" />
          </span>
          Pure it!
        </Link>

        <div className="flex items-center gap-1 text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-full px-3 py-1.5 font-medium transition ${
                isActive(l.href)
                  ? "bg-[var(--fairway)] text-white"
                  : "text-[var(--muted)] hover:bg-white/10 hover:text-[var(--ink)]"
              }`}
            >
              {l.label}
            </Link>
          ))}

          <span className="mx-1 h-5 w-px bg-[var(--line)]" aria-hidden />

          {loading ? null : user ? (
            <>
              <Link
                href="/profile"
                className="rounded-full px-3 py-1.5 font-medium text-[var(--muted)] transition hover:bg-white/10 hover:text-[var(--ink)]"
              >
                {profile?.display_name ?? "Profile"}
              </Link>
              <button
                onClick={signOut}
                className="rounded-full px-3 py-1.5 text-[var(--muted)] transition hover:bg-white/10 hover:text-[var(--ink)]"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/login?mode=signup" className="btn-primary px-4 py-1.5 text-sm">
              Sign up
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
