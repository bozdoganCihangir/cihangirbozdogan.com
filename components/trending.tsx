import {
  type TrendingItem as TrendingItemType,
  type TrendingCategory,
  TRENDING_CATEGORY_LABELS,
  TRENDING_CATEGORY_ORDER,
} from "@/lib/types";
import { TrendingItem } from "./trending-item";

function groupByCategory(
  items: TrendingItemType[],
): Record<TrendingCategory, TrendingItemType[]> {
  const grouped: Record<TrendingCategory, TrendingItemType[]> = {
    tool: [],
    model: [],
    api: [],
    resource: [],
  };
  for (const item of items) {
    grouped[item.category]?.push(item);
  }
  for (const cat of Object.keys(grouped) as TrendingCategory[]) {
    grouped[cat].sort((a, b) => a.rank - b.rank);
  }
  return grouped;
}

export function Trending({ items }: { items: TrendingItemType[] }) {
  const grouped = groupByCategory(items);
  const total = items.length;

  return (
    <aside className="lg:sticky lg:top-6 lg:self-start lg:max-h-[calc(100vh-3rem)] lg:overflow-y-auto lg:pl-8 lg:border-l lg:border-rule-soft">
      <div className="border-b border-rule pb-3 mb-4">
        <p className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold">
          Top {total || 30} · This Week
        </p>
        <h2 className="font-serif text-2xl font-semibold tracking-tight text-ink mt-1 leading-tight">
          Trending for engineers
        </h2>
        <p className="text-xs text-ink-faint mt-1">
          Tools, models &amp; APIs gaining traction · backend, infra, devops
        </p>
      </div>

      {total === 0 ? (
        <div className="rounded border border-dashed border-rule p-5 text-center text-xs text-ink-muted">
          <p>No trending data yet.</p>
          <p className="mt-1">
            Run{" "}
            <code className="font-mono text-ink bg-paper-subtle px-1 py-0.5 rounded border border-rule-soft text-[11px]">
              /refresh
            </code>{" "}
            to populate.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {TRENDING_CATEGORY_ORDER.map((cat) => {
            const list = grouped[cat];
            if (list.length === 0) return null;
            return (
              <section key={cat}>
                <h3 className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold mb-2 flex items-baseline justify-between">
                  <span>{TRENDING_CATEGORY_LABELS[cat]}</span>
                  <span className="text-ink-faint font-normal tabular-nums">
                    {list.length}
                  </span>
                </h3>
                <ul>
                  {list.map((item, i) => (
                    <TrendingItem key={`${cat}-${i}`} item={item} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </aside>
  );
}
