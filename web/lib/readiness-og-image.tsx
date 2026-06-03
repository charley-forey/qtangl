import { ImageResponse } from "next/og";

export const readinessOgSize = {
  width: 1200,
  height: 630,
};

export const readinessOgContentType = "image/png";

type ReadinessOgImageProps = {
  eyebrow: string;
  title: string;
  description: string;
  footer?: string;
};

export function renderReadinessOgImage({
  eyebrow,
  title,
  description,
  footer = "Qtangl",
}: ReadinessOgImageProps) {
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
              "radial-gradient(circle at top left, rgba(255,255,255,0.10), transparent 40%), radial-gradient(circle at bottom right, rgba(255,255,255,0.08), transparent 36%)",
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
    readinessOgSize
  );
}
