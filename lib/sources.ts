export type RedditFeed = {
  subreddit: string;
  timeWindow: "day" | "week";
  minUpvotes: number;
  maxItems: number;
};

export type GithubTrendingFeed = {
  language?: string; // undefined = all languages
  timeWindow: "daily" | "weekly";
  maxItems: number;
};

export type RssFeed = {
  name: string;
  url: string;
};

export type SourceConfig =
  | {
      kind: "hn";
      id: string;
      name: string;
      endpoint: string;
      lookbackHours: number;
      minScore: number;
      maxItems: number;
    }
  | {
      kind: "reddit";
      id: string;
      name: string;
      feeds: RedditFeed[];
    }
  | {
      kind: "github_trending";
      id: string;
      name: string;
      feeds: GithubTrendingFeed[];
    }
  | {
      kind: "rss";
      id: string;
      name: string;
      lookbackHours: number;
      maxItems: number;
      feeds: RssFeed[];
    };

export type TrendingSubcategoryFocus = {
  /** Display label for the trending sub-section */
  label: string;
  /** How many items to surface in this sub-section */
  count: number;
  /** Topics / examples that count as in-scope for this sub-section */
  scope: string[];
};

export type TrendingConfig = {
  totalCap: number; // overall cap (e.g. 30)
  windowDays: number; // velocity window (e.g. last 7 days)
  subcategories: {
    tool: TrendingSubcategoryFocus;
    model: TrendingSubcategoryFocus;
    api: TrendingSubcategoryFocus;
    resource: TrendingSubcategoryFocus;
  };
  /** Sources the slash command should consult to populate trending */
  sources: TrendingSourceConfig[];
};

export type TrendingSourceConfig =
  | {
      kind: "github_search";
      id: string;
      name: string;
      /** GitHub Search query template — slash command substitutes ${date} for windowStart */
      query: string;
      maxItems: number;
      notes?: string;
    }
  | {
      kind: "huggingface";
      id: string;
      name: string;
      /** HF API URL — e.g. https://huggingface.co/api/models?sort=trending&limit=50 */
      endpoint: string;
      maxItems: number;
    }
  | {
      kind: "openrouter";
      id: string;
      name: string;
      endpoint: string;
      maxItems: number;
      notes?: string;
    }
  | {
      kind: "rss";
      id: string;
      name: string;
      url: string;
      maxItems: number;
    }
  | {
      kind: "product_hunt";
      id: string;
      name: string;
      url: string;
      maxItems: number;
    }
  | {
      kind: "web_search";
      id: string;
      name: string;
      /** WebSearch query templates — slash command runs each and merges results */
      queries: string[];
      maxItems: number;
    };

