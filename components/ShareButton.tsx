"use client";

import { useState } from "react";

/**
 * Share a result to the group chat. Uses the native share sheet on mobile
 * (navigator.share) and falls back to copying the text + link on desktop.
 *
 * `url` is an optional app-relative path (e.g. /r/skins?d=...) that unfurls
 * into a rich preview card. It's resolved to an absolute URL at click time.
 * When omitted, the current page URL is used.
 */
export default function ShareButton({
  title,
  text,
  url,
  className = "",
}: {
  title: string;
  text: string;
  url?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const link = url
      ? `${origin}${url}`
      : typeof window !== "undefined"
      ? window.location.href
      : "";
    const full = `${text}\n\n${link}`;

    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, text, url: link });
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
