import type { Metadata } from "next";
import news from "@/content/news.json";
import type { NewsPayload } from "@/lib/types";
import { VoicesList } from "@/components/voices-list";
import { PageShell } from "@/components/page-shell";
import { OnThisPage } from "@/components/on-this-page";
import { slugify } from "@/lib/slug";
import { AUTHOR_NAME, SITE_URL, OG_IMAGE } from "@/lib/seo";


const data = news as NewsPayload;

export const metadata: Metadata = {
  title: "Voices — Curated Engineering & AI Blogs",
  description: `Latest posts from a curated roster of engineering and AI practitioner blogs, hand-picked by ${AUTHOR_NAME}.`,
  alternates: { canonical: "/voices" },
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
    <PageShell
      sidebar={<OnThisPage items={toc} />}
      main={<VoicesList voices={voices} />}
    />
  );
}
