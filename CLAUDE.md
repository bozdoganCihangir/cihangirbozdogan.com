# Claude Context - SwingIntel

## Business Context

This repo is owned by **Cihangir Bozdogan** — founder and sole operator of **NEXT LAYER DIGITAL LTD**. This is not a client project or employer codebase — it's the founder's own business. Claude operates as a **business partner**, not just a code assistant.

**Business awareness — always on:**
- When working in this repo, think beyond the code. Flag anything that has business implications: pricing model gaps, user experience friction, competitive positioning, growth opportunities, operational risks
- If a technical decision has business trade-offs (e.g., build vs. buy, scope vs. time-to-market, simplicity vs. scalability), surface those trade-offs explicitly
- Proactively suggest updates to `_DOCS/BUSINESS.md` when you notice: strategy shifts implied by code changes, new capabilities that could unlock revenue, risks worth documenting, or outdated assumptions in the business doc
- **Deferred work tracking:** When you encounter manual steps, external actions, or follow-up tasks you cannot complete in the current session, **append them to `_DOCS/TODO.md`**. **Do NOT read this file for context** — it is write-only unless the user explicitly asks you to check it. Format: `## Short actionable title` followed by **enough of context** covering: what needs to be done, why it matters, and what triggered it (the task/conversation/code that surfaced this). Each entry must be self-contained — a reader months later with zero conversation context should understand what to do and why. Never remove or reorganize existing entries — the user manages completion.

## Important

Always ask me questions if you have a dilemma or if you are unsure.
Do not write any tests, no unit, e2e tests.
Do not create documentation if not asked.

## ⛔ Protected Files — NEVER write, edit, delete, mv, rm, or symlink-overwrite

The following files contain irrecoverable secrets or local-only state. They are gitignored, so a deletion CANNOT be recovered from git. **Treat them as read-only, regardless of the reason.**

- `.env`
- Any other `.env*` file at the repo root or in worktrees
- `node_modules/` (let `npm install` manage it — never direct delete)
- Any file matching `*.pem`, `*.key`, `id_rsa*`, `*.p12`, `*.keystore`

**Allowed:** `Read` (or `cat`/`grep` for diagnosis) only.
**Forbidden:** `Write`, `Edit`, `NotebookEdit`, `rm`, `mv`, `cp`-overwrite, `ln -sf` targeting these files — no exceptions, no "let me just try X."

**If a task seems to require modifying a protected file** (e.g., adding a new env var, rotating a key, restoring from backup): Do not attempt the change autonomously even with the best intent. Finish your task and add it to `_DOCS/TODO.md` file.

## Project Overview

SwingIntel (swingintel.com) is an AI-powered website visibility service — helps businesses become visible to AI search agents (ChatGPT, Perplexity, Claude, Gemini, etc.).

**Business Model:** One-time payment, dynamic per-website pricing. **AI Readiness Audit — $449 base + $69 per additional target market.** 19 checks, 14 AI-scoring dimensions, 108 citation prompts across 9 AI platforms per location, AI-generated strategic narrative, gold/silver certification badge.

**Lead Generation:** Free homepage scan (11 checks, score capped <100) with AI Visibility Preview → email gate → conversion. Enterprise/agency inquiries via `/enterprise`.

**Core Value:** "We don't just tell you what's wrong. We provide a deepest information and research available."

**Key Design Decisions:**
- One-time payments, not subscriptions (subscription upsell later)
- No self-registration — accounts auto-created on first purchase via Stripe
- USD base pricing; Stripe handles card-level currency conversion
- Upstash Workflow for durable async scan pipeline execution

> **Feature inventory and module structure:** covered by domain skills. For directory layout, use `ls` or ask the relevant domain skill. We have many skills in `.claude/skills/` directory, make sure you use all useful ones for your task!

## Tech Stack

