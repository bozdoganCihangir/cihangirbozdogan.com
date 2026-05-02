import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { AUTHOR_NAME, SITE_TAGLINE } from "@/lib/seo";

export const alt = `${AUTHOR_NAME} — ${SITE_TAGLINE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  const photo = readFileSync(
    join(process.cwd(), "public", "cihangir-bozdogan.png")
  );
  const photoSrc = `data:image/png;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#fff1e5",
          color: "#262a33",
          display: "flex",
          fontFamily: "Georgia, serif",
        }}
      >
        <div
          style={{
            width: 520,
            height: "100%",
            display: "flex",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoSrc}
            alt={AUTHOR_NAME}
            width={520}
            height={630}
            style={{
              width: 520,
              height: 630,
              objectFit: "cover",
              objectPosition: "center",
            }}
          />
        </div>

        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 72px 60px 72px",
          }}
        >
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
                fontSize: 80,
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
                fontSize: 34,
                lineHeight: 1.25,
                color: "#66605c",
              }}
            >
              {SITE_TAGLINE}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 20,
              color: "#94908c",
              borderTop: "1px solid #ccc1b7",
              paddingTop: 20,
            }}
          >
            Senior Software Engineer · London
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
