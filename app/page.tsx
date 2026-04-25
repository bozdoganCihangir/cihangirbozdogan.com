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
      <header>
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
          Tech &amp; AI
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {data.fetched_at
            ? formatFetchedAt(data.fetched_at)
            : "No news yet. Run /fetch-news to populate."}
        </p>
      </header>

      {empty ? (
        <div className="mt-10 rounded-lg border border-dashed border-neutral-800 p-8 text-center text-sm text-neutral-500">
          <p>No news fetched yet.</p>
          <p className="mt-1">
            Run{" "}
            <code className="font-mono text-neutral-300 bg-neutral-900 px-1.5 py-0.5 rounded">
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

      <footer className="mt-16 pt-6 border-t border-neutral-900 text-xs text-neutral-600"></footer>
    </main>
  );
}
