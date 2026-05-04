import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS bruker IKKE border-radius (Apple legger på sin egen rounded mask).
// Bølger sentrert i 40x40 viewBox med 4 enheter margin på alle sider.
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0a2a3d",
          position: "relative",
        }}
      >
        <svg
          width="180"
          height="180"
          viewBox="0 0 40 40"
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block" }}
        >
          <path
            d="M4 13 Q10 8 16 13 T28 13 T36 13"
            stroke="white"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M4 20 Q10 15 16 20 T28 20 T36 20"
            stroke="white"
            strokeWidth="2.6"
            strokeLinecap="round"
            fill="none"
            opacity="0.85"
          />
          <path
            d="M4 27 Q10 23.5 16 27 T28 27 T36 27"
            stroke="#7dd3fc"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            opacity="0.75"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
