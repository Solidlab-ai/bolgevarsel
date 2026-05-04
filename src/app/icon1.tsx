import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

export default function Icon1() {
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
          borderRadius: 115,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Bølgekam-glow */}
        <div
          style={{
            position: "absolute",
            top: 152,
            left: 137,
            width: 50,
            height: 50,
            borderRadius: "50%",
            background: "#e8f4f8",
            boxShadow: "0 0 50px rgba(232, 244, 248, 0.6)",
          }}
        />
        {/* Bølgelinjer i bakgrunnen */}
        <div
          style={{
            position: "absolute",
            bottom: 78,
            left: 0,
            width: "100%",
            height: 8,
            background: "rgba(232, 244, 248, 0.25)",
            borderRadius: 4,
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 50,
            left: 0,
            width: "100%",
            height: 5,
            background: "rgba(232, 244, 248, 0.15)",
            borderRadius: 3,
          }}
        />
        <div
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 300,
            fontStyle: "italic",
            fontWeight: 500,
            color: "#f5f9fb",
            letterSpacing: "-0.04em",
            marginTop: 50,
          }}
        >
          B
        </div>
      </div>
    ),
    { ...size }
  );
}
