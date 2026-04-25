import news from "@/content/news.json";
import type { NewsPayload } from "@/lib/types";
import { PageShell } from "@/components/page-shell";
import { TrendingDetail, trendingTocItems } from "@/components/trending-detail";
import { OnThisPage } from "@/components/on-this-page";

const data = news as NewsPayload;

export const metadata = {
  title: "Trending · my-news",
  description:
    "Tools, models, APIs and resources gaining traction this week — backend, infra, devops, AI.",
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
