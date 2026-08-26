import { SITE_URL } from "./seo";

type ListEntry = { name: string; url: string };

/**
 * A CollectionPage wrapping an ItemList. The site is literally a ranked list of
 * curated items, so this states that outright — plus `dateModified`, which is
 * the strongest machine-readable freshness signal a daily feed can emit.
 */
export function collectionPageLd({
  id,
  path,
  name,
  description,
  dateModified,
  items,
}: {
  id: string;
  path: string;
  name: string;
  description: string;
  dateModified?: string;
  items: ListEntry[];
}) {
  const url = `${SITE_URL}${path}`;
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${url}#${id}`,
    url,
    name,
    description,
    inLanguage: "en",
    isPartOf: { "@id": `${SITE_URL}/#website` },
    author: { "@id": `${SITE_URL}/#person` },
    ...(dateModified ? { dateModified } : {}),
    mainEntity: {
      "@type": "ItemList",
      name,
      numberOfItems: items.length,
      itemListOrder: "https://schema.org/ItemListOrderDescending",
      itemListElement: items.map((item, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: item.name,
        url: item.url,
      })),
    },
  };
}
