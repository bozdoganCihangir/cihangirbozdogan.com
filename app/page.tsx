import news from "@/content/news.json";
import type { NewsPayload } from "@/lib/types";
import { Section } from "@/components/section";

const data = news as NewsPayload;

function formatFetchedAt(iso: string): string {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function Home() {
  const empty = !data.fetched_at || data.sections.length === 0;
  return (
    <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 py-10 sm:py-14 flex-1">
      <header className="border-b border-rule pb-6">
        <p className="text-[11px] uppercase tracking-[0.22em] text-accent font-semibold">
          {data.fetched_at ? formatFetchedAt(data.fetched_at) : "Today"}
        </p>
        <h1 className="font-serif text-4xl sm:text-5xl font-semibold tracking-tight text-ink mt-2">
          Tech &amp; AI
        </h1>
      </header>

      {empty ? (
        <div className="mt-10 rounded border border-dashed border-rule p-8 text-center text-sm text-ink-muted">
          <p>No news fetched yet.</p>
          <p className="mt-1">
            Run{" "}
            <code className="font-mono text-ink bg-paper-subtle px-1.5 py-0.5 rounded border border-rule-soft">
              /fetch-news
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
      )}

      <footer className="mt-20 pt-6 border-t border-rule text-xs text-ink-faint"></footer>
    </main>
  );
}
