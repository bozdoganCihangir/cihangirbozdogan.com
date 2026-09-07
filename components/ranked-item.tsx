/** One ranked entry — shared by /trending and /tools so both lists read the same. */
export function RankedItem({
  rank,
  name,
  url,
  subcategory,
  oneLiner,
  paragraph,
}: {
  rank: number;
  name: string;
  url: string;
  subcategory?: string;
  oneLiner: string;
  paragraph: string;
}) {
  return (
    <li className="border-b border-rule-soft last:border-b-0 py-5 flex gap-5 items-start">
      <span className="text-ink-faint tabular-nums text-xs pt-1.5 shrink-0 w-7 font-medium">
        {String(rank).padStart(2, "0")}
      </span>
      <div className="flex-1 min-w-0">
        <a
          href={url}
          target="_blank"
          rel="noreferrer noopener"
          className="group inline-block"
        >
          <h3 className="font-serif text-xl sm:text-[1.35rem] leading-snug font-semibold text-ink group-hover:text-accent transition-colors">
            {name}
          </h3>
        </a>
        {subcategory && (
          <p className="mt-1 text-[10px] uppercase tracking-[0.18em] text-ink-faint">
            {subcategory}
          </p>
        )}
        <p className="mt-2 text-[15px] text-ink-muted leading-relaxed">
          {oneLiner}
        </p>
        {paragraph.trim() && (
          <p className="mt-3 font-serif text-[16px] text-ink leading-[1.6] whitespace-pre-wrap">
            {paragraph}
          </p>
        )}
      </div>
    </li>
  );
}
