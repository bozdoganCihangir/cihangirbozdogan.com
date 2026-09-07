---
description: Refresh the cihangirbozdogan.com site — fetch 50+ trending GitHub tools, trending models/APIs/resources, today's tech & AI news and Voices, then commit & push.
allowed-tools: Bash, Read, Write, Edit, WebFetch, WebSearch, Agent
argument-hint: "[category] (optional, default: tech)"
---

You are running the daily refresh for a personal zero-cost static site at `/Users/cihangirbozdogan/Documents/Projects/cihangirbozdogan.com`.

# Goal

Fully overwrite `content/news.json` with:
1. **Tools (50+)** — actively maintained GitHub repos gaining traction this week, grouped by area (`/tools` page)
2. **Trending top 30** — models, APIs, resources gaining traction this week (backend / infra / devops / AI infra focus)
3. **News sections** — Hacker News, Reddit, GitHub Trending, Blogs & Newsletters
4. **Voices** — latest posts (last 30 days, max 5 each) from a curated roster of practitioner blogs

Then commit and push to `main` so GitHub Actions redeploys GitHub Pages.

The site has **no database**. Each run **fully overwrites** `content/news.json`. There is no history.

# Category

Argument: `${1:-tech}` — default `tech`.

**First step every run**: read `lib/sources.ts`. It is the **single source of truth** for which feeds to fetch and the per-source policy (lookback windows, item caps, score thresholds, tools maintenance gate, trending sub-section counts). Follow it exactly.

If a different category is requested and not present in `CATEGORIES`, stop and tell the user to add it to `lib/sources.ts` first.

---

# PART A — Tools (minimum 50)

The `/tools` page is the headline feature of the site. It is a list of **GitHub repos** that are (a) gaining traction this week and (b) demonstrably well maintained. Every entry links to a repo. **The floor is 50 shipped tools** — if you are under 50 after the first pass, widen the search (more queries, per_page=100, page 2) before you accept fewer. Never pad with repos that fail the gate.

Read `CategoryConfig.tools` from `lib/sources.ts`. It defines:
- `minTotal` (50) / `maxTotal` (70) — total shipped tools
- `windowDays` (7) — velocity window
- `maintenance` — the **hard gate** below
- `groups.{agents, infra, data, backend, devex}` — each has `label`, `target`, `scope`
- `sources[]` — GitHub Search queries + console.dev + web search

## A.1 Fetch the candidate pool

For each `kind: "github_search"` source — and for **each entry** when `query` is an array (GitHub rejects `OR` across qualifiers, so topics/languages are listed one per request) — fetch, spacing calls to stay under the rate limit:

- Endpoint: `https://api.github.com/search/repositories?q=<query>&sort=stars&order=desc&per_page=100`
- Substitute `${windowStart}` with `(today - windowDays).toISOString().slice(0,10)`
- Headers: `Accept: application/vnd.github+json`, `User-Agent: cihangirbozdogan-com-fetcher/1.0`
- **Auth**: run `gh auth token` first. If it returns a token, send `Authorization: Bearer <token>` — that lifts search to 30 req/min and avoids 403s across the ~8 queries. If it fails, go unauthenticated (10 req/min) and space the calls.
- Keep these fields per repo: `full_name`, `html_url`, `description`, `stargazers_count`, `language`, `created_at`, `pushed_at`, `topics`, `archived`, `disabled`, `fork`, `open_issues_count`, `license.spdx_id`
- Also merge in the GitHub Trending pages fetched in Part C.3 (`github_trending` source) — they are the best daily velocity signal and are already in hand.
- console.dev and web search are **gap fillers only**: every candidate they surface must be resolved to a GitHub repo and fetched via `GET /repos/{owner}/{repo}` so the gate has real fields to check. No repo → not a tool.

Dedupe the pool by `full_name` (case-insensitive). Expect 400–800 unique repos.

## A.2 Maintenance gate — hard, no exceptions

Apply `tools.maintenance` from `lib/sources.ts` to every candidate **using the API fields, not vibes**. Reject if ANY of these is true:

