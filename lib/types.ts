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

export type YouTubeGroup = "ai" | "engineering" | "devops" | "industry";

/** A video on /youtube. Title and summary are rewritten by /refresh — the
    original YouTube title is never shown. Only videos that pass the learning-
    value judgement are ever written here. */
export type YouTubeVideo = {
  title: string;
  url: string; // https://www.youtube.com/watch?v=…
  summary: string;
  group: YouTubeGroup;
  channel: string; // provenance only — not rendered
};

export type CryptoGroup = "policy" | "industry" | "tech" | "security";

/** A story on /crypto. General, important crypto news only — never prices,
    market moves, trading or token promotion. Title and summary are written by
    /refresh from the source article. */
export type CryptoStory = {
  title: string;
  url: string; // canonical article URL from the feed
  summary: string;
  group: CryptoGroup;
  source: string; // feed name from lib/sources.ts, shown as a small label
};

export type NewsPayload = {
  fetched_at: string;
  category: string;
  trending?: TrendingItem[];
  tools?: ToolItem[];
  voices?: Voice[];
  youtube?: YouTubeVideo[];
  crypto?: CryptoStory[];
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

export const YOUTUBE_GROUP_LABELS: Record<YouTubeGroup, string> = {
  ai: "AI & Agents",
  engineering: "Software Engineering",
  devops: "DevOps & Cloud",
  industry: "Startups & Industry",
};

export const YOUTUBE_GROUP_ORDER: YouTubeGroup[] = [
  "ai",
  "engineering",
  "devops",
  "industry",
];

export const CRYPTO_GROUP_LABELS: Record<CryptoGroup, string> = {
  policy: "Regulation & Policy",
  industry: "Industry & Adoption",
  tech: "Protocols & Technology",
  security: "Security & Incidents",
};

export const CRYPTO_GROUP_ORDER: CryptoGroup[] = [
  "policy",
  "industry",
  "tech",
  "security",
];
