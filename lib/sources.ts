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
      /**
       * GitHub Search query template(s) — slash command substitutes ${windowStart}.
       * An array means one request per entry; GitHub rejects OR across
       * qualifiers (`topic:a OR topic:b`), so list them separately.
       */
      query: string | string[];
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

export type ToolGroupFocus = {
  /** Display label for the /tools group */
  label: string;
  /** Target item count for the group — a target, not a hard cap */
  target: number;
  /** Topics / examples that count as in-scope for this group */
  scope: string[];
};

/**
 * Hard gate every /tools candidate must pass. The slash command checks these
 * against the GitHub Search API response fields — no guessing, no exceptions.
 */
export type ToolMaintenanceGate = {
  /** `pushed_at` must be within this many days of now */
  pushedWithinDays: number;
  /** Repos created before the velocity window need at least this many stars */
  minStarsEstablished: number;
  /** Repos created inside the velocity window need at least this many stars */
  minStarsNew: number;
  /** Must not be `archived`, `disabled`, or a `fork` */
  rejectArchivedOrFork: true;
  /** Must have a non-empty `description` */
  requireDescription: true;
  /** Reject by name/description/topic match — lists, tutorials, dotfiles… */
  rejectPatterns: string[];
};

export type ToolsConfig = {
  /** Never ship fewer than this many tools. Widen the search before giving up. */
  minTotal: number;
  /** Stop adding once this many pass the gate */
  maxTotal: number;
  /** Velocity window in days — same meaning as `TrendingConfig.windowDays` */
  windowDays: number;
  maintenance: ToolMaintenanceGate;
  groups: Record<"agents" | "infra" | "data" | "backend" | "devex", ToolGroupFocus>;
  /** Only GitHub-backed sources — every tool must resolve to a repo URL */
  sources: TrendingSourceConfig[];
};

export type VoiceAuthor = {
  /** Display name, e.g. "Simon Willison" */
  name: string;
  /** Author's blog homepage URL */
  homepage: string;
  /** RSS / Atom feed URL */
  feed: string;
  /** Loose hint for our reference — not surfaced in UI */
  focus?: "ai" | "backend" | "frontend" | "infra" | "devops" | "leadership";
};

export type VoicesConfig = {
  /** Posts older than this are ignored entirely */
  lookbackDays: number;
  /** Maximum posts to keep per author */
  maxPostsPerAuthor: number;
  authors: VoiceAuthor[];
};