| Check | Rule |
|---|---|
| Activity | `pushed_at` older than `pushedWithinDays` (30) days |
| Stars, established | `created_at` before `windowStart` AND `stargazers_count < minStarsEstablished` (500) |
| Stars, new | `created_at` within window AND `stargazers_count < minStarsNew` (150) |
| Status | `archived`, `disabled`, or `fork` is true |
| Description | `description` empty or null |
| Junk | `full_name`, `description`, or any `topics[]` matches a `rejectPatterns` entry (case-insensitive substring) |

Then apply the editorial filters (same as before — this is the part you already do well):
- Drop crypto / web3 / NFT, frontend UI/CSS/mobile-only, personal portfolio projects, tutorials/courses, "AI hype" repos with no working code
- Drop repos whose README is a landing page for a closed SaaS with no runnable code
- **Modern** means: shipped a release, tag or notable feature within the window, or is a new project that went from 0 to hundreds of stars in the window. A 40k★ repo with a typo-fix commit does not count as "gaining traction" — it needs a real reason to be here this week.

For anything you keep that isn't obviously alive, spot-check `GET /repos/{owner}/{repo}/releases?per_page=1` or the commits page. Sample, don't fetch everything.

## A.3 Score, group, rank

Score survivors as **velocity × recency × relevance**, exactly as for trending:
- velocity = stars added in the window (GitHub Trending "stars this week" when available; otherwise `stargazers_count / age_days` for new repos, or a `stars:>N created:>` search-position proxy)
- recency = release / major push inside the window
- relevance = fits one of `tools.groups[*].scope`

Assign each survivor to exactly one `group` (`agents | infra | data | backend | devex`) by best fit. Fill each group toward its `target`; if a group is thin, the surplus goes to whichever group has the strongest remaining candidates — **the total floor (50) beats per-group targets**. Rank `1..N` within each group.

## A.4 Write each `ToolItem` (shape in `lib/types.ts`)

- `rank`: 1..N within its group
- `name`: clean, recognizable. `"Bun"`, not `"oven-sh/bun"`. Keep enough to disambiguate.
- `group`: one of the five ids
- `subcategory`: 1–3 word label, e.g. `"agent-harness"`, `"mcp-server"`, `"vector-db"`, `"wasm-runtime"`, `"cli"`
- `one_liner`: **12–18 words**, what it is, no marketing voice
- `paragraph`: **3–5 sentences**, why it is trending NOW and why it is trustworthy: stars and growth this week, language, last push / latest release, who is adopting it. Every number from a real fetch. No links inline.
- `url`: the canonical `html_url` of the repo — always `https://github.com/{owner}/{repo}`

---

# PART B — Trending top 30

Models, APIs & services, and resources. Tools now live in Part A — **do not put GitHub repos here** unless the entry is a hosted API/service or a long-form resource.

Read `CategoryConfig.trending` from `lib/sources.ts`. It defines:
- `totalCap` — overall cap (30)
- `windowDays` — velocity window (7)
- `subcategories.{model, api, resource}` — each has `count` and `scope`
- `sources[]` — APIs / web search queries to consult

## Sub-section caps (must hit these exactly when possible)

| Subcategory | Count | Focus |
|---|---|---|
| `model`    | 13    | Open-weight LLMs, code models, embeddings, locally-deployed models, frontier updates |
| `api`      | 12    | Hosted dev-infra services, AI infrastructure APIs, managed services |
| `resource` | 5     | Long-form blog posts, talks, deep guides — going viral among engineers |

Total = 30. If a sub-section can't fill its cap with quality items, ship fewer rather than padding. Push hard before giving up — the signal is out there.

## What "trending" means here

**Score each candidate as: velocity × recency × relevance.**

- **Velocity** — fast growth this week:
  - GitHub: stars added in last 7 days (for new repos, total stars × age weighting works as proxy)
  - Hugging Face: position on the trending API (already a velocity signal)
  - npm/PyPI: weekly download growth rate
  - OpenRouter: usage rank changes
- **Recency** — created or had a major update within last ~30 days gets a boost; legacy "always popular" tools (Postgres, Redis, K8s itself) do NOT belong here unless they had a specific notable release this week
- **Relevance** — must align with `subcategory.scope`. Drop frontend/UI/CSS/mobile tools.

