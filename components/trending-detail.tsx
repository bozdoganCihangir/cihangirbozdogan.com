import {
  type TrendingItem as TrendingItemType,
  type TrendingCategory,
  TRENDING_CATEGORY_LABELS,
  TRENDING_CATEGORY_ORDER,
} from "@/lib/types";

function groupByCategory(
  items: TrendingItemType[],
): Record<TrendingCategory, TrendingItemType[]> {
  const grouped: Record<TrendingCategory, TrendingItemType[]> = {
    tool: [],
    model: [],
    api: [],
    resource: [],
  };
  for (const item of items) grouped[item.category]?.push(item);
  for (const cat of Object.keys(grouped) as TrendingCategory[]) {
    grouped[cat].sort((a, b) => a.rank - b.rank);
  }
  return grouped;
}

export function TrendingDetail({ items }: { items: TrendingItemType[] }) {
  const grouped = groupByCategory(items);
  const total = items.length;

  if (total === 0) {
    return (
      <div className="rounded border border-dashed border-rule p-8 text-center text-sm text-ink-muted">
        <p>No trending data yet.</p>
        <p className="mt-1">
          Run{" "}
          <code className="font-mono text-ink bg-paper-subtle px-1.5 py-0.5 rounded border border-rule-soft">
            /refresh
          </code>{" "}
          in Claude Code to populate.
        </p>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8 pb-3 border-b border-rule">
        <p className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold">
          Top {total} · this week
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink mt-1 leading-tight">
          Trending for engineers
        </h1>
        <p className="text-sm text-ink-faint mt-1">
          Tools, models, APIs &amp; resources gaining traction · infra, AI, backend, devops.
        </p>
      </header>

      {TRENDING_CATEGORY_ORDER.map((cat) => {
        const list = grouped[cat];
        if (list.length === 0) return null;
        return (
          <section key={cat} id={cat} className="mt-12 first:mt-0 scroll-mt-24">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-accent font-semibold mb-4 pb-2 border-b border-rule-soft flex items-baseline justify-between">
              <span>{TRENDING_CATEGORY_LABELS[cat]}</span>
              <span className="text-ink-faint font-normal tabular-nums">
                · {list.length}
              </span>
            </h2>
            <ul>
              {list.map((item, i) => (
                <li
                  key={`${cat}-${i}`}
                  className="border-b border-rule-soft last:border-b-0 py-5 flex gap-5 items-start"
                >
                  <span className="text-ink-faint tabular-nums text-xs pt-1.5 shrink-0 w-7 font-medium">
                    {String(item.rank).padStart(2, "0")}
                  </span>
                  <div className="flex-1 min-w-0">
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="group inline-block"
                    >
                      <h3 className="font-serif text-xl sm:text-[1.35rem] leading-snug font-semibold text-ink group-hover:text-accent transition-colors">
                        {item.name}
                      </h3>
                    </a>
                    {item.subcategory && (
                      <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                        {item.subcategory}
                      </p>
                    )}
                    <p className="mt-2 text-[15px] text-ink-muted leading-relaxed">
                      {item.one_liner}
                    </p>
                    {item.paragraph?.trim() && (
                      <p className="mt-3 font-serif text-[16px] text-ink leading-[1.6] whitespace-pre-wrap">
                        {item.paragraph}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function trendingTocItems(items: TrendingItemType[]) {
  const grouped = groupByCategory(items);
  return TRENDING_CATEGORY_ORDER.flatMap((cat) => {
    const list = grouped[cat];
    if (list.length === 0) return [];
    return [{ id: cat, label: TRENDING_CATEGORY_LABELS[cat], count: list.length }];
  });
}
