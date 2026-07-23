import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Pure it! — Golf game calculators",
    short_name: "Pure it!",
    description:
      "Free calculators for Wolf, Nassau, Skins, and Scramble teams — plus ASAP, a simple way to track how you're playing.",
    start_url: "/",
    display: "standalone",
    background_color: "#1b1f26",
    theme_color: "#1b1f26",
    categories: ["sports", "utilities"],
    icons: [
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
