export function Tldr({ bullets }: { bullets: string[] }) {
  if (bullets.length === 0) return null;
  return (
    <section className="mt-6 rounded-lg border border-neutral-800 bg-neutral-900/40 p-5">
      <h2 className="text-xs uppercase tracking-[0.18em] text-neutral-500 font-medium mb-3">
        TL;DR — what mattered today
      </h2>
      <ul className="space-y-2">
        {bullets.map((b, i) => (
          <li
            key={i}
            className="text-sm text-neutral-200 leading-relaxed flex gap-3"
          >
            <span className="text-neutral-600 shrink-0">·</span>
            <span>{b}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
