import type { Metadata } from "next";
import news from "@/content/news.json";
import type { NewsPayload } from "@/lib/types";
import { PageShell } from "@/components/page-shell";
import { YouTubeList, youtubeTocItems } from "@/components/youtube-list";
import { OnThisPage } from "@/components/on-this-page";
import { AUTHOR_NAME, SITE_URL, OG_IMAGE, RSS_ALTERNATE } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { collectionPageLd } from "@/lib/structured-data";

const data = news as NewsPayload;

export const metadata: Metadata = {
  title: "YouTube — Short Tech & AI Videos Worth Watching",
  description: `Short, substantive videos from the last two weeks on AI, software engineering, cloud and startups — filtered for learning value by ${AUTHOR_NAME}.`,
  alternates: { canonical: "/youtube", types: RSS_ALTERNATE },
  openGraph: {
    url: `${SITE_URL}/youtube`,
    title: `YouTube — ${AUTHOR_NAME}`,
    description: `Short tech & AI videos from the last two weeks, filtered for learning value by ${AUTHOR_NAME}.`,
    images: [OG_IMAGE],
  },
};

export default function YouTubePage() {
  const videos = data.youtube ?? [];

  return (
    <>
      <JsonLd
        data={collectionPageLd({
          id: "youtube",
          path: "/youtube",
          name: `YouTube — Short Tech & AI Videos — ${AUTHOR_NAME}`,
          description:
            "Short, substantive videos from the last two weeks on AI, software engineering, cloud and startups.",
          dateModified: data.fetched_at,
          items: videos.map((video) => ({ name: video.title, url: video.url })),
        })}
      />
      <PageShell
        sidebar={<OnThisPage items={youtubeTocItems(videos)} />}
        main={<YouTubeList videos={videos} updatedAt={data.fetched_at} />}
      />
    </>
  );
}
