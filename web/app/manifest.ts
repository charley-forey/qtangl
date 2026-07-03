import type { MetadataRoute } from "next";

import { siteMetadata } from "@/lib/copy/product";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteMetadata.name,
    short_name: siteMetadata.name,
    description: siteMetadata.description,
    // Marketing site is the default install target. Operators who install the
    // PWA for daily use can jump straight to the Command Center via the shortcut
    // below (or set NEXT_PUBLIC start_url override to "/command-center").
    start_url: "/",
    display: "standalone",
    background_color: "#020202",
    theme_color: "#020202",
    shortcuts: [
      {
        name: "Command Center",
        short_name: "Command Center",
        description: "Open your Qtangl Command Center dashboard.",
        url: "/command-center",
      },
    ],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
