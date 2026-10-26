import type { Metadata } from "next";
// --- Root layout --------------------------------------------------------
// Wraps every route: global CSS, SEO/OpenGraph defaults (see public/og-image.svg).
// Individual pages override title/description via their own `metadata` export.
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL;

export const metadata: Metadata = {
  title: {
    default: "Wella - Raise what needs fixing",
    template: "%s - Wella",
  },
  description:
    "A visible, accountable way for students to raise welfare issues and see what the union is acting on.",
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  openGraph: {
    type: "website",
    siteName: "Wella",
    title: "Wella - Raise what needs fixing",
    description:
      "Turn scattered welfare complaints into a visible queue the student community can move together.",
    images: [
      { url: "/og-image.svg", width: 1200, height: 630, alt: "Wella welfare issue tracker" },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Wella - Raise what needs fixing",
    description: "See what the union is acting on.",
    images: ["/og-image.svg"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
