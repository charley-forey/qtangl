import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
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
        source: "/pqc",
        destination: "/platform",
        permanent: true,
      },
      {
        source: "/assess",
        destination: "/assess",
        permanent: true,
      },
      {
        source: "/try",
        destination: "/sandbox",
        permanent: true,
      },
      {
        source: "/demo",
        has: [{ type: "query", key: "view", value: "sandbox" }],
        destination: "/sandbox",
        permanent: true,
      },
      {
        source: "/sandbox",
        has: [{ type: "query", key: "view", value: "sandbox" }],
        destination: "/sandbox",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
