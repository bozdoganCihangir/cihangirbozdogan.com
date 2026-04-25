import { ImageResponse } from "next/og";
import { AUTHOR_NAME, SITE_TAGLINE } from "@/lib/seo";

export const alt = `${AUTHOR_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#fff1e5",
          color: "#262a33",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 96px",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#990f3d",
              color: "#fff1e5",
              fontSize: 48,
              fontWeight: 700,
              fontFamily: "Georgia, serif",
              letterSpacing: "-0.04em",
              paddingBottom: 4,
              borderRadius: 6,
            }}
          >
            C
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "#990f3d",
              fontWeight: 700,
            }}
          >
            cihangirbozdogan.com
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              fontSize: 96,
              fontWeight: 700,
              lineHeight: 1.05,
              letterSpacing: "-0.02em",
            }}
          >
            {AUTHOR_NAME}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 44,
              lineHeight: 1.25,
              color: "#66605c",
              maxWidth: 980,
            }}
          >
            {`${SITE_TAGLINE} — trending tools, models, APIs, and writing from practitioner blogs.`}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            fontSize: 20,
            color: "#94908c",
            borderTop: "1px solid #ccc1b7",
            paddingTop: 24,
          }}
        >
          <div style={{ display: "flex", gap: 32 }}>
            <div style={{ display: "flex" }}>News</div>
            <div style={{ display: "flex" }}>Voices</div>
            <div style={{ display: "flex" }}>Trending</div>
          </div>
          <div style={{ display: "flex" }}>
            Senior Software Engineer · London
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
