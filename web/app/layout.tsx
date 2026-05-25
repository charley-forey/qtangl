import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

import Footer from "@/components/layout/Footer";
import Navbar from "@/components/layout/Navbar";
import { siteMetadata } from "@/lib/copy/product";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteMetadata.url),
  title: {
    default: siteMetadata.title,
    template: `%s | ${siteMetadata.name}`,
  },
  description: siteMetadata.description,
  openGraph: {
    title: siteMetadata.title,
    description: siteMetadata.description,
    url: siteMetadata.url,
    siteName: siteMetadata.name,
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Qtangl social preview image",
      },
    ],
  },
  icons: {
    icon: "/logo-mark.svg",
    shortcut: "/logo-mark.svg",
    apple: "/logo-mark.svg",
  },
};

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
        <div className="quantum-shell relative flex min-h-screen flex-col overflow-x-hidden">
          <Navbar />
          <div className="relative flex flex-1 flex-col">{children}</div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
