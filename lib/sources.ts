export type SourceKind = "hn" | "reddit" | "github_trending" | "rss";

export type SourceConfig = {
  id: string;
  name: string;
  kind: SourceKind;
  endpoint?: string;
  notes?: string;
};

export type CategoryConfig = {
  id: string;
  label: string;
  positiveTopics: string[];
  negativeFilters: string[];
  itemsPerSection: number;
  sources: SourceConfig[];
};

export const TECH_AI: CategoryConfig = {
  id: "tech",
  label: "Tech & AI",
  positiveTopics: [
    "AI models, LLMs, releases, benchmarks",
    "what engineers are building, using, discussing",
    "trending dev tools, libraries, frameworks",
    "platform engineering, infra, devops",
    "startups, funding, product launches in AI/dev tools",
    "notable engineering blog posts and hot takes",
  ],
  negativeFilters: [
    "crypto, web3, NFTs",
    "consumer gadgets, phone rumors",
    "Apple/Samsung product leaks",
    "generic AI hype with no substance",
    "academic research papers (arXiv-only) without practical angle",
    "politics, recruiting drama, layoffs gossip",
  ],
  itemsPerSection: 20,
  sources: [
    {
      id: "hn",
      name: "Hacker News",
      kind: "hn",
      endpoint: "https://hacker-news.firebaseio.com/v0",
    },
    {
      id: "reddit",
      name: "Reddit",
      kind: "reddit",
      notes: "r/LocalLLaMA, r/MachineLearning, r/programming, r/artificial",
    },
    {
      id: "github_trending",
      name: "GitHub Trending",
      kind: "github_trending",
      endpoint: "https://github.com/trending",
    },
    {
      id: "blogs",
      name: "Blogs & Newsletters",
      kind: "rss",
      notes: "Simon Willison, The Batch, Import AI, HF blog, OpenAI, Anthropic, Vercel, lobste.rs",
    },
  ],
};

export const CATEGORIES: Record<string, CategoryConfig> = {
  tech: TECH_AI,
};
