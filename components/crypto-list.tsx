import {
  type CryptoStory,
  type CryptoGroup,
  CRYPTO_GROUP_LABELS,
  CRYPTO_GROUP_ORDER,
} from "@/lib/types";
import { UpdatedAt } from "./updated-at";

/** Buckets by group, keeping payload order — /refresh writes most-important-first. */
function groupStories(stories: CryptoStory[]): Record<CryptoGroup, CryptoStory[]> {
  const grouped: Record<CryptoGroup, CryptoStory[]> = {
    policy: [],
    industry: [],
    tech: [],
    security: [],
  };
  for (const story of stories) grouped[story.group]?.push(story);
  return grouped;
}

export function CryptoList({
  stories,
  updatedAt,
}: {
  stories: CryptoStory[];
  updatedAt?: string;
}) {
  const grouped = groupStories(stories);

  return (
    <section>
      <header className="mb-8 pb-3 border-b border-rule">
        <p className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold">
          Crypto · latest
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink mt-1 leading-tight">
          What actually happened in crypto
        </h1>
        <p className="text-sm text-ink-faint mt-1">
          Regulation, adoption, protocol upgrades and security incidents — no prices, no markets.
        </p>
        {updatedAt && <UpdatedAt iso={updatedAt} />}
      </header>

      {stories.length === 0 && (
        <div className="rounded border border-dashed border-rule p-8 text-center text-sm text-ink-muted">
          <p>No crypto news yet.</p>
          <p className="mt-1">
            Run{" "}
            <code className="font-mono text-ink bg-paper-subtle px-1.5 py-0.5 rounded border border-rule-soft">
              /refresh
            </code>{" "}
            in Claude Code to populate.
          </p>
        </div>
      )}

      {CRYPTO_GROUP_ORDER.map((group) => {
        const list = grouped[group];
        if (list.length === 0) return null;
        return (
          <section key={group} id={group} className="mt-12 first:mt-0 scroll-mt-24">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-accent font-semibold mb-5 pb-2 border-b border-rule-soft flex items-baseline justify-between">
              <span>{CRYPTO_GROUP_LABELS[group]}</span>
              <span className="text-ink-faint font-normal tabular-nums">
                · {list.length}
              </span>
            </h2>
            <ul className="space-y-6">
              {list.map((story) => (
                <li key={story.url}>
                  <a
                    href={story.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group block"
                  >
                    <h3 className="font-serif text-[18px] leading-snug font-semibold text-ink group-hover:text-accent transition-colors">
                      {story.title}
                    </h3>
                    <p className="mt-1.5 text-[15px] text-ink-muted leading-relaxed">
                      {story.summary}
                    </p>
                    <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink-faint">
                      {story.source}
                    </p>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </section>
  );
}

export function cryptoTocItems(stories: CryptoStory[]) {
  const grouped = groupStories(stories);
  return CRYPTO_GROUP_ORDER.flatMap((group) => {
    const list = grouped[group];
    if (list.length === 0) return [];
    return [{ id: group, label: CRYPTO_GROUP_LABELS[group], count: list.length }];
  });
}
