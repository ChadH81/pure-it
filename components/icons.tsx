import type { SVGProps } from "react";

/** Golf flag in a hole — the Pure it! mark. */
export function Flag(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <path
        d="M7 3.5v15"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
      />
      <path d="M7 4.2h9l-2.4 2.9L16 10H7z" fill="currentColor" />
      <ellipse cx="12" cy="19" rx="6.5" ry="1.7" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

/** Nassau — three escalating bets (front / back / overall). */
export function NassauIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.2}
      strokeLinecap="round"
      aria-hidden
      {...props}
    >
      <line x1="6" y1="15.5" x2="6" y2="19" />
      <line x1="12" y1="10" x2="12" y2="19" />
      <line x1="18" y1="5.5" x2="18" y2="19" />
    </svg>
  );
}

/** Skins — a coin (the per-hole pot). */
export function SkinsIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="12" r="8.2" />
      <path d="M12 7.3v9.4" />
      <path d="M14.4 9.2c-.6-.9-4-1.2-4 .6 0 1.7 4 .9 4 2.7 0 1.9-3.6 1.6-4.3.5" />
    </svg>
  );
}

/** Wolf — a paw print. */
export function WolfIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <circle cx="7.2" cy="9.4" r="1.7" />
      <circle cx="10.7" cy="7.1" r="1.8" />
      <circle cx="14.3" cy="7.1" r="1.8" />
      <circle cx="17.8" cy="9.4" r="1.7" />
      <path d="M12.5 11.4c2.4 0 4.6 1.7 4.6 3.8 0 1.9-1.7 2.6-3.3 2.6-.7 0-1 .3-1.3.3s-.6-.3-1.3-.3c-1.6 0-3.3-.7-3.3-2.6 0-2.1 2.2-3.8 4.6-3.8z" />
    </svg>
  );
}

/** Scramble — a team of players. */
export function ScrambleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <circle cx="8.5" cy="8" r="3" />
      <path d="M3 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.6a3 3 0 0 1 0 5.8" />
      <path d="M18 19a5.5 5.5 0 0 0-2.6-4.7" />
    </svg>
  );
}

/** Match Play — a head-to-head split. */
export function MatchPlayIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      aria-hidden
      {...props}
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 3.5v17" />
      <path d="M8.5 8.5 6 12l2.5 3.5" />
      <path d="M15.5 8.5 18 12l-2.5 3.5" />
    </svg>
  );
}

/** Vegas — a die. */
export function VegasIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden {...props}>
      <rect
        x="3.5"
        y="3.5"
        width="17"
        height="17"
        rx="4"
        stroke="currentColor"
        strokeWidth={2}
      />
      <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="8.5" r="1.5" fill="currentColor" />
      <circle cx="12" cy="12" r="1.5" fill="currentColor" />
      <circle cx="8.5" cy="15.5" r="1.5" fill="currentColor" />
      <circle cx="15.5" cy="15.5" r="1.5" fill="currentColor" />
    </svg>
  );
}

export function ArrowRight(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      {...props}
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}
