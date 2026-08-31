import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";
import { sanityFetch } from "@/sanity/lib/fetch";
import { SITE_SETTINGS_QUERY } from "@/sanity/lib/queries";
import { SITE_URL } from "@/lib/siteConfig";
import "./globals.css";

const arizonaMix = localFont({
  src: "../fonts/ABCArizonaMix-Regular.woff2",
  variable: "--font-heading",
  weight: "400",
  style: "normal",
  display: "swap",
});

const gtStandard = localFont({
  src: [
    {
      path: "../fonts/GT-Standard-L-Standard-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    // De Oblique-varianten worden bewust niet meegeladen: italic komt in de
    // hele codebase niet voor en next/font preload't elke src-entry (~130 KB).
    {
      path: "../fonts/GT-Standard-L-Standard-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/GT-Standard-L-Standard-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-body",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await sanityFetch<{
    metaTitle?: string;
    metaDescription?: string;
  }>({ query: SITE_SETTINGS_QUERY, tags: ["siteSettings"] });

  return {
    metadataBase: new URL(SITE_URL),
    title: settings?.metaTitle ?? "Weverskade | Aandacht voor ruimte",
    description:
      settings?.metaDescription ??
      "Weverskade is een ontwikkelende belegger in woningen en commercieel vastgoed.",
    openGraph: {
      siteName: "Weverskade",
      type: "website",
      locale: "nl_NL",
      images: ["/images/hero-bg.webp"],
    },
    // Next.js will also auto-emit links for app/icon.svg and app/apple-icon
    // thanks to filename conventions — listing them here makes the intent
    // explicit and ensures the SVG is preferred on modern browsers.
    icons: {
      icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
    },
  };
}

// Brand off-white covers the iOS address bar tint and the rubber-band
// overscroll area at top and bottom on every page.
export const viewport: Viewport = {
  themeColor: "#F7F5F0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl" className={`${arizonaMix.variable} ${gtStandard.variable}`}>
      <body className="antialiased bg-off-white text-off-black font-body font-medium">
        {/* iOS 26 Safari samples bg-color of fixed/sticky elements near
            the viewport edges to tint the toolbar/rubber-band. These
            invisible off-white strips (top + bottom) are the qualifying
            elements Safari samples, forcing off-white tinting on every
            page regardless of the Navbar's dynamic theme color or the
            Impact section's sticky bg-green. Rendered before <Navbar>
            so they're the first qualifying elements in DOM order. */}
        <div
          aria-hidden
          className="fixed top-0 left-0 right-0 h-[12px] bg-off-white pointer-events-none"
          style={{ zIndex: -1 }}
        />
        <div
          aria-hidden
          className="fixed bottom-0 left-0 right-0 h-[12px] bg-off-white pointer-events-none"
          style={{ zIndex: -1 }}
        />
        <Navbar />
        <PageTransition>
          {children}
        </PageTransition>
      </body>
    </html>
  );
}
