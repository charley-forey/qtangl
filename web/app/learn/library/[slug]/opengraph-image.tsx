import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";

import { getLibraryEntryOrNull } from "@/lib/library";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

type ResourceImageProps = {
  params: Promise<{ slug: string }>;
};

export default async function OpenGraphImage({ params }: ResourceImageProps) {
  const { slug } = await params;
  const entry = await getLibraryEntryOrNull(slug);

  if (!entry) {
    notFound();
  }

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
              gap: 18,
              alignItems: "center",
              fontSize: 18,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "rgba(255,255,255,0.68)",
            }}
          >
            <span>{entry.category.title}</span>
            <span>{entry.owner}</span>
          </div>

          <div style={{ fontSize: 64, lineHeight: 1.08, maxWidth: 950, fontWeight: 600 }}>
            {entry.title}
          </div>

          <div
            style={{
              fontSize: 28,
              lineHeight: 1.35,
              maxWidth: 980,
              color: "rgba(255,255,255,0.82)",
            }}
          >
            {entry.summary}
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid rgba(255,255,255,0.14)",
            paddingTop: 28,
          }}
        >
          <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
            {[entry.primaryLanguage, entry.license].map((item) => (
              <span
                key={item}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "10px 18px",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.16)",
                  fontSize: 20,
                  color: "rgba(255,255,255,0.82)",
                }}
              >
                {item}
              </span>
            ))}
          </div>

          <div style={{ fontSize: 24, color: "rgba(255,255,255,0.72)" }}>
            Qtangl Learn
          </div>
        </div>
      </div>
    ),
    size
  );
}
