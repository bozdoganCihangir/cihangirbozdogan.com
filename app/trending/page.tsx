import type { Metadata } from "next";
import news from "@/content/news.json";
import type { NewsPayload } from "@/lib/types";
import { PageShell } from "@/components/page-shell";
import { TrendingDetail, trendingTocItems } from "@/components/trending-detail";
import { OnThisPage } from "@/components/on-this-page";
import { AUTHOR_NAME, SITE_URL, OG_IMAGE, RSS_ALTERNATE } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { collectionPageLd } from "@/lib/structured-data";

const data = news as NewsPayload;

export const metadata: Metadata = {
  title: "Trending — Tools, Models & APIs This Week",
  description: `Tools, models, APIs and resources gaining traction this week — backend, infra, devops, and AI — curated daily by ${AUTHOR_NAME}.`,
  alternates: { canonical: "/trending", types: RSS_ALTERNATE },
  openGraph: {
    url: `${SITE_URL}/trending`,
    title: `Trending — ${AUTHOR_NAME}`,
    description: `Tools, models, APIs and resources gaining traction this week, curated by ${AUTHOR_NAME}.`,
    images: [OG_IMAGE],
  },
};

export default function TrendingPage() {
  const trending = data.trending ?? [];
  const toc = trendingTocItems(trending);

  return (
    <>
      <JsonLd
        data={collectionPageLd({
          id: "trending",
          path: "/trending",
          name: `Trending Tools, Models & APIs — ${AUTHOR_NAME}`,
          description:
            "Tools, models, APIs and resources gaining traction this week across backend, infra, devops and AI.",
          dateModified: data.fetched_at,
          items: trending.map((item) => ({ name: item.name, url: item.url })),
        })}
      />
      <PageShell
        sidebar={<OnThisPage items={toc} />}
        main={<TrendingDetail items={trending} updatedAt={data.fetched_at} />}
      />
    </>
  );
}