Drop entirely:
- Crypto / web3 / NFT tooling
- Frontend frameworks (React, Vue, Svelte) UNLESS directly backend-relevant
- Awesome-lists, dotfiles, "interview-questions" repos
- Personal portfolio projects with no traction beyond their author
- AI hype with no working code/API

## Source playbook

Fetch these **in parallel** wherever possible. Each `TrendingSourceConfig` in `lib/sources.ts` has a `kind`:

### GitHub signal
- Trending has no `github_search` sources of its own — reuse the Part A pool. Open-source repos that are primarily a hosted service (e.g. an inference gateway with a cloud offering) may appear under `api`; everything else stays in Part A.

### `kind: "huggingface"` — Hugging Face API
- Endpoint is fully specified — just GET it
- No auth
- Parse: array of model objects with `id`, `pipeline_tag`, `downloads`, `likes`, `lastModified`, `tags`

### `kind: "openrouter"`
- `https://openrouter.ai/api/v1/models` — gives metadata
- Also fetch `https://openrouter.ai/rankings` (HTML) and parse the leaderboard for usage signal — this is the most direct "which models are devs calling right now" data

### `kind: "rss"` — console.dev curated picks
- Standard RSS / Atom XML
- Parse entries from last `windowDays` days
- console.dev is curated — every entry is a candidate

### `kind: "product_hunt"`
- Use the public RSS feed at the URL given
- Filter to items in last 7 days
- Drop non-developer items

### `kind: "web_search"` — fallback for fresh launches
- Use the WebSearch tool with each query in `queries[]`
- Each query returns ~10 results — scan for genuine launch posts
- Verify candidates by following links; confirm there's a real product/repo
- Supplementary — only use to fill gaps

## Cross-source dedupe
- Same project may appear across multiple sources. Dedupe by canonical URL.
- Merge signals — if a tool shows up on GitHub trending AND ProductHunt this week, that's a stronger signal; reflect it in the `signal` field.

## Writing each `TrendingItem` (shape in `lib/types.ts`)

For each item that survives scoring:

- `rank`: 1..N **within its category** (1..13 for models, 1..12 for apis, 1..5 for resources)
- `name`: clean, recognizable name. `"Llama 3.3 70B"`, not `"meta-llama/Llama-3.3-70B-Instruct"`. Keep enough to disambiguate similarly-named things.
- `category`: `"model" | "api" | "resource"`
- `subcategory`: short label like `"code-llm"`, `"embedding"`, `"managed-service"`, `"inference-api"`, `"talk"`, `"long-form"`. 1–3 words.
- `one_liner`: **12–18 words**. What it is, no marketing voice. Example: `"Fast JS runtime, drop-in Node alternative with built-in bundler, transpiler, and package manager."`
- `paragraph`: **3–5 sentences**, plain English, why it's trending NOW. Concrete details (numbers, who's using it, what's new). No hype words. No links inline.
- `url`: canonical link (project repo, model page, API homepage, blog post)

---

# PART C — News sections

(Per-source config in `CategoryConfig.sources`.)

## Positive — rank these up
- new AI model releases, benchmarks, capability changes
- what engineers are actually building, using, discussing
- trending dev tools, libraries, frameworks (real adoption, not hype)
- platform engineering, infra, devops, observability
- AI agent / LLM infra / production-LLM patterns
- notable engineering blog posts, hot takes from credible engineers
- product launches in AI / dev-tools space

## Negative — drop entirely
- crypto, web3, NFTs
- consumer gadgets, phone rumors, Apple/Samsung leaks
- generic AI hype with no substance
- arXiv-only papers without a practical angle
- politics, layoffs gossip, recruiting drama, AI ethics op-eds

## Per-source fetching

### 1. Hacker News (`kind: "hn"`)
- Endpoint: `https://hacker-news.firebaseio.com/v0`
- Policy: `lookbackHours` (72), `minScore` (50), `maxItems` (40)
- Fetch `/topstories.json`, take first **200 IDs**, fetch each via `/item/{id}.json` in parallel batches
- Keep where `type == "story"`, `score >= minScore`, posted within `lookbackHours`
- **Soft floor**: if after filtering you have fewer than 20 items, also fetch `/beststories.json` (first 200 IDs), merge by ID, re-filter. Stop at 20+ quality items or pool exhausted.
- For final-cut items, fetch top 3–5 comments (`item.kids[]`) for the discussion digest