export type CategoryConfig = {
  id: string;
  label: string;
  positiveTopics: string[];
  negativeFilters: string[];
  sources: SourceConfig[];
  trending: TrendingConfig;
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
  sources: [
    {
      kind: "hn",
      id: "hn",
      name: "Hacker News",
      endpoint: "https://hacker-news.firebaseio.com/v0",
      lookbackHours: 72,
      minScore: 50,
      maxItems: 40,
    },
    {
      kind: "reddit",
      id: "reddit",
      name: "Reddit",
      feeds: [
        { subreddit: "LocalLLaMA",      timeWindow: "day",  minUpvotes: 100, maxItems: 25 },
        { subreddit: "MachineLearning", timeWindow: "week", minUpvotes: 50,  maxItems: 15 },
        { subreddit: "programming",     timeWindow: "day",  minUpvotes: 200, maxItems: 20 },
        { subreddit: "artificial",      timeWindow: "week", minUpvotes: 100, maxItems: 15 },
      ],
    },
    {
      kind: "github_trending",
      id: "github_trending",
      name: "GitHub Trending",
      feeds: [
        { language: undefined,    timeWindow: "daily",  maxItems: 15 },
        { language: "python",     timeWindow: "daily",  maxItems: 5  },
        { language: "typescript", timeWindow: "daily",  maxItems: 5  },
        { language: "rust",       timeWindow: "daily",  maxItems: 5  },
        { language: undefined,    timeWindow: "weekly", maxItems: 10 },
      ],
    },
    {
      kind: "rss",
      id: "blogs",
      name: "Blogs & Newsletters",
      lookbackHours: 24 * 7, // 7 days — newsletters are often weekly
      maxItems: 20,
      feeds: [
        { name: "Simon Willison",     url: "https://simonwillison.net/atom/everything/" },
        { name: "The Batch",          url: "https://www.deeplearning.ai/the-batch/feed/" },
        { name: "Import AI",          url: "https://importai.substack.com/feed" },
        { name: "Hugging Face Blog",  url: "https://huggingface.co/blog/feed.xml" },
        { name: "OpenAI",             url: "https://openai.com/news/rss.xml" },
        { name: "Anthropic",          url: "https://www.anthropic.com/news/rss.xml" },
        { name: "Vercel",             url: "https://vercel.com/atom" },
        { name: "lobste.rs",          url: "https://lobste.rs/hot.rss" },
      ],
    },
  ],
  trending: {
    totalCap: 30,
    windowDays: 7,
    subcategories: {
      tool: {
        label: "Tools",
        count: 12,
        scope: [
          "backend libraries / frameworks (Node, Python, Go, Rust)",
          "infra & devops tooling (K8s, Terraform, Pulumi, observability, CI/CD)",
          "databases, caches, queues, message brokers",
          "agent frameworks, LLM orchestration libraries, eval tools, MCP servers",
          "developer experience: build tools, runtimes, CLIs, code-quality, testing",
        ],
      },
      model: {
        label: "Models",
        count: 8,
        scope: [
          "open-weight LLMs gaining adoption (Hugging Face trending, OpenRouter usage)",
          "code models, embedding models, reranking models",
          "small/local models people are actually deploying",
          "frontier closed models with notable updates",
        ],
      },
      api: {
        label: "APIs & Services",
        count: 7,
        scope: [
          "hosted dev-infra services (DBs, vector DBs, queues, observability SaaS)",
          "AI infrastructure APIs (inference platforms, gateways, RAG services)",
          "platform engineering / cloud-adjacent dev tools",
          "newly-launched managed services with real adoption",
        ],
      },
      resource: {
        label: "Resources",
        count: 3,
        scope: [
          "high-quality long-form blog posts going viral among engineers",
          "talks / conference recordings",
          "deep technical guides, books, courses",
        ],
      },
    },
    sources: [
      {
        kind: "github_search",
        id: "gh-new-rising",
        name: "GitHub — new repos with momentum",
        query: "stars:>100 created:>${windowStart}",
        maxItems: 50,
        notes:
          "Catches brand-new repos that have crossed 100★ within the velocity window. Sort by stars desc.",
      },
      {
        kind: "github_search",
        id: "gh-active-popular",
        name: "GitHub — active popular repos",
        query: "stars:>1000 pushed:>${windowStart}",
        maxItems: 50,
        notes:
          "Established repos with recent activity. Use to dedupe vs the 'new' set and to ground signal.",
      },
      {
        kind: "huggingface",
        id: "hf-trending-models",
        name: "Hugging Face — trending models",
        endpoint: "https://huggingface.co/api/models?sort=trending&direction=-1&limit=40",
        maxItems: 40,
      },
      {
        kind: "huggingface",
        id: "hf-top-downloads",
        name: "Hugging Face — top recent downloads",
        endpoint: "https://huggingface.co/api/models?sort=downloads&direction=-1&limit=30",
        maxItems: 30,
      },
      {
        kind: "openrouter",
        id: "openrouter-rankings",
        name: "OpenRouter — model usage rankings",
        endpoint: "https://openrouter.ai/api/v1/models",
        maxItems: 30,
        notes:
          "Public model list. For usage rankings, fetch https://openrouter.ai/rankings (HTML) and parse the leaderboard.",
      },
      {
        kind: "rss",
        id: "console-dev",
        name: "console.dev — curated dev tools",
        url: "https://console.dev/feed/",
        maxItems: 15,
      },
      {
        kind: "product_hunt",
        id: "ph-dev-tools",
        name: "Product Hunt — dev tools (this week)",
        url: "https://www.producthunt.com/feed?category=developer-tools",
        maxItems: 20,
      },
      {
        kind: "web_search",
        id: "web-search-launches",
        name: "Web search — recent launches",
        queries: [
          "new developer tool launch this week",
          "trending open source backend framework 2026",
          "new infrastructure as code tool launched",
          "viral engineering blog post this week",
          "new vector database launch",
          "trending agent framework github",
        ],
        maxItems: 20,
      },
    ],
  },
};

export const CATEGORIES: Record<string, CategoryConfig> = {
  tech: TECH_AI,
};
