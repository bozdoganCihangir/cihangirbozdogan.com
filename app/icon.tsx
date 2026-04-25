import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
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
          background: "#990f3d",
          color: "#fff1e5",
          fontSize: 24,
          fontWeight: 700,
          fontFamily: "Georgia, serif",
          letterSpacing: "-0.04em",
          paddingBottom: 2,
        }}
      >
        C
      </div>
    ),
    { ...size }
  );
}
