import type { Metadata } from "next";
import news from "@/content/news.json";
import type { NewsPayload } from "@/lib/types";
import { PageShell } from "@/components/page-shell";
import { TrendingDetail, trendingTocItems } from "@/components/trending-detail";
import { OnThisPage } from "@/components/on-this-page";
import { AUTHOR_NAME, SITE_URL, OG_IMAGE } from "@/lib/seo";

const data = news as NewsPayload;

export const metadata: Metadata = {
  title: "Trending — Tools, Models & APIs This Week",
  description: `Tools, models, APIs and resources gaining traction this week — backend, infra, devops, and AI — curated daily by ${AUTHOR_NAME}.`,
  alternates: { canonical: "/trending" },
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
    <PageShell
      sidebar={<OnThisPage items={toc} />}
      main={<TrendingDetail items={trending} />}
    />
  );
}
