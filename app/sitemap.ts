import type { MetadataRoute } from "next";

// ─── sitemap.xml ────────────────────────────────────────────────────────────
// Only public, logged-out routes. Requires NEXT_PUBLIC_APP_URL; empty otherwise.
export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_APP_URL;
  if (!origin) return [];
  return ["/", "/login", "/register", "/app", "/app/search"].map((path) => ({ url: new URL(path, origin).toString(), changeFrequency: "daily" as const, priority: path === "/" ? 1 : 0.6 }));
}
