import type { Metadata } from "next";
import news from "@/content/news.json";
import type { NewsPayload } from "@/lib/types";
import { PageShell } from "@/components/page-shell";
import { ToolsDetail, toolsTocItems } from "@/components/tools-detail";
import { OnThisPage } from "@/components/on-this-page";
import { AUTHOR_NAME, SITE_URL, OG_IMAGE, RSS_ALTERNATE } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { collectionPageLd } from "@/lib/structured-data";

const data = news as NewsPayload;

export const metadata: Metadata = {
  title: "Tools — Trending GitHub Repos for Engineers",
  description: `Fifty-plus actively maintained GitHub repos gaining traction this week — agents, infra, data, backend and developer tooling — curated daily by ${AUTHOR_NAME}.`,
  alternates: { canonical: "/tools", types: RSS_ALTERNATE },
  openGraph: {
    url: `${SITE_URL}/tools`,
    title: `Tools — ${AUTHOR_NAME}`,
    description: `Actively maintained GitHub repos gaining traction this week, curated by ${AUTHOR_NAME}.`,
    images: [OG_IMAGE],
  },
};

export default function ToolsPage() {
  const tools = data.tools ?? [];
  const toc = toolsTocItems(tools);

  return (
    <>
      <JsonLd
        data={collectionPageLd({
          id: "tools",
          path: "/tools",
          name: `Trending GitHub Tools — ${AUTHOR_NAME}`,
          description:
            "Actively maintained GitHub repos gaining traction this week across agents, infra, data, backend and developer tooling.",
          dateModified: data.fetched_at,
          items: tools.map((item) => ({ name: item.name, url: item.url })),
        })}
      />
      <PageShell
        sidebar={<OnThisPage items={toc} />}
        main={<ToolsDetail items={tools} updatedAt={data.fetched_at} />}
      />
    </>
  );
}
