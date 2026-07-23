/**
 * Compact, URL-safe encoding for a shareable game result.
 *
 * A result is serialized to JSON, then base64url-encoded so it can ride in a
 * query string (e.g. /r/skins?d=...). The same payload feeds two things:
 *   1. the public result page (/r/[game]) a friend lands on, and
 *   2. the dynamic Open Graph image (/og) that unfurls in the group chat.
 *
 * Uses only atob/btoa + TextEncoder/TextDecoder, which exist in the browser,
 * the Edge runtime, and Node 18+, so the same code runs everywhere.
 */

export type ShareRow = { label: string; value: string; lead?: boolean };

export type SharePayload = {
  game: string; // "Nassau" | "Skins" | "Wolf" | "ASAP"
  headline: string; // the one-line takeaway
  rows: ShareRow[]; // leaderboard / segments
  sub?: string; // stakes, e.g. "$2 / skin"
};

function b64urlEncode(s: string): string {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function b64urlDecode(s: string): string {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64);
  const bytes = Uint8Array.from(bin, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export function encodeShare(payload: SharePayload): string {
  return b64urlEncode(JSON.stringify(payload));
}

export function decodeShare(token: string | null | undefined): SharePayload | null {
  if (!token) return null;
  try {
    const parsed = JSON.parse(b64urlDecode(token)) as SharePayload;
    if (!parsed || typeof parsed.game !== "string" || !Array.isArray(parsed.rows)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Build the relative share URL for a result. */
export function shareUrl(gameSlug: string, payload: SharePayload): string {
  return `/r/${gameSlug}?d=${encodeShare(payload)}`;
}
