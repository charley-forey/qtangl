import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
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
          justifyContent: "center",
          padding: 64,
          background: "#000",
          color: "#fff",
          fontFamily: "Inter, sans-serif",
        }}
      >
        <p style={{ fontSize: 28, opacity: 0.7 }}>Qtangl</p>
        <h1 style={{ fontSize: 56, fontWeight: 700, marginTop: 16 }}>Q-Day readiness scanner</h1>
        <p style={{ fontSize: 24, marginTop: 24, maxWidth: 800, lineHeight: 1.4 }}>
          Inventory quantum-vulnerable crypto · Mosca HNDL risk · ML-KEM handshake proof
        </p>
      </div>
    ),
    size
  );
}
