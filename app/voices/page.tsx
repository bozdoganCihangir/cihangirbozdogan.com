import news from "@/content/news.json";
import type { NewsPayload } from "@/lib/types";
import { Trending } from "@/components/trending";
import { VoicesList } from "@/components/voices-list";
import { PageShell } from "@/components/page-shell";

const data = news as NewsPayload;

export const metadata = {
  title: "Voices · my-news",
  description:
    "Latest posts from a curated roster of engineering and AI practitioner blogs.",
};

export default function VoicesPage() {
  const trending = data.trending ?? [];
  const voices = data.voices ?? [];

  return (
    <PageShell
      sidebar={<Trending items={trending} />}
      main={<VoicesList voices={voices} />}
    />
  );
}
