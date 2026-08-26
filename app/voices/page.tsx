import type { Metadata } from "next";
import news from "@/content/news.json";
import type { NewsPayload } from "@/lib/types";
import { VoicesList } from "@/components/voices-list";
import { PageShell } from "@/components/page-shell";
import { OnThisPage } from "@/components/on-this-page";
import { slugify } from "@/lib/slug";
import { AUTHOR_NAME, SITE_URL, OG_IMAGE, RSS_ALTERNATE } from "@/lib/seo";
import { JsonLd } from "@/components/json-ld";
import { collectionPageLd } from "@/lib/structured-data";


const data = news as NewsPayload;

export const metadata: Metadata = {
  title: "Voices — Curated Engineering & AI Blogs",
  description: `Latest posts from a curated roster of engineering and AI practitioner blogs, hand-picked by ${AUTHOR_NAME}.`,
  alternates: { canonical: "/voices", types: RSS_ALTERNATE },
  openGraph: {
    url: `${SITE_URL}/voices`,
    title: `Voices — ${AUTHOR_NAME}`,
    description: `Latest posts from a curated roster of engineering and AI practitioner blogs, picked by ${AUTHOR_NAME}.`,
    images: [OG_IMAGE],
  },
};

export default function VoicesPage() {
  const voices = data.voices ?? [];
  const populated = voices.filter((v) => v.posts.length > 0);
  const toc = populated.map((v) => ({
    id: slugify(v.author),
    label: v.author,
    count: v.posts.length,
  }));

  return (
    <>
      <JsonLd
        data={collectionPageLd({
          id: "voices",
          path: "/voices",
          name: `Voices — Curated Engineering & AI Blogs — ${AUTHOR_NAME}`,
          description:
            "Latest posts from a curated roster of engineering and AI practitioner blogs.",
          dateModified: data.fetched_at,
          items: populated.flatMap((v) =>
            v.posts.map((post) => ({ name: post.title, url: post.url })),
          ),
        })}
      />
      <PageShell
        sidebar={<OnThisPage items={toc} />}
        main={<VoicesList voices={voices} updatedAt={data.fetched_at} />}
      />
    </>
  );
}
