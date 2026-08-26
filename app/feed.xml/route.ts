import news from "@/content/news.json";
import type { NewsPayload } from "@/lib/types";
import { SITE_URL, SITE_NAME, SITE_DESCRIPTION, AUTHOR_NAME } from "@/lib/seo";

// Required for `output: export` — emit feed.xml as a static file at build.
// The .xml extension matters: GitHub Pages types files by extension, so an
// extensionless route would ship as application/octet-stream.
export const dynamic = "force-static";

const data = news as NewsPayload;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET() {
  const built = data.fetched_at ? new Date(data.fetched_at) : new Date();
  const pubDate = built.toUTCString();

  const entries = [
    ...(data.trending ?? []).map((t) => ({
      title: `${t.name} — ${t.one_liner}`,
      url: t.url,
      body: t.paragraph,
      category: "Trending",
    })),
    ...data.sections.flatMap((section) =>
      section.items.map((item) => ({
        title: item.title,
        url: item.url,
        body: [item.summary, item.paragraph].filter(Boolean).join("\n\n"),
        category: section.name,
      })),
    ),
  ];

  const items = entries
    .map(
      (e) => `    <item>
      <title>${esc(e.title)}</title>
      <link>${esc(e.url)}</link>
      <guid isPermaLink="true">${esc(e.url)}</guid>
      <category>${esc(e.category)}</category>
      <pubDate>${pubDate}</pubDate>
      <description>${esc(e.body ?? "")}</description>
    </item>`,
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(SITE_NAME)} — Daily Tech &amp; AI Signal</title>
    <link>${SITE_URL}/</link>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${esc(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <managingEditor>${esc(AUTHOR_NAME)}</managingEditor>
    <lastBuildDate>${pubDate}</lastBuildDate>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
