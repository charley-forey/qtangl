import path from "node:path";
import { fileURLToPath } from "node:url";

import type { NextConfig } from "next";

const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const nextConfig: NextConfig = {
  transpilePackages: ["@qtangl/sdk", "@qtangl/sdk-react"],
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [360, 414, 640, 768, 1024, 1280, 1536, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  turbopack: {
    root: repoRoot,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "status.qtangl.com" }],
        destination: "https://www.qtangl.com/status",
        permanent: true,
      },
      {
        source: "/pqc",
        destination: "/platform",
        permanent: true,
      },
      {
        source: "/demo/pqc",
        has: [{ type: "query", key: "mode", value: "mini" }],
        destination: "/assess/mini",
        permanent: true,
      },
      {
        source: "/demo/pqc/methodology",
        destination: "/assess/methodology",
        permanent: true,
      },
      {
        source: "/demo/pqc",
        destination: "/assess",
        permanent: true,
      },
      {
        source: "/demo",
        has: [{ type: "query", key: "view", value: "sandbox" }],
        destination: "/docs/quickstart",
        permanent: true,
      },
      {
        source: "/demo",
        destination: "/assess",
        permanent: true,
      },
      {
        source: "/demo/:path*",
        destination: "/assess",
        permanent: true,
      },
      {
        source: "/labs",
        destination: "/platform",
        permanent: true,
      },
      {
        source: "/platform/optimize",
        destination: "/platform",
        permanent: true,
      },
      {
        source: "/sandbox",
        destination: "/docs/quickstart",
        permanent: true,
      },
      {
        source: "/technology",
        destination: "/platform",
        permanent: true,
      },
      {
        source: "/api",
        destination: "/docs/api",
        permanent: true,
      },
      {
        source: "/docs/labs",
        destination: "/docs",
        permanent: true,
      },
      {
        source: "/docs/reference/optimize",
        destination: "/docs/api",
        permanent: true,
      },
      {
        source: "/try",
        destination: "/assess",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
