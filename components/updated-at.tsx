const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

/** Formatted in UTC by hand rather than via toLocaleDateString so the output is
    identical on every machine and CI runner. */
export function formatUtcDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function UpdatedAt({ iso }: { iso: string }) {
  const label = formatUtcDate(iso);
  if (!label) return null;
  return (
    <p className="text-[10px] uppercase tracking-[0.22em] text-ink-faint mt-2">
      Updated <time dateTime={iso}>{label}</time>
    </p>
  );
}
