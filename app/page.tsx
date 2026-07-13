import type { Metadata } from "next";
import news from "@/content/news.json";
import type { NewsPayload } from "@/lib/types";
import { Section } from "@/components/section";
import { PageShell } from "@/components/page-shell";
import { OnThisPage } from "@/components/on-this-page";
import { slugify } from "@/lib/slug";
import { AUTHOR_NAME, SITE_URL, OG_IMAGE } from "@/lib/seo";

const data = news as NewsPayload;

export const metadata: Metadata = {
  title: "Daily AI Signal & Tech",
  description: `Daily curated tech and AI news by ${AUTHOR_NAME} — the highest-signal items from Hacker News, Reddit, GitHub Trending, and engineering blogs, refreshed every day.`,
  alternates: { canonical: "/" },
  openGraph: {
    url: SITE_URL,
    title: `News — ${AUTHOR_NAME}`,
    description: `Daily curated tech and AI news by ${AUTHOR_NAME}.`,
    images: [OG_IMAGE],
  },
};

export default function Home() {
  const newsEmpty = !data.fetched_at || data.sections.length === 0;
  const populated = data.sections.filter((s) => s.items.length > 0);
  const toc = populated.map((s) => ({
    id: slugify(s.name),
    label: s.name,
    count: s.items.length,
  }));

  return (
    <PageShell
      sidebar={<OnThisPage items={toc} />}
      main={
        <>
          <h1 className="sr-only">
            {AUTHOR_NAME} — Daily Tech & AI News
          </h1>
          <header className="mb-8 pb-3 border-b border-rule">
            <p className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold">
              Daily · tech &amp; AI
            </p>
            <p
              aria-hidden="true"
              className="font-serif text-3xl font-semibold tracking-tight text-ink mt-1 leading-tight"
            >
              Today&rsquo;s signal for engineers
            </p>
            <p className="text-sm text-ink-faint mt-1">
              Hand-picked from Hacker News, Reddit, GitHub Trending and engineering blogs.
            </p>
          </header>
          {newsEmpty ? (
            <div className="rounded border border-dashed border-rule p-8 text-center text-sm text-ink-muted">
              <p>No news fetched yet.</p>
              <p className="mt-1">
                Run{" "}
                <code className="font-mono text-ink bg-paper-subtle px-1.5 py-0.5 rounded border border-rule-soft">
                  /refresh
                </code>{" "}
                in Claude Code to populate.
              </p>
            </div>
          ) : (
            data.sections.map((s) => <Section key={s.name} section={s} />)
          )}
        </>
      }
    />
  );
}
