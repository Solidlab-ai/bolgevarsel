import { ImageResponse } from "next/og";

export const size = { width: 192, height: 192 };
export const contentType = "image/png";

export default function Icon() {
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
          borderRadius: 43,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Bølgekam-glow */}
        <div
          style={{
            position: "absolute",
            top: 56,
            left: 50,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#e8f4f8",
            boxShadow: "0 0 20px rgba(232, 244, 248, 0.6)",
          }}
        />
        {/* Bølgelinjer i bakgrunnen */}
        <div
          style={{
            position: "absolute",
            bottom: 28,
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
            bottom: 18,
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
            fontSize: 110,
            fontStyle: "italic",
            fontWeight: 500,
            color: "#f5f9fb",
            letterSpacing: "-0.04em",
            marginTop: 18,
          }}
        >
          B
        </div>
      </div>
    ),
    { ...size }
  );
}