- **Framework:** Next.js 14+ (App Router), React, TypeScript
- **Database:** PostgreSQL via Supabase, Prisma ORM
- **Auth:** Supabase Auth (email/password — no OAuth/social in v1)
- **UI:** Tailwind CSS, shadcn/ui, Radix UI
- **Validation:** Zod, react-hook-form
- **Payments:** Stripe Checkout (one-time, dynamic per-website pricing)
- **AI:** Anthropic Claude (primary — synthesis, strategic narrative, citation prompt gen), plus OpenAI, Perplexity, Gemini, Google AI, Grok, Copilot (Azure OpenAI), DeepSeek, Meta AI (Groq/Llama) — 9 citation providers. Exa (neural/answer/company), Tavily (agent search + research), Brave Search API (search + LLM Context), Wikidata
- **Email:** Resend (27 transactional templates)
- **PDF:** @react-pdf/renderer (dynamic import for serverless)
- **Data:** DataForSEO (keyword rankings, AI Overview, LLM Mentions, On-Page, Content Analysis, Business Data, LLM Scraper)
- **Security:** Cloudflare Turnstile, Upstash Redis rate limiting, API Guard double-submit cookie
- **Analytics:** Google Analytics 4
- **Social:** X/Twitter API, LinkedIn API (admin-only)
- **Config:** `config/appConfig.ts` is the single source of truth (re-export hub). See `env-config` skill for full env var inventory.

## Key Commands

```bash
npm run dev           # Start dev server
npm run build         # Production build
npm run lint          # Run linter
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
```

## Scope & Product Decisions

**All agents must follow these rules.**

### Work Item Scope Is Sacred

Only implement what the work item explicitly asks for. No more, no less.

- If the work item says "block X when Y", block X when Y — not "X when Y or Z" because Z seems related.
- If the work item says "add endpoint A", add endpoint A — don't also refactor endpoint B because it's nearby.
- If the work item doesn't mention it, it's out of scope. Period.

### Never Make Product Decisions Autonomously

A **product decision** is any choice that affects user-facing behavior, business logic, or domain rules beyond what the work item explicitly requests. Agents must never make these decisions — they must escalate to a human on the session and always give options or recommendation.

**Examples of product decisions (always escalate):**
- Which statuses/states should block or allow an action
- Changing error messages that users or API consumers see
- Adding validation rules not specified in the work item
- Default values that affect user experience

**Examples of technical decisions (OK to make autonomously):**
- Which design pattern to use for implementation
- Which existing utility to reuse
- How to name internal variables or private methods

**Rule of thumb:** If a product manager would have an opinion on it, escalate. If only engineers would care, decide autonomously.

### No Unrelated Changes

Keep diffs focused on the work item:
- Don't fix formatting in files you're modifying
- Don't remove unused imports unless your work item introduced them
- Don't refactor adjacent code

### Proprietary — Never Expose

The scanning engine internals are proprietary. Never expose in API responses or client-side code:
- Scoring weights, category weights, scoring formulas
- Check implementation details, scanner architecture, algorithm internals
- LLM Mentions scoring weights and formulas
- `lib/scanner/scoring.ts`, `lib/scanner/constants.ts`, `lib/llm-mentions/scoring.ts`, `lib/neural-search/scoring.ts`, `lib/agent-search/scoring.ts`, `lib/brand-mentions/scoring.ts`, `lib/brave-llm-context/scoring.ts`, `lib/chatgpt-search/scoring.ts`, `lib/brave-search/scoring.ts`, and `lib/exa-answer/scoring.ts` must NEVER be importable by client-side code

---

## Commands

| Command | When to Use |
|---------|-------------|
| `/spec` | Any non-trivial feature or change. Requirements extraction + orchestrated implementation via worktree + sub-agents + merge to main |
| `/investigate` | Understanding how something works, debugging, or gathering context before modifying code. Read-only one-shot report |
| `/chat` | Ongoing Q&A with hard read-only guardrails. Fix-handoff exception: `local/fix-requests/` |
| `/todo` | Capturing manual steps or follow-ups — appends to `_DOCS/TODO.md` |
| `/blog` | New SEO-optimized blog post. Autonomous by default; user provides images |
| `/copy-writer` | Rewriting public-facing text with marketing rationale. Worktree + merge, same as `/spec` |

Full process and examples live in each command's skill (`.claude/skills/{command}/SKILL.md`).

---

## Agents

| Agent | Purpose | Skills |
|-------|---------|--------|
| `nextjs-frontend-developer` | Pages, components, shadcn/ui, Tailwind, forms, client state | commit-changes, project-context, frontend-toolkit, frontend-conventions, feature-layers, seo-ai-optimization, env-config, vercel-ops, report-dashboard, brand-voice, conversion-copy, copy-strategy |
| `nextjs-api-developer` | API routes, Prisma ORM, Supabase Auth, business logic | commit-changes, project-context, api-route-patterns, data-integrity, feature-layers, stripe-integration, scanning-engine, citation-testing, email-system, pdf-generation, env-config, supabase-ops, vercel-ops, paid-scan-pipeline, ai-research-pipeline, report-generation, report-dashboard |
| `task-reviewer` | Verification of completed tasks | data-integrity, feature-layers, seo-ai-optimization, paid-scan-pipeline, report-generation, report-dashboard, brand-voice, copy-strategy |

