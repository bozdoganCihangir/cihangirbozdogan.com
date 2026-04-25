export type TocItem = {
  id: string;
  label: string;
  count?: number;
};

export function OnThisPage({ items }: { items: TocItem[] }) {
  if (items.length === 0) return null;
  return (
    <aside className="lg:pl-8 lg:border-l lg:border-rule-soft lg:sticky lg:top-20 lg:self-start lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto">
      <div className="border-b border-rule pb-3 mb-4">
        <p className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold">
          On this page
        </p>
      </div>
      <ul className="space-y-2 text-sm">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="flex items-baseline justify-between gap-3 text-ink hover:text-accent transition-colors py-1"
            >
              <span className="truncate">{item.label}</span>
              {item.count !== undefined && (
                <span className="text-ink-faint tabular-nums text-xs shrink-0">
                  {item.count}
                </span>
              )}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
