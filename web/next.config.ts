import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async redirects() {
    return [
      {
        source: "/try",
        destination: "/demo?view=sandbox",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
