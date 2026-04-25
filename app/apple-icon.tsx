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
          background: "#990f3d",
          color: "#fff1e5",
          fontSize: 132,
          fontWeight: 700,
          fontFamily: "Georgia, serif",
          letterSpacing: "-0.04em",
          paddingBottom: 8,
        }}
      >
        C
      </div>
    ),
    { ...size }
  );
}
