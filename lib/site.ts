/** Canonical site origin, resolved from env with sensible fallbacks. */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000");

export const SITE_NAME = "Pure it!";
export const SITE_TAGLINE = "Free golf game calculators & ASAP tracker";

/** Build SoftwareApplication + optional FAQ structured data for a calculator page. */
export function calcLd(opts: {
  name: string;
  description: string;
  path: string;
  faq?: { q: string; a: string }[];
}): Record<string, unknown> {
  const url = `${SITE_URL}${opts.path}`;
  const graph: Record<string, unknown>[] = [
    {
      "@type": "SoftwareApplication",
      name: opts.name,
      url,
      applicationCategory: "SportsApplication",
      operatingSystem: "Web",
      offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      description: opts.description,
    },
  ];
  if (opts.faq?.length) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: opts.faq.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }
  return { "@context": "https://schema.org", "@graph": graph };
}
