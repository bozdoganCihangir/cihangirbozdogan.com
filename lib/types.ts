export type NewsItem = {
  title: string;
  url: string;
  summary: string;
  paragraph?: string;
  details: string;
};

export type NewsSection = {
  name: string;
  items: NewsItem[];
};

export type TrendingCategory = "tool" | "model" | "api" | "resource";

export type TrendingItem = {
  rank: number; // rank within its category, 1..N
  name: string;
  category: TrendingCategory;
  subcategory?: string;
  one_liner: string;
  paragraph: string;
  url: string;
};

export type NewsPayload = {
  fetched_at: string;
  category: string;
  trending?: TrendingItem[];
  sections: NewsSection[];
};

export const TRENDING_CATEGORY_LABELS: Record<TrendingCategory, string> = {
  tool: "Tools",
  model: "Models",
  api: "APIs & Services",
  resource: "Resources",
};

export const TRENDING_CATEGORY_ORDER: TrendingCategory[] = [
  "tool",
  "model",
  "api",
  "resource",
];
