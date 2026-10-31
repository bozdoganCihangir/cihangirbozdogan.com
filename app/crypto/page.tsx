import type { Metadata } from "next";
import news from "@/content/news.json";
import type { NewsPayload } from "@/lib/types";
import { PageShell } from "@/components/page-shell";
import { CryptoList, cryptoTocItems } from "@/components/crypto-list";
import { OnThisPage } from "@/components/on-this-page";
import { AUTHOR_NAME, SITE_URL, OG_IMAGE, RSS_ALTERNATE } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { collectionPageLd } from "@/lib/structured-data";

const data = news as NewsPayload;

export const metadata: Metadata = {
  title: "Crypto — Important News, No Price Noise",
  description: `The latest important crypto news — regulation, adoption, protocol upgrades and security incidents — curated by ${AUTHOR_NAME}. No prices, no market commentary.`,
  alternates: { canonical: "/crypto", types: RSS_ALTERNATE },
  openGraph: {
    url: `${SITE_URL}/crypto`,
    title: `Crypto — ${AUTHOR_NAME}`,
    description: `Important crypto news without the price noise, curated by ${AUTHOR_NAME}.`,
    images: [OG_IMAGE],
  },
};

export default function CryptoPage() {
  const stories = data.crypto ?? [];

  return (
    <>
      <JsonLd
        data={collectionPageLd({
          id: "crypto",
          path: "/crypto",
          name: `Crypto — Important News — ${AUTHOR_NAME}`,
          description:
            "The latest important crypto news: regulation, adoption, protocol upgrades and security incidents.",
          dateModified: data.fetched_at,
          items: stories.map((story) => ({ name: story.title, url: story.url })),
        })}
      />
      <PageShell
        sidebar={<OnThisPage items={cryptoTocItems(stories)} />}
        main={<CryptoList stories={stories} updatedAt={data.fetched_at} />}
      />
    </>
  );
}
