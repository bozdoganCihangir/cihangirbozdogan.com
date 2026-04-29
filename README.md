# cihangirbozdogan.com

The personal site of **[Cihangir Bozdogan](https://www.cihangirbozdogan.com)** — a London-based senior software engineer. Live at **[www.cihangirbozdogan.com](https://www.cihangirbozdogan.com)**.

It's a daily-refreshed feed of high-signal tech and AI: trending tools, models, APIs, and writing from practitioner blogs Cihangir Bozdogan actually reads. One audience (me), one editor (also me), zero ceremony.

---

## Why this exists

Most "news" sites optimise for engagement. This one optimises for **signal-to-noise** for a working backend / infra / AI engineer. Hacker News front page, a few high-quality subreddits, GitHub Trending, and a hand-curated roster of practitioner blogs — fetched, ranked, and summarised once a day, then frozen as a static snapshot.

No infinite scroll. No tracking. No ads. No login. No dark patterns. Just today's signal, and yesterday's signal is gone.

## Architecture

The interesting bit: **this site has no runtime.** No database, no API routes, no serverless functions, no auth, no users beyond me. The entire thing is a static export served from Vercel's edge.

What replaces the runtime is an **LLM-driven content pipeline** that runs on demand:

```
RSS / HN / Reddit / GitHub  →  Claude Code agent  →  content/news.json  →  git push  →  Vercel CDN
                                       ↑
                            /refresh slash command
```

`/refresh` is a Claude Code slash command (`.claude/commands/refresh.md`) that:

1. Reads `lib/sources.ts` — the single source of truth for feeds, lookback windows, item caps, and the curated author roster.
2. Fans out fetches in parallel against HN, Reddit, GitHub Trending, and ~40 RSS/Atom feeds.
3. Ranks, dedupes, and summarises each item into a `NewsItem` typed against `lib/types.ts`.
4. Synthesises a "trending top 50" of tools / models / APIs / resources gaining traction this week.
5. **Fully overwrites** `content/news.json` and pushes to `main`.
6. Vercel rebuilds. Live in ~30 seconds.

Git is the database. The commit log is the audit trail. The LLM is the ETL.

This makes the whole thing **stateless, idempotent, forkable, and free**. The only "infrastructure" is GitHub + Vercel's free tier.

## Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | **Next.js 16** (App Router, Turbopack) | Best-in-class static prerender, RSC ergonomics, zero config on Vercel |
| Language | **TypeScript** strict | Schema-first; `lib/types.ts` is the contract between the LLM pipeline and the UI |
| Styling | **Tailwind CSS v4** | Theme tokens in `app/globals.css`, no design system bloat |
| Typography | **Inter** + **Source Serif 4** via `next/font` | Editorial / FT-pink-paper aesthetic |
| Hosting | **Vercel** free tier | Static output, edge-cached globally |
| Images | **`next/og`** | Favicon, Apple touch icon, OG card all generated at build — no static asset pipeline |
| SEO | Native `Metadata` API + JSON-LD (`Person`, `WebSite`) | Structured data injected from `lib/seo.ts` (single source of truth for site URL, name, description, keywords) |

No CMS. No headless anything. No Redux, no Zustand, no SWR, no React Query. The page receives a JSON file at build time and renders it. That's the whole component tree.

## Engineering principles

A few constraints that shape every decision:

- **The build must be free and fast.** Static export, no SSR, no ISR. Cold visit is a CDN hit.
- **No new dependencies without a fight.** `package.json` is deliberately tiny — Next, React, Tailwind, types. Anything else is a tax on every future maintainer (me, in six months).
- **No tests.** This is a personal site with zero business logic. The build is the verification: if `pnpm build` passes, types check, and pages prerender, it ships. Test suites here would be ceremony.
- **Schema before UI.** `lib/types.ts` is the contract. The LLM produces it; React consumes it. If they drift, the build fails.
- **Don't fabricate data.** If a feed 404s during `/refresh`, the run reports the failure and ships without those items. No invented posts to fill gaps.
- **Editorial restraint.** Voices items show title + summary, no avatars, no dates, no engagement metrics. The reader's attention belongs to the writing.

## Pages

- **`/`** — News: HN, Reddit, GitHub Trending, Blogs & Newsletters. Sidebar shows the live trending list.
- **`/voices`** — A curated roster of practitioner blogs Cihangir Bozdogan reads regularly. Latest posts, last 30 days, capped per author so no single voice dominates.
- **`/trending`** — Full detail for the week's trending tools / models / APIs, with anchor TOC.

Layout is a sticky top nav (`components/nav.tsx`) and a shared two-column shell (`components/page-shell.tsx`). Every page is fully prerendered.

## About Cihangir Bozdogan

Cihangir Bozdogan is a senior software engineer based in London. He works across backend systems, AI infrastructure, and product engineering — the kind of problems where correctness, latency, and operational simplicity all matter at once. This site is the public-facing index of what he's reading and tracking day to day.

- Site: **[www.cihangirbozdogan.com](https://www.cihangirbozdogan.com)**
- Email: **bozdogan.cihangir@gmail.com**
- Location: London, UK

## License

Code: MIT-spirited — fork it, strip my name, run your own. Curated content (`content/news.json`, sources roster in `lib/sources.ts`) reflects Cihangir Bozdogan's editorial taste; if you fork, please make it yours.
