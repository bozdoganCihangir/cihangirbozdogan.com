---
description: Fetch today's tech & AI news, curate, write content/news.json, commit & push.
allowed-tools: Bash, Read, Write, Edit, WebFetch, Agent
argument-hint: "[category] (optional, default: tech)"
---

You are running the daily news refresh for a personal zero-cost static site at `/Users/cihangirbozdogan/Documents/my-news`.

# Goal

Replace `content/news.json` with the freshest, highest-signal tech / AI news, curated for a senior engineer (Cihangir). Then commit and push to `main` so Vercel auto-deploys.

The site has **no database**. Each run **fully overwrites** `content/news.json`. There is no history.

# Category

Argument: `${1:-tech}` — default `tech`.

**First step every run**: read `lib/sources.ts`. That file is the **single source of truth** for which feeds to fetch and the per-source policy (lookback windows, item caps, score thresholds). Follow it exactly.

If a different category is requested and not present in `CATEGORIES`, stop and tell the user to add it to `lib/sources.ts` first.

# What "useful for me" means (from `CategoryConfig.positiveTopics` / `negativeFilters`)

**Positive — rank these up:**
- new AI model releases, benchmarks, capability changes
- what engineers are actually building, using, discussing
- trending dev tools, libraries, frameworks (real adoption, not hype)
- platform engineering, infra, devops, observability
- AI agent / LLM infra / production-LLM patterns
- notable engineering blog posts, hot takes from credible engineers
- product launches in AI / dev-tools space

**Negative — drop entirely:**
- crypto, web3, NFTs
- consumer gadgets, phone rumors, Apple/Samsung leaks
- generic AI-will-change-the-world hype with no substance
- arXiv-only papers without a practical angle (skip arXiv entirely)
- politics, layoffs gossip, recruiting drama, AI ethics op-eds

# Per-source fetching (follow `lib/sources.ts` exactly)

Fetch all sources **in parallel** wherever possible. Each source has its own policy — **do NOT treat them uniformly**.

## 1. Hacker News (`kind: "hn"`)
- Endpoint: `https://hacker-news.firebaseio.com/v0`
- Policy from config: `lookbackHours` (default 72), `minScore` (default 80), `maxItems` (default 40)
- Fetch `/topstories.json`, then the first ~100 IDs in parallel via `/item/{id}.json`
- Keep items where `type == "story"`, `score >= minScore`, posted within `lookbackHours`
- For final-cut items, also fetch top 3–5 comments (`item.kids[]`) for the discussion digest

## 2. Reddit (`kind: "reddit"`)
- For each feed in `feeds[]`:
  - URL: `https://www.reddit.com/r/<subreddit>/top.json?t=<timeWindow>&limit=25`
  - Header: `-A "my-news-fetcher/1.0"` (Reddit blocks empty UA)
  - Keep posts where `ups >= minUpvotes`, drop self-promo / low-effort
  - Take up to `maxItems` per subreddit
- Merge all subreddit results into the **Reddit** section, dedupe by URL across subs
- For final-cut items, optionally fetch `<permalink>.json` for top comments → discussion digest

## 3. GitHub Trending (`kind: "github_trending"`)
GitHub has no official trending API — scrape HTML.

For each feed in `feeds[]`:
- URL: `https://github.com/trending${language ? "/" + language : ""}?since=${timeWindow}`
- Parse `<article class="Box-row">` elements: repo name, description, language, stars-today/this-week
- Take up to `maxItems` per feed
- Drop boilerplate / awesome-lists / non-engineering repos
- Merge across feeds into **GitHub Trending** section, dedupe by repo URL
- Note `timeWindow` in `source_meta` (e.g. `"+1,200 stars this week"` vs `"+340 stars today"`)

## 4. Blogs & Newsletters (`kind: "rss"`)
- Policy: `lookbackHours` (default 7 days — newsletters post weekly), `maxItems` (default 20)
- For each `feeds[]` entry, fetch the URL and parse RSS/Atom XML
- Keep entries published within `lookbackHours`
- Merge across all feeds, dedupe by URL, then take top `maxItems` ranked by relevance + source authority

# Filtering & curation (after fetch)

For every candidate, apply this judgement (you are the LLM filter — no external API):

1. **Drop** if it hits any negative filter.
2. **Drop** if title is clickbait or content-free.
3. **Drop near-duplicates** across sources — keep the highest-quality version (HN > Reddit > random blog) and merge signals into `source_meta` if useful.
4. **Score remaining** by relevance × engagement (HN points, Reddit upvotes, GH stars-velocity, RSS source authority).
5. **Respect each source's `maxItems` cap.** If a feed has fewer than `maxItems` quality items, ship fewer — **do NOT pad with junk**.

# Writing each item (`NewsItem` shape — see `lib/types.ts`)

- `title`: original title, cleaned. Strip "Show HN:" prefix if content is clear, otherwise keep.
- `url`: canonical link (article/repo, NOT the HN/Reddit discussion). Note discussion URL inside `details`.
- `summary`: **one tight sentence**, ~15–25 words. What it is + why it matters. No hype words.
- `details`: 3–6 lines. Mix of:
  - what it is in 1–2 lines
  - why it matters / what's new
  - **for HN & Reddit**: 2–3 line digest of top community reactions ("Top comment argues X. Most-upvoted reply pushes back with Y. Several engineers report using it for Z.") — this is the highest-value part for the user
  - link to the discussion thread on its own line if different from `url`
- `source_meta`: short stat string. Examples:
  - `"412 pts · 187 comments · HN"`
  - `"r/LocalLLaMA · 3.2k upvotes · 412 comments"`
  - `"+2,141 stars today · TypeScript"`
  - `"+8,420 stars this week · Python"`
  - `"Simon Willison · 4h ago"`
  - `"The Batch · April 23"`

# Output

Write the final `NewsPayload` JSON to `content/news.json`, **fully overwriting** the existing file.

Schema (must match `lib/types.ts` exactly):

```json
{
  "fetched_at": "<ISO 8601 in UTC, e.g. 2026-04-25T08:03:00Z>",
  "category": "tech",
  "sections": [
    { "name": "Hacker News",         "items": [...] },
    { "name": "Reddit",              "items": [...] },
    { "name": "GitHub Trending",     "items": [...] },
    { "name": "Blogs & Newsletters", "items": [...] }
  ]
}
```

Section names **must match the `name` fields in `lib/sources.ts`**. Validate the JSON parses before writing.

# Commit & push

After writing the file:

```bash
cd /Users/cihangirbozdogan/Documents/my-news
git add content/news.json
git commit -m "news: $(date -u +%Y-%m-%dT%H:%MZ)"
git push origin main
```

Then report to the user:
- timestamp
- counts per section
- 1-line summary of the day's biggest story
- "Vercel will redeploy in ~30s"

# Rules of engagement

- **Be ruthless on signal**: 12 great items beats 20 padded ones. Respect each source's cap as a *maximum*, not a target.
- **Fetch in parallel**: multiple `curl` calls in one Bash command, multiple WebFetch tool uses in a single block.
- **Do not hallucinate** URLs, scores, comment quotes, or dates. Every number and quote must come from a real fetch.
- **Do not invent items** when a source fails. Include that section empty and note the failure in your final report (not in the JSON).
- **Do not write to any file other than `content/news.json`.**
- **Do not run `git push --force`** or any destructive git operations.
- If the working tree has unrelated changes, stop and ask the user before committing.
