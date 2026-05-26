import { ImageResponse } from "next/og";

import { homeHero } from "@/lib/copy/home";
import { siteMetadata } from "@/lib/copy/product";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "56px 64px",
          background: "#000",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at center, rgba(255,255,255,0.10), transparent 55%)",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 24, position: "relative" }}>
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 18,
              border: "1px solid rgba(255,255,255,0.12)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255,255,255,0.02)",
            }}
          >
            <svg width="60" height="60" viewBox="0 0 128 128" fill="none">
              <circle cx="28" cy="64" r="8" fill="white" />
              <circle cx="100" cy="64" r="8" fill="white" />
              <circle cx="64" cy="64" r="4" fill="rgba(255,255,255,0.62)" />
              <path
                d="M28 64C41.3333 46 53.3333 40 64 64C74.6667 88 86.6667 82 100 64"
                stroke="white"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <path
                d="M28 64C41.3333 80 53.3333 88 64 64C74.6667 40 86.6667 48 100 64"
                stroke="rgba(255,255,255,0.46)"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: 18,
                letterSpacing: 5,
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.7)",
              }}
            >
              {homeHero.eyebrow}
            </div>
            <div style={{ fontSize: 54, lineHeight: 1.08, maxWidth: 760, fontWeight: 600 }}>
              {siteMetadata.oneLiner}
            </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.12)",
            paddingTop: 28,
            fontSize: 24,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          <span>Scheduling</span>
          <span>Routing</span>
          <span>Allocation</span>
        </div>
      </div>
    ),
    size
  );
}
