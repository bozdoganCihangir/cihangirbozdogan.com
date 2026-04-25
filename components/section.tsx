import type { NewsSection } from "@/lib/types";
import { NewsItem } from "./news-item";

export function Section({ section }: { section: NewsSection }) {
  if (section.items.length === 0) return null;
  return (
    <section className="mt-10">
      <h2 className="text-xs uppercase tracking-[0.18em] text-neutral-500 font-medium mb-3 px-4 sm:px-5">
        {section.name}{" "}
        <span className="text-neutral-700 normal-case tracking-normal">
          · {section.items.length}
        </span>
      </h2>
      <ul className="rounded-lg border border-neutral-800 bg-neutral-950">
        {section.items.map((item, i) => (
          <NewsItem key={`${section.name}-${i}`} item={item} index={i} />
        ))}
      </ul>
    </section>
  );
}
