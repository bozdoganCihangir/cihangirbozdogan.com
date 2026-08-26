/** Injects a JSON-LD block. Kept as a component so every page emits it the
    same way the root layout emits Person / WebSite. */
export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