### 2. Reddit (`kind: "reddit"`)
For each feed in `feeds[]`:
- URL: `https://www.reddit.com/r/<subreddit>/top.json?t=<timeWindow>&limit=25`
- Header: `User-Agent: cihangirbozdogan-com-fetcher/1.0`
- Keep posts where `ups >= minUpvotes`, drop self-promo / low-effort
- Take up to `maxItems` per subreddit
- Merge across subs, dedupe by URL
- For final-cut items, fetch `<permalink>.json` for top comments → discussion digest

### 3. GitHub Trending (`kind: "github_trending"`)
For each feed in `feeds[]`:
- URL: `https://github.com/trending${language ? "/" + language : ""}?since=${timeWindow}`
- Parse `<article class="Box-row">`: repo name, description, language, stars-today/this-week
- Take up to `maxItems` per feed
- Drop boilerplate / awesome-lists
- Merge across feeds, dedupe by URL
- Note `timeWindow` in `source_meta` (`"+1,200 stars this week"` vs `"+340 stars today"`)

### 4. Blogs & Newsletters (`kind: "rss"`)
- Policy: `lookbackHours` (168 = 7 days), `maxItems` (20)
- Fetch each `feeds[]` URL, parse RSS/Atom XML
- Keep entries published within `lookbackHours`
- Merge, dedupe by URL, take top `maxItems` ranked by relevance + source authority

## Writing each `NewsItem`

- `title`: original, cleaned. Strip "Show HN:" prefix if content is clear.
- `url`: canonical article/repo link, NOT the discussion. Discussion URL goes in `details`.
- `summary`: **one sentence**, 15–25 words. Plain English, what it is + why it matters.
- `paragraph`: **plain-English explainer paragraph, MAX 5 sentences.**
  - What it is, what's actually new, why it matters in practice
  - Concrete details (model name, numbers, framework) over hand-waving
  - No jargon walls, no marketing voice
  - No quotes from comments (those go in `details`)
  - No discussion links (those go in `details`)
  - Stop at 5 sentences even if tempted to add more
- `details`: community signal — what people are saying.
  - 2–3 lines digesting top HN/Reddit comments
  - For non-discussion sources, short or empty
  - `Discussion: <url>` on its own line if different from `url`
  - Do NOT repeat content from `paragraph`

---

# PART D — Voices

A curated roster of trusted engineering / AI practitioner blogs. Per-author latest-posts feed, **independent of news churn**.

Read `voices` from `lib/sources.ts` (`CategoryConfig.voices`). It defines:
- `lookbackDays` (30) — drop posts older than this
- `maxPostsPerAuthor` (5) — cap per author
- `authors[]` — `{ name, homepage, feed, focus? }` entries

## Per-author fetch

For each author, in parallel:

1. Fetch `feed` URL. Follow redirects (curl `-L`). Headers: `User-Agent: cihangirbozdogan-com-fetcher/1.0`, `Accept: application/rss+xml, application/atom+xml, application/xml`.
2. Parse RSS or Atom. Try both — feeds vary:
   - RSS: `<item>` with `<title>`, `<link>`, `<pubDate>`, `<description>` / `<content:encoded>`
   - Atom: `<entry>` with `<title>`, `<link href>`, `<published>` or `<updated>`, `<summary>` / `<content>`
3. For each entry, extract a date. Try in order: `pubDate`, `published`, `updated`, `dc:date`. If none present, **skip the entry** (not the whole author).
4. Drop entries older than `lookbackDays` (compare against `now - lookbackDays`).
5. Sort remaining entries by date desc, take top `maxPostsPerAuthor`.
6. **If author has zero entries in window → omit the author entirely from output.** Do NOT include silent authors.
7. For each kept entry, generate a `summary`:
   - 1–2 sentences, plain English, easy to understand
   - Cover what the post is about and why it's worth reading
   - May lift the author's own framing if it's already clean — but rewrite jargon walls
   - No marketing voice, no hype words, no "must read" filler
   - 20–40 words

