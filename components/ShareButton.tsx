"use client";

import { useState } from "react";

/**
 * Share a result to the group chat. Uses the native share sheet on mobile
 * (navigator.share) and falls back to copying the text + link on desktop.
 * The app URL is always appended so a friend can tap through and try it —
 * the free-marketing loop.
 */
export default function ShareButton({
  title,
  text,
  className = "",
}: {
  title: string;
  text: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const full = `${text}\n\n${url}`;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch {
        // cancelled or unsupported — fall through to clipboard
      }
    }

    try {
      await navigator.clipboard.writeText(full);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — no-op */
    }
  }

  return (
    <button type="button" onClick={share} className={className} aria-live="polite">
      {copied ? "Copied ✓" : "Share result"}
    </button>
  );
}
