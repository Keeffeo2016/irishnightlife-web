import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileNav } from "@/components/layout/MobileNav";
import { PageViewTracker } from "@/components/analytics/PageViewTracker";
import { resolveMetadataBase } from "@/lib/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Prefer NEXT_PUBLIC_APP_URL when valid http(s); otherwise localhost (matches siteOrigin helpers).
export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: "IrishNightlife.ie — Find Your Night",
  description:
    "Ireland's nightlife discovery platform. Find live music, events, and the best nights out in Dublin, Cork, Galway and beyond.",
  openGraph: {
    images: [{ url: "/brand/logo-original.jpg", width: 1024, height: 490 }],
  },
};

export const viewport: Viewport = {
  themeColor: "#0B1114",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-card focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/60"
        >
          Skip to main content
        </a>
        <PageViewTracker />
        <Navbar />
        <main id="main-content" className="flex-1" tabIndex={-1}>
          {children}
        </main>
        <Footer />
        <MobileNav />
      </body>
    </html>
  );
}
