import type { MetadataRoute } from "next";

// ─── robots.txt ─────────────────────────────────────────────────────────────
// Public queue is crawlable; /api/* and the /admin workspace are disallowed.
export default function robots(): MetadataRoute.Robots {
  const origin = process.env.NEXT_PUBLIC_APP_URL;
  return { rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/admin"] }, ...(origin ? { sitemap: new URL("/sitemap.xml", origin).toString() } : {}) };
}
