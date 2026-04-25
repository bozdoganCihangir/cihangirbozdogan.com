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

export type CategoryConfig = {
  id: string;
  label: string;
  positiveTopics: string[];
  negativeFilters: string[];
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
};

export const CATEGORIES: Record<string, CategoryConfig> = {
  tech: TECH_AI,
};