export type CategoryConfig = {
  id: string;
  label: string;
  positiveTopics: string[];
  negativeFilters: string[];
  sources: SourceConfig[];
  trending: TrendingConfig;
  tools: ToolsConfig;
  voices: VoicesConfig;
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
        { name: "lobste.rs",          url: "https://lobste.rs/rss" },
      ],
    },
  ],
  trending: {
    totalCap: 30, // models + apis + resources — tools live in `tools` below
    windowDays: 7,
    subcategories: {
      model: {
        label: "Models",
        count: 13,
        scope: [
          "open-weight LLMs gaining adoption (Hugging Face trending, OpenRouter usage)",
          "code models, embedding models, reranking models",
          "small/local models people are actually deploying",
          "frontier closed models with notable updates",
        ],
      },
      api: {
        label: "APIs & Services",
        count: 12,
        scope: [
          "hosted dev-infra services (DBs, vector DBs, queues, observability SaaS)",
          "AI infrastructure APIs (inference platforms, gateways, RAG services)",
          "platform engineering / cloud-adjacent dev tools",
          "newly-launched managed services with real adoption",
        ],
      },
      resource: {
        label: "Resources",
        count: 5,
        scope: [
          "high-quality long-form blog posts going viral among engineers",
          "talks / conference recordings",
          "deep technical guides, books, courses",
        ],
      },
    },
    // GitHub signal for trending comes from the `tools` pool below — the slash
    // command fetches it once and reuses it here for open-source APIs/services.
    sources: [
      {
        kind: "huggingface",
        id: "hf-trending-models",
        name: "Hugging Face — trending models",
        endpoint: "https://huggingface.co/api/models?sort=trendingScore&direction=-1&limit=40",
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
        url: "https://console.dev/rss.xml",
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
  tools: {
    minTotal: 50,
    maxTotal: 70,
    windowDays: 7,
    maintenance: {
      pushedWithinDays: 30,
      minStarsEstablished: 500,
      minStarsNew: 150,
      rejectArchivedOrFork: true,
      requireDescription: true,
      rejectPatterns: [
        "awesome", "awesome-list", "curated list", "interview", "roadmap",
        "cheatsheet", "cheat-sheet", "dotfiles", "tutorial", "course",
        "book", "leetcode", "100-days", "learn-", "study", "notes",
        "boilerplate", "starter-kit", "template", "collection of",
        "wallpaper", "icon pack", "theme", "portfolio",
      ],
    },
    groups: {
      agents: {
        label: "Agents & LLM tooling",
        target: 14,
        scope: [
          "coding agents, agent harnesses, agent runtimes and control planes",
          "agent frameworks, LLM orchestration, MCP servers and clients",
          "eval / observability / security tooling for LLM apps",
          "local inference servers, model routers, token proxies",
        ],
      },
      infra: {
        label: "Infra & DevOps",
        target: 10,
        scope: [
          "Kubernetes, containers, sandboxing, virtualization",
          "infrastructure as code, GitOps, CI/CD, deploy tooling",
          "observability, tracing, logging, profiling",
          "networking, service mesh, tunnels, local networking",
        ],
      },
      data: {
        label: "Data & Databases",
        target: 8,
        scope: [
          "databases, embedded DBs, vector DBs, caches",
          "queues, streams, message brokers, CDC",
          "dataframes, query engines, storage formats, object storage",
        ],
      },
      backend: {
        label: "Backend & Runtimes",
        target: 8,
        scope: [
          "web frameworks, RPC, API servers (Go, Rust, Python, TS, Zig)",
          "language runtimes, WASM runtimes, JS/TS runtimes",
          "auth, background jobs, workflow engines",
        ],
      },
      devex: {
        label: "Developer Experience",
        target: 10,
        scope: [
          "CLIs, terminal tools, shells, TUIs engineers actually use",
          "build tools, package managers, monorepo tooling",
          "testing, linting, formatting, code-quality",
          "editors, editor plugins, code search, code review tooling",
        ],
      },
    },
    sources: [
      {
        kind: "github_search",
        id: "tools-gh-new-rising",
        name: "GitHub — new repos with momentum",
        query: "stars:>100 created:>${windowStart} archived:false fork:false",
        maxItems: 100,
        notes: "Brand-new repos that crossed 100★ inside the window. Sort by stars desc.",
      },
      {
        kind: "github_search",
        id: "tools-gh-active-popular",
        name: "GitHub — active popular repos",
        query: "stars:>1000 pushed:>${windowStart} archived:false fork:false",
        maxItems: 100,
        notes: "Established repos with commits this week. Rank by stars added, not total.",
      },
      {
        kind: "github_search",
        id: "tools-gh-topic-agents",
        name: "GitHub — agents / MCP / LLM topics",
        query: [
          "topic:ai-agents stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:llm stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:mcp stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:mcp-server stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:agents stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:coding-agent stars:>200 pushed:>${windowStart} archived:false fork:false",
        ],
        maxItems: 100,
      },
      {
        kind: "github_search",
        id: "tools-gh-topic-infra",
        name: "GitHub — infra / devops topics",
        query: [
          "topic:kubernetes stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:devops stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:observability stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:infrastructure-as-code stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:docker stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:ci-cd stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:networking stars:>200 pushed:>${windowStart} archived:false fork:false",
        ],
        maxItems: 100,
      },
      {
        kind: "github_search",
        id: "tools-gh-topic-data",
        name: "GitHub — database / data topics",
        query: [
          "topic:database stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:vector-database stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:message-queue stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:dataframe stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:sql stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:storage stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:streaming stars:>200 pushed:>${windowStart} archived:false fork:false",
        ],
        maxItems: 100,
      },
      {
        kind: "github_search",
        id: "tools-gh-topic-devex",
        name: "GitHub — CLI / build / testing topics",
        query: [
          "topic:cli stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:terminal stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:build-tool stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:testing stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:linter stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:developer-tools stars:>200 pushed:>${windowStart} archived:false fork:false",
          "topic:package-manager stars:>200 pushed:>${windowStart} archived:false fork:false",
        ],
        maxItems: 100,
      },
      {
        kind: "github_search",
        id: "tools-gh-lang-systems",
        name: "GitHub — active Rust / Go / Zig repos",
        query: [
          "language:rust stars:>300 pushed:>${windowStart} archived:false fork:false",
          "language:go stars:>300 pushed:>${windowStart} archived:false fork:false",
          "language:zig stars:>300 pushed:>${windowStart} archived:false fork:false",
        ],
        maxItems: 100,
      },
      {
        kind: "github_search",
        id: "tools-gh-lang-app",
        name: "GitHub — active Python / TypeScript repos",
        query: [
          "language:python stars:>300 pushed:>${windowStart} archived:false fork:false",
          "language:typescript stars:>300 pushed:>${windowStart} archived:false fork:false",
        ],
        maxItems: 100,
      },
      {
        kind: "rss",
        id: "tools-console-dev",
        name: "console.dev — curated dev tools",
        url: "https://console.dev/rss.xml",
        maxItems: 15,
      },
      {
        kind: "web_search",
        id: "tools-web-search",
        name: "Web search — gap filler",
        queries: [
          "trending github repo developer tool this week",
          "new open source CLI tool github 2026",
          "new agent framework github release",
          "new observability tool open source github",
        ],
        maxItems: 20,
      },
    ],
  },
  voices: {
    lookbackDays: 30,
    maxPostsPerAuthor: 5,
    authors: [
      { name: "Simon Willison",       homepage: "https://simonwillison.net",       feed: "https://simonwillison.net/atom/everything/",  focus: "ai" },
      { name: "Gergely Orosz",        homepage: "https://www.pragmaticengineer.com", feed: "https://newsletter.pragmaticengineer.com/feed", focus: "leadership" },
      { name: "Martin Fowler",        homepage: "https://martinfowler.com",        feed: "https://martinfowler.com/feed.atom",          focus: "backend" },
      { name: "Julia Evans",          homepage: "https://jvns.ca",                 feed: "https://jvns.ca/atom.xml",                    focus: "infra" },
      { name: "Arpit Bhayani",        homepage: "https://arpitbhayani.me",         feed: "https://arpitbhayani.me/feed.xml",            focus: "backend" },
      { name: "Addy Osmani",          homepage: "https://addyosmani.com",          feed: "https://addyo.substack.com/feed",             focus: "frontend" },
      { name: "Swizec Teller",        homepage: "https://swizec.com",              feed: "https://swizec.com/rss.xml",                  focus: "frontend" },
      { name: "Kent C. Dodds",        homepage: "https://kentcdodds.com",          feed: "https://kentcdodds.com/blog/rss.xml",         focus: "frontend" },
      { name: "Dan Luu",              homepage: "https://danluu.com",              feed: "https://danluu.com/atom.xml",                 focus: "infra" },
      { name: "Will Larson",          homepage: "https://lethain.com",             feed: "https://lethain.com/feeds/",                  focus: "leadership" },
      { name: "Mitchell Hashimoto",   homepage: "https://mitchellh.com",           feed: "https://mitchellh.com/feed.xml",              focus: "infra" },
      { name: "Charity Majors",       homepage: "https://charity.wtf",             feed: "https://charity.wtf/feed/",                   focus: "devops" },
      { name: "Marc Brooker",         homepage: "https://brooker.co.za/blog",      feed: "https://brooker.co.za/blog/rss.xml",          focus: "infra" },
      { name: "Eugene Yan",           homepage: "https://eugeneyan.com",           feed: "https://eugeneyan.com/rss/",                  focus: "ai" },
      { name: "Chip Huyen",           homepage: "https://huyenchip.com",           feed: "https://huyenchip.com/feed.xml",              focus: "ai" },
      { name: "Josh Comeau",          homepage: "https://www.joshwcomeau.com",     feed: "https://www.joshwcomeau.com/rss.xml",         focus: "frontend" },
      { name: "Lee Robinson",         homepage: "https://leerob.com",              feed: "https://leerob.com/rss",                      focus: "frontend" },
      { name: "Brendan Gregg",        homepage: "https://www.brendangregg.com",    feed: "https://www.brendangregg.com/blog/rss.xml",   focus: "infra" },
      { name: "Andrej Karpathy",      homepage: "https://karpathy.github.io",      feed: "https://karpathy.github.io/feed.xml",         focus: "ai" },
      { name: "Hamel Husain",         homepage: "https://hamel.dev",               feed: "https://hamel.dev/index.xml",                 focus: "ai" },
      { name: "Nathan Lambert",       homepage: "https://www.interconnects.ai",    feed: "https://www.interconnects.ai/feed",           focus: "ai" },
      { name: "Dave Cheney",          homepage: "https://dave.cheney.net",         feed: "https://dave.cheney.net/feed",                focus: "backend" },
      { name: "Hillel Wayne",         homepage: "https://www.hillelwayne.com",     feed: "https://www.hillelwayne.com/post/index.xml",  focus: "backend" },
      { name: "Rachel by the Bay",    homepage: "https://rachelbythebay.com/w/",   feed: "https://rachelbythebay.com/w/atom.xml",       focus: "infra" },
      { name: "Tanya Reilly",         homepage: "https://www.noidea.dog",          feed: "https://www.noidea.dog/work?format=rss",      focus: "leadership" },
      { name: "Cindy Sridharan",      homepage: "https://copyconstruct.medium.com", feed: "https://copyconstruct.medium.com/feed",      focus: "infra" },
      { name: "Matt Klein",           homepage: "https://mattklein123.dev",        feed: "https://mattklein123.dev/atom.xml",           focus: "infra" },
      { name: "Filippo Valsorda",     homepage: "https://words.filippo.io",        feed: "https://words.filippo.io/rss/",               focus: "backend" },
      { name: "Dan Abramov",          homepage: "https://overreacted.io",          feed: "https://overreacted.io/rss.xml",              focus: "frontend" },
      { name: "Sara Soueidan",        homepage: "https://www.sarasoueidan.com",    feed: "https://www.sarasoueidan.com/blog/index.xml", focus: "frontend" },
      { name: "Sophie Alpert",        homepage: "https://www.sophiebits.com",      feed: "https://www.sophiebits.com/atom.xml",         focus: "frontend" },
      { name: "Camille Fournier",     homepage: "https://skamille.medium.com",     feed: "https://skamille.medium.com/feed",            focus: "leadership" },
      { name: "Patrick McKenzie",     homepage: "https://www.bitsaboutmoney.com",  feed: "https://www.bitsaboutmoney.com/archive/rss/", focus: "leadership" },
      { name: "Fly.io",               homepage: "https://fly.io/blog",             feed: "https://fly.io/blog/feed.xml",                focus: "infra" },
      { name: "Cloudflare",           homepage: "https://blog.cloudflare.com",     feed: "https://blog.cloudflare.com/rss/",            focus: "infra" },
      { name: "Stripe Engineering",   homepage: "https://stripe.com/blog/engineering", feed: "https://stripe.com/blog/feed.rss",        focus: "backend" },
      { name: "Discord Engineering",  homepage: "https://discord.com/category/engineering", feed: "https://discord.com/blog/rss.xml",   focus: "infra" },
      { name: "Oxide",                homepage: "https://oxide.computer/blog",     feed: "https://oxide.computer/blog/feed",            focus: "infra" },
      { name: "Jane Street Tech",     homepage: "https://blog.janestreet.com",     feed: "https://blog.janestreet.com/feed.xml",        focus: "backend" },
    ],
  },
};

export const CATEGORIES: Record<string, CategoryConfig> = {
  tech: TECH_AI,
};
