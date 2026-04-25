import news from "@/content/news.json";
import type { NewsPayload } from "@/lib/types";
import { Section } from "@/components/section";
import { Trending } from "@/components/trending";

const data = news as NewsPayload;

export default function Home() {
  const trending = data.trending ?? [];
  const newsEmpty = !data.fetched_at || data.sections.length === 0;

  return (
    <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-14 py-8 sm:py-12 flex-1">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_440px] gap-10 lg:gap-14">
        {/* Trending — DOM-first so it renders on top on mobile; placed in right column on desktop */}
        <div className="lg:col-start-2 lg:row-start-1">
          <Trending items={trending} />
        </div>

        {/* News — main column, left on desktop */}
        <main className="lg:col-start-1 lg:row-start-1 min-w-0">
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
        </main>
      </div>

      <footer className="mt-20 pt-6 border-t border-rule text-xs text-ink-faint"></footer>
    </div>
  );
}
