---
description: Fetch today's tech & AI news, curate, write content/news.json, commit & push.
allowed-tools: Bash, Read, Write, Edit, WebFetch, Agent
argument-hint: "[category] (optional, default: tech)"
---

You are running the daily news refresh for a personal zero-cost static site at `/Users/cihangirbozdogan/Documents/my-news`.

# Goal

Replace `content/news.json` with **today's freshest tech / AI news**, curated for a senior engineer (Cihangir). Then commit and push to `main` so Vercel auto-deploys.

The site has **no database**. Each run **fully overwrites** `content/news.json`. There is no history.

# Category

Argument: `${1:-tech}` — default `tech`.

For now only `tech` is implemented. Read `lib/sources.ts` to confirm the active category config (`positiveTopics`, `negativeFilters`, `itemsPerSection`, `sources`). If a different category is requested and not present, stop and tell the user to add it to `lib/sources.ts` first.

# What "useful for me" means

Positive (rank these up):
- new AI model releases, benchmarks, capability changes
- what other engineers are actually building, using, discussing
- trending dev tools, libraries, frameworks (real adoption, not hype)
- platform engineering, infra, devops, observability
- AI agent / LLM infra / production-LLM patterns
- notable engineering blog posts, hot takes from credible engineers
- product launches in AI / dev-tools space

Negative (drop these — do not include):
- crypto, web3, NFTs
- consumer gadgets, phone rumors, Apple/Samsung leaks
- generic AI-will-change-the-world hype with no substance
- pure academic arXiv papers without a practical angle (skip arXiv entirely)
- politics, layoffs gossip, recruiting drama, AI ethics op-eds
- anything older than ~24 hours unless it's still actively trending

# Sources to fetch (all free, no API keys, no auth)

Fetch these **in parallel** using Bash (`curl`) and/or WebFetch. Aim for ~30–40 raw candidates per source so we have enough to filter down to 20.

## 1. Hacker News
- Top stories list: `https://hacker-news.firebaseio.com/v0/topstories.json`
- For each top ~60 IDs, fetch item: `https://hacker-news.firebaseio.com/v0/item/{id}.json`
- Keep items where `type == "story"`, `score >= 50`, posted within last ~36 hours.
- For items you keep in the final 20, also fetch top 3–5 comments (`item.kids[]` → fetch each) to build the "what people are saying" digest in `details`.

## 2. Reddit (no auth — JSON endpoints)
Fetch top of last day for each:
- `https://www.reddit.com/r/LocalLLaMA/top.json?t=day&limit=25`
- `https://www.reddit.com/r/MachineLearning/top.json?t=day&limit=25`
- `https://www.reddit.com/r/programming/top.json?t=day&limit=25`
- `https://www.reddit.com/r/artificial/top.json?t=day&limit=25`

Use a `User-Agent` header (Reddit blocks empty UA): `-A "my-news-fetcher/1.0"`.

Merge across subreddits, dedupe by URL, drop self-promo / low-effort posts. For kept items, optionally fetch the post page JSON (`<permalink>.json`) to get top comments for the discussion digest.

## 3. GitHub Trending
GitHub has no official trending API. Scrape the HTML:
- `https://github.com/trending?since=daily`
- `https://github.com/trending/python?since=daily`
- `https://github.com/trending/typescript?since=daily`
- `https://github.com/trending/rust?since=daily`

Parse the `<article class="Box-row">` elements. Extract repo name, description, language, stars-today.

Drop boilerplate / awesome-lists / non-engineering content.

## 4. Blogs & Newsletters (RSS)
Fetch each (XML — parse manually):
- Simon Willison: `https://simonwillison.net/atom/everything/`
- The Batch (DeepLearning.ai): `https://www.deeplearning.ai/the-batch/feed/`
- Import AI: `https://importai.substack.com/feed`
- Hugging Face blog: `https://huggingface.co/blog/feed.xml`
- OpenAI: `https://openai.com/news/rss.xml`
- Anthropic: `https://www.anthropic.com/news/rss.xml`
- Vercel: `https://vercel.com/atom`
- lobste.rs hot: `https://lobste.rs/hot.rss`

Keep only entries from the **last 48 hours**.

# Filtering & curation

For every candidate, apply this judgement (you are the LLM filter — no external API needed):

1. **Drop** if it hits any negative filter above.
2. **Drop** if title is clickbait or content-free.
3. **Drop near-duplicates** — same story from multiple sources, keep the highest-quality version (HN > Reddit > random blog) and merge signals into `source_meta` if useful.
4. **Score remaining** by relevance to positive topics × engagement (HN points, Reddit upvotes, GH stars-today, RSS source authority).
5. **Pick top 20 per section** (Hacker News, Reddit, GitHub Trending, Blogs & Newsletters). If a section has fewer than 20 quality items, include only what's good — do NOT pad with junk.

# Writing each item

For each kept item, write a `NewsItem` (shape in `lib/types.ts`):

- `title`: original title, cleaned (strip "Show HN:" prefix is fine if content is clear, otherwise keep).
- `url`: canonical link (the actual article/repo, not the HN/Reddit discussion). For HN/Reddit, *also* note the discussion URL inside `details`.
- `summary`: **one tight sentence**, ~15–25 words, plain English, what the thing is and why it matters. No hype words.
- `details`: 3–6 lines. Mix of:
  - what it is in 1–2 lines
  - why it matters / what's new
  - for HN & Reddit items: a 2–3 line digest of the **top community reactions** ("Top comment argues X. Most-upvoted reply pushes back with Y. Several engineers report using it for Z.") — this is the highest-value part for the user.
  - link to the discussion thread on its own line if different from `url`
- `source_meta`: short stat string. Examples: `"412 pts · 187 comments · HN"`, `"r/LocalLLaMA · 3.2k upvotes"`, `"+2,141 stars today · TypeScript"`, `"Simon Willison · 4h ago"`.

# TL;DR

After writing all sections, write a `tldr` of **5 bullets** capturing what mattered today. Each bullet ≤ 20 words, reference specific things (model name, repo, person), no hand-waving.

# Output

Write the final `NewsPayload` JSON to `content/news.json`, **fully overwriting** the existing file.

Schema (must match `lib/types.ts` exactly):

```json
{
  "fetched_at": "<ISO 8601 in UTC, e.g. 2026-04-25T08:03:00Z>",
  "category": "tech",
  "tldr": ["...", "...", "...", "...", "..."],
  "sections": [
    { "name": "Hacker News",        "items": [...] },
    { "name": "Reddit",              "items": [...] },
    { "name": "GitHub Trending",     "items": [...] },
    { "name": "Blogs & Newsletters", "items": [...] }
  ]
}
```

Validate the JSON parses before writing.

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
- the deployed URL (if known) or "Vercel will redeploy in ~30s"

# Rules of engagement

- **Be ruthless on signal**: 12 great items beats 20 padded ones. If GitHub Trending only has 8 worthwhile repos today, ship 8.
- **Fetch in parallel** wherever possible (multiple `curl` commands in one Bash call, or multiple WebFetch calls in a single tool block).
- **Do not hallucinate URLs, scores, or comment quotes**. Every number and quote must come from a real fetch.
- **Do not invent items** when sources are slow / fail. If a section can't be fetched, include it empty and note the failure in your final report (not in the JSON itself — the empty section is enough).
- **Do not write to any file other than `content/news.json`**.
- **Do not run `git push --force` or any destructive git operations.**
- If the working tree has unrelated changes, stop and ask the user before committing.