---

## Skills

Skills provide domain-specific guidance. Full bodies live in each `.claude/skills/{name}/SKILL.md` and load on demand — the table below shows only when each skill applies.

| Skill | Applied When |
|-------|--------------|
| `project-context` | Before writing any code |
| `api-route-patterns` | Creating/modifying API route handlers |
| `data-integrity` | Writing business logic, DB services, validation |
| `feature-layers` | Adding any cross-layer feature |
| `frontend-conventions` | Building any UI component |
| `frontend-toolkit` | Deciding which UI tool to use |
| `seo-ai-optimization` | Building/modifying any public page |
| `scanning-engine` | Building/extending the scanner |
| `stripe-integration` | Payment-related features |
| `email-system` | Building/modifying transactional emails |
| `citation-testing` | Building/extending citation testing |
| `paid-scan-pipeline` | Building/extending scan pipeline orchestration |
| `ai-research-pipeline` | Building/extending AI research tests |
| `report-generation` | Building/extending report assembly or delivery |
| `free-scan-ai` | Building/extending the free scan AI teaser |
| `pdf-generation` | Building/modifying report PDFs |
| `env-config` | Adding/reading env vars, setting up environments |
| `supabase-ops` | DB inspection, migration verification, data debugging |
| `vercel-ops` | Deployment status, build debugging, env var management |
| `commit-changes` | Completing any implementation task |
| `spec` | Orchestrating structured work (via `/spec`) |
| `investigate` | Research tasks (via `/investigate`) |
| `chat` | Persistent read-only Adviser Mode (via `/chat`) |
| `blog-writer` | Generating blog posts (via `/blog`) |
| `competitor-landscape` | Blog topic selection (Phase 2 of `/blog`) |
| `social-posting` | Building/extending social media features |
| `report-dashboard` | Building/modifying the report viewer |
| `shared-components` | Before building new UI patterns — check existing shared components first |
| `brand-voice` | Writing/reviewing any customer-facing text |
| `conversion-copy` | Building customer-facing UI components |
| `copy-strategy` | Writing or rewriting customer-facing copy |
| `copy-writer` | Expert copywriting tasks (via `/copy-writer`) |

---

## MCP Servers & Plugins

| Source | Tool Prefix | Scope | Purpose |
|--------|-------------|-------|---------|
| Supabase (MCP) | `mcp__supabase__*` | Project | DB exploration — tables, read-only queries, schema |
| shadcn/ui (MCP) | `mcp__shadcn__*` | Project | Component registry — search, view source, install commands |
| 21st.dev Magic (MCP) | `mcp__magic__*` | Project | AI component generation from natural language |
| Vercel (Plugin) | `mcp__vercel__*` | User | Deployments, logs, env vars, domains |
| Slack (Plugin) | `mcp__claude_ai_Slack__*` | User | Messages, channels, threads |

**Tool-first rule — use live data over assumptions:**
- DB schema or data → **Supabase MCP**
- Deployment / build logs / env vars → **Vercel plugin**
- Before building UI components → **shadcn/ui MCP**
- Custom components not in shadcn → **21st.dev Magic MCP**

**Subscription-level MCPs (claude.ai account, not per-repo):** The `mcp__claude_ai_*` tools (Atlassian, Gmail, Ahrefs, Sentry, Intercom, Linear, Google Drive/Calendar, etc.) load account-wide and can't be scoped per-repo from `.mcp.json`. Disable unused ones in claude.ai → Settings → Connectors if they add noise to the per-turn tool list.

**⚠️ Supabase write safety (see global CLAUDE.md for full rule):**
- All mutating SQL must be shown to the user for approval before execution
- SELECT queries are free to run; INSERT/UPDATE/DELETE/TRUNCATE/ALTER/DROP require explicit approval
- No CASCADE operations without explicit approval

---

## Key References

| Document | Purpose |
|----------|---------|
| `_DOCS/BUSINESS.md` | Business strategy, market positioning, competitive landscape |
| `_DOCS/TODO.md` | Deferred work items — **write-only** (append when needed, never pre-read for context unless user explicitly asks) |
