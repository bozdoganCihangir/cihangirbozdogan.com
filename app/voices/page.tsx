import news from "@/content/news.json";
import type { NewsPayload } from "@/lib/types";
import { VoicesList } from "@/components/voices-list";
import { PageShell } from "@/components/page-shell";
import { OnThisPage } from "@/components/on-this-page";
import { slugify } from "@/lib/slug";

const data = news as NewsPayload;

export const metadata = {
  title: "Voices · my-news",
  description:
    "Latest posts from a curated roster of engineering and AI practitioner blogs.",
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
