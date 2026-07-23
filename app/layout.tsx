import type { Metadata, Viewport } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import JsonLd from "@/components/JsonLd";
import { SITE_URL, SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Pure it! — Free golf game calculators & ASAP tracker",
    template: "%s · Pure it!",
  },
  description:
    "Free calculators for Wolf, Nassau, Skins, and Scramble teams — settle any round in seconds. Plus ASAP, a simple way to track how you're playing. No sign-up needed.",
  applicationName: SITE_NAME,
  keywords: [
    "golf game calculator",
    "nassau calculator",
    "skins calculator",
    "wolf golf game",
    "scramble team generator",
    "golf handicap tracker",
  ],
  appleWebApp: { capable: true, title: SITE_NAME, statusBarStyle: "black-translucent" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: "Pure it! — Free golf game calculators",
    description: "Settle Wolf, Nassau, and Skins in seconds. Free, no sign-up.",
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  themeColor: "#1b1f26",
};

const siteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: SITE_NAME,
  url: SITE_URL,
  description: "Free golf game calculators (Wolf, Nassau, Skins, Scramble) and an ASAP tracker.",
  publisher: { "@type": "Organization", name: SITE_NAME, url: SITE_URL },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col antialiased">
        <JsonLd data={siteJsonLd} />
        <Nav />
        <div className="flex-1">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
