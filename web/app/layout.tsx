import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { DashboardSessionProvider } from "@/components/dashboard/dashboard-session-context";
import { MAIN_CONTENT_ID } from "@/components/layout/PageShell";
import GoogleAnalytics from "@/components/seo/GoogleAnalytics";
import PostHogAnalytics from "@/components/seo/PostHogAnalytics";
import WebVitals from "@/components/seo/WebVitals";
import { buildSiteMetadata, buildSiteViewport } from "@/lib/seo";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = buildSiteMetadata();
export const viewport: Viewport = buildSiteViewport();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetBrainsMono.variable} h-full scroll-smooth antialiased`}
    >
      <body className="min-h-full bg-black text-white">
        <GoogleAnalytics />
        <PostHogAnalytics />
        <WebVitals />
        <Suspense fallback={null}>
          <DashboardSessionProvider>
            <div className="quantum-shell relative flex min-h-dvh flex-col overflow-x-hidden">
            <a
              href={`#${MAIN_CONTENT_ID}`}
              className="sr-only fixed left-4 top-4 z-[60] rounded-full border border-[var(--border-strong)] bg-black px-4 py-2 text-sm text-white focus:not-sr-only"
            >
              Skip to content
            </a>
            <Navbar />
            <div className="relative flex flex-1 flex-col">{children}</div>
            <Footer />
          </div>
          </DashboardSessionProvider>
        </Suspense>
      </body>
    </html>
  );
}