## Per-entry shape

Each kept entry becomes a `VoicePost`:
```json
{ "title": "Cleaned title (no HTML, entities decoded)", "url": "absolute URL", "summary": "1–2 sentence plain-English summary." }
```

Each author with at least one kept post becomes a `Voice`:
```json
{ "author": "Simon Willison", "url": "https://simonwillison.net", "posts": [ /* 1..3 VoicePost, newest first */ ] }
```

## Edge cases

- **Relative `<link>` URLs** — resolve against feed `<channel><link>` or feed URL host
- **HTML in titles** — strip tags, decode `&amp;` `&#39;` etc.
- **Full-content vs excerpt feeds** — both are fine, the LLM summarizer handles both
- **Substack feeds** — same as RSS, but pubDate is reliable
- **Feed 404 / DNS / timeout** — catch, skip author, **report failure** in run summary. Do NOT fabricate posts to fill the gap
- **Malformed XML** — try Atom selectors as fallback before giving up
- **Duplicate posts across authors** (cross-posts) — keep both, scoped to author
- **Same author posted >5 in window** — keep 5 most recent
- **All authors silent (rare)** — emit `voices: []`. Page handles empty state.

## Order

Output `voices[]` in the **same order as `authors[]` in `lib/sources.ts`**. Do not re-sort by recency or post count — the roster order is intentional.

---

# Output

Write the final `NewsPayload` JSON to `content/news.json`, **fully overwriting** the existing file.

Schema (must match `lib/types.ts` exactly):

```json
{
  "fetched_at": "<ISO 8601 in UTC>",
  "category": "tech",
  "tools": [
    {
      "rank": 1,
      "name": "Bun",
      "group": "backend",
      "subcategory": "runtime",
      "one_liner": "Fast JS runtime, drop-in Node alternative with built-in bundler, transpiler, and package manager.",
      "paragraph": "...",
      "url": "https://github.com/oven-sh/bun"
    }
  ],
  "trending": [
    {
      "rank": 1,
      "name": "Llama 3.3 70B",
      "category": "model",
      "subcategory": "open-weight-llm",
      "one_liner": "...",
      "paragraph": "...",
      "url": "https://huggingface.co/meta-llama/Llama-3.3-70B-Instruct"
    }
  ],
  "sections": [
    { "name": "Hacker News",         "items": [...] },
    { "name": "Reddit",              "items": [...] },
    { "name": "GitHub Trending",     "items": [...] },
    { "name": "Blogs & Newsletters", "items": [...] }
  ]
}
```

Section names **must match the `name` fields in `lib/sources.ts`**. Validate JSON parses before writing.

Pre-write checks (abort and fix if any fails):
- `tools.length >= 50`
- every `tools[].url` starts with `https://github.com/`
- every `tools[].group` is one of `agents | infra | data | backend | devex`
- no `trending[]` entry has `category: "tool"`

# Commit & push

```bash
cd /Users/cihangirbozdogan/Documents/Projects/cihangirbozdogan.com
git add content/news.json
git commit -m "refresh: $(date -u +%Y-%m-%dT%H:%MZ)"
git push origin main
```

Then report:
- timestamp
- tools total + count per group, and how many candidates the maintenance gate rejected
- trending counts per sub-section
- news counts per section
- 1-line summary of the day's biggest story
- "GitHub Pages will redeploy in ~1min"

# Rules of engagement

- **Be ruthless on signal**: 10 great items beats 30 padded ones. Respect category caps as a *target*, but the floor is quality.
- **Except tools**: 50 is a hard floor. Widen the search until you have 50 repos that pass the maintenance gate. If you genuinely cannot (GitHub API down), ship what passed and say so loudly.
- **Fetch in parallel**: multiple `curl`/WebFetch calls in one tool block.
- **Do not hallucinate** URLs, scores, comment quotes, or stats. Every number must come from a real fetch.
- **Do not invent items** when a source fails. Empty section + report the failure to the user.
- **Do not write to any file other than `content/news.json`.**
- **Do not run `git push --force`** or any destructive git operations.
- If the working tree has unrelated changes, stop and ask before committing.
