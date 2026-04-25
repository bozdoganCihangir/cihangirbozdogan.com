import type { MetadataRoute } from "next";
import news from "@/content/news.json";
import type { NewsPayload } from "@/lib/types";
import { SITE_URL } from "@/lib/seo";

const data = news as NewsPayload;

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = data.fetched_at ? new Date(data.fetched_at) : new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${SITE_URL}/voices`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/trending`,
      lastModified,
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];
}
