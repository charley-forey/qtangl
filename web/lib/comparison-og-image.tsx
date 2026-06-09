import { ImageResponse } from "next/og";

export const comparisonOgSize = {
  width: 1200,
  height: 630,
};

export const comparisonOgContentType = "image/png";

type ComparisonOgImageProps = {
  eyebrow?: string;
  title: string;
  description: string;
  footer?: string;
};

export function renderComparisonOgImage({
  eyebrow = "Competitive comparison",
  title,
  description,
  footer = "Qtangl Compare",
}: ComparisonOgImageProps) {
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
          borderTop: "6px solid rgba(255,255,255,0.35)",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top left, rgba(255,255,255,0.10), transparent 40%), radial-gradient(circle at bottom right, rgba(255,255,255,0.06), transparent 36%)",
          }}
        />

        <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.68)",
            }}
          >
            {eyebrow}
          </div>

          <div style={{ fontSize: 58, lineHeight: 1.08, maxWidth: 980, fontWeight: 600 }}>
            {title}
          </div>

          <div
            style={{
              fontSize: 26,
              lineHeight: 1.35,
              maxWidth: 980,
              color: "rgba(255,255,255,0.82)",
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.14)",
            paddingTop: 28,
            fontSize: 24,
            color: "rgba(255,255,255,0.72)",
          }}
        >
          {footer}
        </div>
      </div>
    ),
    comparisonOgSize,
  );
}
