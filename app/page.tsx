import news from "@/content/news.json";
import type { NewsPayload } from "@/lib/types";
import { Section } from "@/components/section";
import { PageShell } from "@/components/page-shell";
import { OnThisPage } from "@/components/on-this-page";
import { slugify } from "@/lib/slug";

const data = news as NewsPayload;

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
        newsEmpty ? (
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
          <>
            {data.sections.map((s) => (
              <Section key={s.name} section={s} />
            ))}
          </>
        )
      }
    />
  );
}
