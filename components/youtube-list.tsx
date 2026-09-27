import {
  type YouTubeVideo,
  type YouTubeGroup,
  YOUTUBE_GROUP_LABELS,
  YOUTUBE_GROUP_ORDER,
} from "@/lib/types";
import { UpdatedAt } from "./updated-at";

/** Buckets by group, keeping payload order — /refresh writes best-first. */
function groupVideos(videos: YouTubeVideo[]): Record<YouTubeGroup, YouTubeVideo[]> {
  const grouped: Record<YouTubeGroup, YouTubeVideo[]> = {
    ai: [],
    engineering: [],
    devops: [],
    industry: [],
  };
  for (const video of videos) grouped[video.group]?.push(video);
  return grouped;
}

export function YouTubeList({
  videos,
  updatedAt,
}: {
  videos: YouTubeVideo[];
  updatedAt?: string;
}) {
  const grouped = groupVideos(videos);

  return (
    <section>
      <header className="mb-8 pb-3 border-b border-rule">
        <p className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold">
          YouTube · last 14 days
        </p>
        <h1 className="font-serif text-3xl font-semibold tracking-tight text-ink mt-1 leading-tight">
          Videos worth your time
        </h1>
        <p className="text-sm text-ink-faint mt-1">
          Short, substantive videos from a curated roster of channels — AI, engineering, cloud, startups.
        </p>
        {updatedAt && <UpdatedAt iso={updatedAt} />}
      </header>

      {videos.length === 0 && (
        <div className="rounded border border-dashed border-rule p-8 text-center text-sm text-ink-muted">
          <p>No videos yet.</p>
          <p className="mt-1">
            Run{" "}
            <code className="font-mono text-ink bg-paper-subtle px-1.5 py-0.5 rounded border border-rule-soft">
              /refresh
            </code>{" "}
            in Claude Code to populate.
          </p>
        </div>
      )}

      {YOUTUBE_GROUP_ORDER.map((group) => {
        const list = grouped[group];
        if (list.length === 0) return null;
        return (
          <section key={group} id={group} className="mt-12 first:mt-0 scroll-mt-24">
            <h2 className="text-[11px] uppercase tracking-[0.22em] text-accent font-semibold mb-5 pb-2 border-b border-rule-soft flex items-baseline justify-between">
              <span>{YOUTUBE_GROUP_LABELS[group]}</span>
              <span className="text-ink-faint font-normal tabular-nums">
                · {list.length}
              </span>
            </h2>
            <ul className="space-y-6">
              {list.map((video) => (
                <li key={video.url}>
                  <a
                    href={video.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="group block"
                  >
                    <h3 className="font-serif text-[18px] leading-snug font-semibold text-ink group-hover:text-accent transition-colors">
                      {video.title}
                    </h3>
                    <p className="mt-1.5 text-[15px] text-ink-muted leading-relaxed">
                      {video.summary}
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

export function youtubeTocItems(videos: YouTubeVideo[]) {
  const grouped = groupVideos(videos);
  return YOUTUBE_GROUP_ORDER.flatMap((group) => {
    const list = grouped[group];
    if (list.length === 0) return [];
    return [{ id: group, label: YOUTUBE_GROUP_LABELS[group], count: list.length }];
  });
}
