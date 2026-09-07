import {
  type ToolItem,
  type ToolGroup,
  TOOL_GROUP_LABELS,
  TOOL_GROUP_ORDER,
} from "@/lib/types";
import { UpdatedAt } from "./updated-at";
import { RankedItem } from "./ranked-item";

function groupTools(items: ToolItem[]): Record<ToolGroup, ToolItem[]> {
  const grouped: Record<ToolGroup, ToolItem[]> = {
    agents: [],
    infra: [],
    data: [],
    backend: [],
    devex: [],
  };
  for (const item of items) grouped[item.group]?.push(item);
  for (const group of Object.keys(grouped) as ToolGroup[]) {
    grouped[group].sort((a, b) => a.rank - b.rank);
  }
  return grouped;
}

export function ToolsDetail({
  items,
  updatedAt,
}: {
  items: ToolItem[];
  updatedAt?: string;
}) {
  const grouped = groupTools(items);
  const total = items.length;

  return (
    <div>
      <header className="mb-8 pb-3 border-b border-rule">
        <p className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold">
          {total > 0 ? `${total} repos · this week` : "This week"}
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink mt-1 leading-tight">
          Tools worth a look
        </h1>
        <p className="text-sm text-ink-faint mt-1">
          Actively maintained GitHub repos gaining traction · agents, infra, data, backend, devex.
        </p>
        {updatedAt && <UpdatedAt iso={updatedAt} />}
      </header>

      {total === 0 && (
        <div className="rounded border border-dashed border-rule p-8 text-center text-sm text-ink-muted">
          <p>No tools data yet.</p>
          <p className="mt-1">
            Run{" "}
            <code className="font-mono text-ink bg-paper-subtle px-1.5 py-0.5 rounded border border-rule-soft">
              /refresh
            </code>{" "}
            in Claude Code to populate.
          </p>
        </div>
      )}

      {TOOL_GROUP_ORDER.map((group) => {
        const list = grouped[group];
        if (list.length === 0) return null;
        return (
          <section key={group} id={group} className="mt-12 first:mt-0 scroll-mt-24">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-accent font-semibold mb-4 pb-2 border-b border-rule-soft flex items-baseline justify-between">
              <span>{TOOL_GROUP_LABELS[group]}</span>
              <span className="text-ink-faint font-normal tabular-nums">
                · {list.length}
              </span>
            </h2>
            <ul>
              {list.map((item, i) => (
                <RankedItem
                  key={`${group}-${i}`}
                  rank={item.rank}
                  name={item.name}
                  url={item.url}
                  subcategory={item.subcategory}
                  oneLiner={item.one_liner}
                  paragraph={item.paragraph}
                />
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

export function toolsTocItems(items: ToolItem[]) {
  const grouped = groupTools(items);
  return TOOL_GROUP_ORDER.flatMap((group) => {
    const list = grouped[group];
    if (list.length === 0) return [];
    return [{ id: group, label: TOOL_GROUP_LABELS[group], count: list.length }];
  });
}
