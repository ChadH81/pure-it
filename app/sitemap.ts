import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const paths: { path: string; priority: number }[] = [
    { path: "", priority: 1 },
    { path: "/games", priority: 0.9 },
    { path: "/games/nassau", priority: 0.9 },
    { path: "/games/skins", priority: 0.9 },
    { path: "/games/wolf", priority: 0.9 },
    { path: "/games/vegas", priority: 0.9 },
    { path: "/games/match-play", priority: 0.9 },
    { path: "/games/scramble", priority: 0.9 },
    { path: "/handicap", priority: 0.8 },
    { path: "/login", priority: 0.3 },
  ];

  return paths.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority,
  }));
}
