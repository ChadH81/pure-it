"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/lib/useUser";

export default function Nav() {
  const { user, profile, loading } = useUser();
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header className="border-b border-gray-200 bg-white/70 backdrop-blur">
      <nav className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-bold text-[var(--fairway-dark)]">
          Pure it!
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/games" className="hover:underline">
            Games
          </Link>
          {loading ? null : user ? (
            <>
              <Link href="/profile" className="hover:underline">
                {profile?.display_name ?? "Profile"}
              </Link>
              <button onClick={signOut} className="text-gray-500 hover:underline">
                Sign out
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-lg bg-[var(--fairway)] px-3 py-1.5 font-semibold text-white"
            >
              Sign in
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
