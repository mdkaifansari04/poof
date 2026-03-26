import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Poof — Expiring Photo Sharing";
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
          padding: 64,
          background:
            "radial-gradient(circle at 20% 20%, rgba(124, 58, 237, 0.35), transparent 40%), radial-gradient(circle at 80% 80%, rgba(249, 115, 22, 0.25), transparent 35%), #0d0d0d",
          color: "white",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            fontSize: 28,
            opacity: 0.9,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#86efac",
            }}
          />
          Poof
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 74,
              fontWeight: 800,
              lineHeight: 1.05,
              maxWidth: 980,
              letterSpacing: -1.5,
            }}
          >
            Share photos with links that expire.
          </div>
          <div style={{ fontSize: 30, opacity: 0.85, maxWidth: 980 }}>
            Gallery, single-image, and multi-image sharing with revocation and automatic expiry.
          </div>
        </div>

        <div style={{ fontSize: 24, opacity: 0.72 }}>poof.k04.tech</div>
      </div>
    ),
    size,
  );
}
