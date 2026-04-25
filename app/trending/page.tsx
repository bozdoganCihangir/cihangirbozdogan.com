import news from "@/content/news.json";
import type { NewsPayload } from "@/lib/types";
import { PageShell } from "@/components/page-shell";
import { TrendingDetail, TrendingTOC } from "@/components/trending-detail";

const data = news as NewsPayload;

export const metadata = {
  title: "Trending · my-news",
  description:
    "Tools, models, APIs and resources gaining traction this week — backend, infra, devops, AI.",
};

export default function TrendingPage() {
  const trending = data.trending ?? [];

  return (
    <PageShell
      sidebar={<TrendingTOC items={trending} />}
      main={<TrendingDetail items={trending} />}
    />
  );
}
