import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "radial-gradient(ellipse at 35% 30%, #4da8cc 0%, #1a6080 45%, #0a2a3d 100%)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Bølgekam-glow */}
        <div
          style={{
            position: "absolute",
            top: 52,
            left: 47,
            width: 17,
            height: 17,
            borderRadius: "50%",
            background: "#e8f4f8",
            boxShadow: "0 0 18px rgba(232, 244, 248, 0.6)",
          }}
        />
        {/* Bølgelinjer i bakgrunnen */}
        <div
          style={{
            position: "absolute",
            bottom: 26,
            left: 0,
            width: "100%",
            height: 3,
            background: "rgba(232, 244, 248, 0.25)",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 17,
            left: 0,
            width: "100%",
            height: 2,
            background: "rgba(232, 244, 248, 0.15)",
            borderRadius: 2,
          }}
        />
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 105,
            fontStyle: "italic",
            fontWeight: 500,
            color: "#f5f9fb",
            letterSpacing: "-0.04em",
            marginTop: 16,
          }}
        >
          B
        </div>
      </div>
    ),
    { ...size }
  );
}
