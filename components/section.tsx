import type { NewsSection } from "@/lib/types";
import { NewsItem } from "./news-item";
import { slugify } from "@/lib/slug";

export function Section({ section }: { section: NewsSection }) {
  if (section.items.length === 0) return null;
  const id = slugify(section.name);
  return (
    <section id={id} className="mt-12 first:mt-0 scroll-mt-24">
      <h2 className="text-[11px] uppercase tracking-[0.22em] text-accent font-semibold mb-4 pb-2 border-b border-rule-soft">
        {section.name}{" "}
        <span className="text-ink-faint font-normal">
          · {section.items.length}
        </span>
      </h2>
      <ul>
        {section.items.map((item, i) => (
          <NewsItem key={`${section.name}-${i}`} item={item} index={i} />
        ))}
      </ul>
    </section>
  );
}
