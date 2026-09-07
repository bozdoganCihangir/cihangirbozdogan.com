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

export type TrendingCategory = "model" | "api" | "resource";

export type TrendingItem = {
  rank: number; // rank within its category, 1..N
  name: string;
  category: TrendingCategory;
  subcategory?: string;
  one_liner: string;
  paragraph: string;
  url: string;
};

export type ToolGroup = "agents" | "infra" | "data" | "backend" | "devex";

/** A GitHub-hosted tool surfaced on /tools. Same editorial shape as a
    TrendingItem, but every entry is a repo that passed the maintenance gate
    in `ToolsConfig.maintenance`. */
export type ToolItem = {
  rank: number; // rank within its group, 1..N
  name: string;
  group: ToolGroup;
  subcategory?: string;
  one_liner: string;
  paragraph: string;
  url: string; // canonical GitHub repo URL
};

export type VoicePost = {
  title: string;
  url: string;
  summary: string;
};

export type Voice = {
  author: string;
  url: string;
  posts: VoicePost[];
};

export type NewsPayload = {
  fetched_at: string;
  category: string;
  trending?: TrendingItem[];
  tools?: ToolItem[];
  voices?: Voice[];
  sections: NewsSection[];
};

export const TRENDING_CATEGORY_LABELS: Record<TrendingCategory, string> = {
  model: "Models",
  api: "APIs & Services",
  resource: "Resources",
};

export const TRENDING_CATEGORY_ORDER: TrendingCategory[] = [
  "model",
  "api",
  "resource",
];

export const TOOL_GROUP_LABELS: Record<ToolGroup, string> = {
  agents: "Agents & LLM tooling",
  infra: "Infra & DevOps",
  data: "Data & Databases",
  backend: "Backend & Runtimes",
  devex: "Developer Experience",
};

export const TOOL_GROUP_ORDER: ToolGroup[] = [
  "agents",
  "infra",
  "data",
  "backend",
  "devex",
];
