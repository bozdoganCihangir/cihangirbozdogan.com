#!/usr/bin/env node
// Candidate fetcher for the /crypto page — run by `/refresh` (PART F).
//
// Does every mechanical step so the judge (the LLM) only makes editorial calls:
//   1. fetch every feed in `crypto.feeds` (RSS/Atom, Google News RSS, DeFiLlama hacks JSON)
//   2. window by kind (outlets: hours, primary/signal: days)
//   3. hard gates — `dropUrl`, `dropTitlePatterns`, and the `cryptoKeywords` gate for
//      `cryptoOnly` feeds (regulators, Reuters). Crypto-native outlets are NOT keyword
//      gated — their real stories often name only a protocol ("Aave", "Glamsterdam") —
//      so items with no crypto keyword are flagged `noCryptoKeyword` for the judge.
//      Everything gated is listed in `gatedOut` so a miss can be rescued.
//   4. flag `priceHeadline` (never drops — "HYPE surges 15% as ICE…" is real news
//      under a price headline; the judge picks a cleaner duplicate)
//   5. cluster near-duplicate coverage across feeds → `clusters[]`, ranked by how
//      many distinct sources covered the story (the main importance signal)
//
// Config is read from `crypto` in lib/sources.ts — the single source of truth.
// Keep one feed per line there; this script parses it.
//
// Usage: node scripts/fetch-crypto.mjs [--category tech] [--out <file>]   (default: stdout)
// Zero dependencies. Needs Node 18+ (global fetch).

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36";
const TIMEOUT_MS = 30_000;
const CONCURRENCY = 10;
const DESCRIPTION_MAX_CHARS = 600;
const HOUR_MS = 3_600_000;

// ── config ──────────────────────────────────────────────────────────────────

function stringArray(block, key) {
  const start = block.search(new RegExp(`^\\s*${key}:\\s*\\[`, "m"));
  if (start === -1) throw new Error(`crypto.${key} missing in lib/sources.ts`);
  const body = block.slice(block.indexOf("[", start) + 1, block.indexOf("],", start));
  // Each element is a double-quoted TS string literal — JSON-compatible.
  return [...body.matchAll(/"((?:[^"\\]|\\.)*)"/g)].map((m) => JSON.parse(`"${m[1]}"`));
}

async function readConfig(category) {
  const src = await readFile(path.join(ROOT, "lib/sources.ts"), "utf8");
  const catStart = src.indexOf(`id: "${category}"`);
  if (catStart === -1) throw new Error(`no category with id "${category}" in lib/sources.ts`);
  const nextCat = src.indexOf(": CategoryConfig = {", catStart);
  const catSrc = src.slice(catStart, nextCat === -1 ? undefined : nextCat);
  const start = catSrc.search(/^\s*crypto:\s*\{/m);
  if (start === -1) throw new Error(`category "${category}" has no \`crypto:\` block`);
  const block = catSrc.slice(start);

  const num = (key) => {
    const m = block.match(new RegExp(`\\b${key}:\\s*([\\d_]+)`));
    if (!m) throw new Error(`crypto.${key} missing in lib/sources.ts`);
    return Number(m[1].replace(/_/g, ""));
  };

  const feeds = [];
  const feedsStart = block.search(/^\s*feeds:\s*\[/m);
  const feedsSrc = block.slice(feedsStart, block.indexOf("\n    ],", feedsStart));
  for (const line of feedsSrc.split("\n")) {
    const field = (k) => line.match(new RegExp(`\\b${k}:\\s*"((?:[^"\\\\]|\\\\.)*)"`))?.[1];
    const name = field("name");
    if (!name) continue;
    feeds.push({
      name,
      url: field("url"),
      kind: field("kind"),
      format: field("format") ?? "rss",
      cryptoOnly: /\bcryptoOnly:\s*true/.test(line),
      dropUrl: field("dropUrl") ? new RegExp(JSON.parse(`"${field("dropUrl")}"`), "i") : null,
    });
  }
  if (feeds.length === 0) throw new Error("crypto.feeds is empty or unparseable");

  const rx = (list) => list.map((p) => new RegExp(p, "i"));
  return {
    outletLookbackHours: num("outletLookbackHours"),
    primaryLookbackDays: num("primaryLookbackDays"),
    minHackUsd: num("minHackUsd"),
    cryptoKeywords: rx(stringArray(block, "cryptoKeywords")),
    dropTitlePatterns: rx(stringArray(block, "dropTitlePatterns")),
    priceTitlePatterns: rx(stringArray(block, "priceTitlePatterns")),
    feeds,
  };
}

// ── parsing helpers ─────────────────────────────────────────────────────────

const NAMED = { amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ", rsquo: "’", lsquo: "‘",
  rdquo: "”", ldquo: "“", ndash: "–", mdash: "—", hellip: "…" };

export function decode(s) {
  return s.replace(/&(#x[\da-f]+|#\d+|[a-z]+);/gi, (all, e) => {
    if (e[0] === "#") {
      const cp = e[1].toLowerCase() === "x" ? parseInt(e.slice(2), 16) : Number(e.slice(1));
      return Number.isFinite(cp) ? String.fromCodePoint(cp) : all;
    }
    return NAMED[e.toLowerCase()] ?? all;
  });
}

/** CDATA must go first — a naive tag strip eats `<![CDATA[…]]>` whole. */
export function clean(s) {
  let t = (s ?? "").replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1");
  t = decode(t); // entity-escaped HTML in descriptions → real tags
  t = t.replace(/<[^>]+>/g, " ");
  return decode(t).replace(/\s+/g, " ").trim();
}

function tag(xml, names) {
  for (const n of names) {
    const m = xml.match(new RegExp(`<${n}(?:\\s[^>]*)?>([\\s\\S]*?)</${n}>`, "i"));
    if (m) return m[1];
  }
  return "";
}

/** RFC 822, ISO 8601, FCA's "Friday, October 30, 2026 - 09:00", or a <time datetime>. */
export function parseDate(raw, wholeItem = "") {
  const tries = [];
  const s = clean(raw);
  if (s) {
    tries.push(s);
    tries.push(s.replace(/^[A-Za-z]+,\s*/, "").replace(/\s+-\s+/, " ") + " UTC");
  }
  const dt = decode(wholeItem).match(/datetime="([^"]+)"/);
  if (dt) tries.push(dt[1]);
  for (const t of tries) {
    const ms = Date.parse(t);
    if (!Number.isNaN(ms)) return new Date(ms);
  }
  return null;
}

function itemLink(xml) {
  const plain = clean(tag(xml, ["link"]));
  if (plain) return plain;
  const alt = xml.match(/<link[^>]*rel="alternate"[^>]*href="([^"]+)"/i) ?? xml.match(/<link[^>]*href="([^"]+)"/i);
  return alt ? decode(alt[1]) : "";
}

function parseFeed(xml) {
  const entries = xml.match(/<item[\s>][\s\S]*?<\/item>|<entry[\s>][\s\S]*?<\/entry>/gi) ?? [];
  return entries.map((e) => ({
    title: clean(tag(e, ["title"])),
    url: itemLink(e),
    date: parseDate(tag(e, ["pubDate", "published", "dc:date", "updated"]), e),
    description: clean(tag(e, ["description", "summary", "content:encoded", "content"])).slice(0, DESCRIPTION_MAX_CHARS),
  }));
}

// ── fetching ────────────────────────────────────────────────────────────────

/** Some hosts (cftc.gov) 403 Node's fetch fingerprint but serve curl. */
async function curl(url) {
  const { stdout } = await execFileAsync(
    "curl",
    ["-sSL", "--fail", "-m", String(TIMEOUT_MS / 1000), "-A", UA, url],
    { maxBuffer: 64 * 1024 * 1024 },
  );
  return stdout;
}

async function get(url) {
  try {
    return await fetchText(url);
  } catch (err) {
    try {
      return await curl(url);
    } catch {
      throw err;
    }
  }
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, Accept: "application/rss+xml, application/xml, application/json, text/xml, */*" },
    redirect: "follow",
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}

async function fetchFeed(feed, cfg, now) {
  const windowMs = feed.kind === "outlet" ? cfg.outletLookbackHours * HOUR_MS : cfg.primaryLookbackDays * 24 * HOUR_MS;
  const cutoff = now - windowMs;
  const body = await get(feed.url);

  if (feed.format === "defillama-hacks") {
    const rows = JSON.parse(body);
    return {
      items: [],
      hacks: rows
        .filter((r) => r.date * 1000 >= cutoff && (r.amount ?? 0) >= cfg.minHackUsd)
        .sort((a, b) => b.amount - a.amount)
        .map((r) => ({
          name: r.name,
          amountUsd: r.amount,
          date: new Date(r.date * 1000).toISOString().slice(0, 10),
          technique: r.technique,
          classification: r.classification,
          chains: r.chain,
          description: (r.description ?? "").slice(0, DESCRIPTION_MAX_CHARS),
        })),
      parsed: rows.length,
    };
  }

  const parsed = parseFeed(body);
  if (parsed.length === 0) throw new Error("0 entries parsed (layout change or soft block)");
  const items = [];
  for (const it of parsed) {
    if (!it.date || it.date.getTime() < cutoff || it.date.getTime() > now + HOUR_MS) continue;
    if (feed.format === "google-news") {
      // "Headline - Publisher" → keep the publisher for provenance.
      const m = it.title.match(/^(.*)\s+-\s+([^-]+)$/);
      if (m) {
        it.title = m[1];
        it.publisher = m[2].trim();
      }
      it.description = ""; // GN descriptions only repeat the title
    }
    items.push(it);
  }
  return { items, parsed: parsed.length };
}

async function pool(list, n, fn) {
  const out = new Array(list.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, list.length) }, async () => {
      while (i < list.length) {
        const k = i++;
        out[k] = await fn(list[k]);
      }
    }),
  );
  return out;
}

// ── clustering ──────────────────────────────────────────────────────────────

const STOP = new Set(
  ("the a an and or of to in on for with by at from as is are was were be its it this that after over into amid " +
    "says said say new could would will may can how why what who about than more most after before up out not " +
    "crypto cryptocurrency report reports firm company")
    .split(" "),
);

export function tokens(title) {
  return new Set(
    title
      .toLowerCase()
      .replace(/[’']s\b/g, "")
      .replace(/\$?(\d+(?:\.\d+)?)\s*(b|bn|billion)\b/g, "$1b")
      .replace(/\$?(\d+(?:\.\d+)?)\s*(m|million)\b/g, "$1m")
      .split(/[^a-z0-9.$-]+/)
      .map((w) => w.replace(/^[.$-]+|[.-]+$/g, ""))
      .filter((w) => w.length >= 3 && !STOP.has(w)),
  );
}

/** Union-find over title token overlap. A heuristic hint for the judge, not a verdict. */
function cluster(candidates) {
  const parent = candidates.map((_, i) => i);
  const find = (i) => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  const toks = candidates.map((c) => tokens(c.title));
  for (let i = 0; i < candidates.length; i++) {
    for (let j = i + 1; j < candidates.length; j++) {
      let shared = 0;
      for (const t of toks[i]) if (toks[j].has(t)) shared++;
      const jaccard = shared / (toks[i].size + toks[j].size - shared || 1);
      if (shared >= 3 || (shared >= 2 && jaccard >= 0.3)) parent[find(i)] = find(j);
    }
  }
  const groups = new Map();
  candidates.forEach((c, i) => {
    const root = find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(c);
  });
  return [...groups.values()]
    .map((members) => {
      const sources = [...new Set(members.map((m) => m.source))];
      return { sources, size: members.length, members };
    })
    .sort((a, b) => b.sources.length - a.sources.length || b.size - a.size);
}

// ── main ────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const opt = (k, d) => (args.includes(k) ? args[args.indexOf(k) + 1] : d);
  const category = opt("--category", "tech");
  const outFile = opt("--out", null);

  const cfg = await readConfig(category);
  const now = Date.now();
  const failures = [];
  const gatedOut = [];
  const perFeed = {};
  let hacks = [];
  const signalTitles = [];
  const candidates = [];

  const results = await pool(cfg.feeds, CONCURRENCY, async (feed) => {
    try {
      return { feed, ...(await fetchFeed(feed, cfg, now)) };
    } catch (err) {
      failures.push({ feed: feed.name, url: feed.url, error: String(err.message ?? err) });
      return { feed, items: [], parsed: 0 };
    }
  });

  const seenUrls = new Set();
  for (const { feed, items, hacks: h, parsed } of results) {
    perFeed[feed.name] = { kind: feed.kind, parsed, inWindow: items.length + (h?.length ?? 0), kept: 0 };
    if (h) hacks = h;
    for (const it of items) {
      if (feed.kind === "signal") {
        signalTitles.push({ source: feed.name, publisher: it.publisher, title: it.title });
        continue;
      }
      const text = `${it.title} ${it.description}`;
      let reason = null;
      if (!it.title || !it.url) reason = "missing title or url";
      else if (feed.dropUrl?.test(it.url)) reason = "dropUrl";
      else if (cfg.dropTitlePatterns.some((r) => r.test(it.title))) reason = "dropTitlePattern";
      else if (feed.cryptoOnly && !cfg.cryptoKeywords.some((r) => r.test(text))) reason = "not crypto (cryptoOnly feed)";
      else if (seenUrls.has(it.url)) reason = "duplicate url";
      if (reason) {
        gatedOut.push({ source: feed.name, title: it.title, url: it.url, reason });
        continue;
      }
      seenUrls.add(it.url);
      perFeed[feed.name].kept++;
      candidates.push({
        source: feed.name,
        kind: feed.kind,
        ...(it.publisher ? { publisher: it.publisher } : {}),
        title: it.title,
        url: it.url,
        published: it.date.toISOString().slice(0, 16) + "Z",
        priceHeadline: cfg.priceTitlePatterns.some((r) => r.test(it.title)),
        ...(cfg.cryptoKeywords.some((r) => r.test(text)) ? {} : { noCryptoKeyword: true }),
        description: it.description,
      });
    }
  }

  // Signal titles (Google News policy query) join the clustering so a story covered
  // there gets the extra source count, but they are never candidates themselves.
  const signalAsMembers = signalTitles.map((s) => ({ ...s, signal: true }));
  const clusters = cluster([...candidates, ...signalAsMembers])
    .map((c, idx) => {
      const real = c.members.filter((m) => !m.signal);
      if (real.length === 0) return null;
      const id = `c${idx + 1}`;
      real.forEach((m) => (m.cluster = id));
      return {
        id,
        sourceCount: c.sources.length,
        sources: c.sources,
        primarySources: [...new Set(real.filter((m) => m.kind === "primary").map((m) => m.source))],
        items: real.length,
        sampleTitle: real[0].title,
      };
    })
    .filter(Boolean);

  // Order candidates by story importance (cluster rank), then recency.
  const rank = new Map(clusters.map((c, i) => [c.id, i]));
  candidates.sort((a, b) => rank.get(a.cluster) - rank.get(b.cluster) || b.published.localeCompare(a.published));

  const out = {
    generatedAt: new Date(now).toISOString(),
    window: { outletLookbackHours: cfg.outletLookbackHours, primaryLookbackDays: cfg.primaryLookbackDays },
    stats: {
      feeds: cfg.feeds.length,
      feedsOk: cfg.feeds.length - failures.length,
      candidates: candidates.length,
      gatedOut: gatedOut.length,
      clusters: clusters.length,
      hacks: hacks.length,
      perFeed,
    },
    failures,
    hacks,
    clusters,
    candidates,
    gatedOut,
  };

  const json = JSON.stringify(out, null, 1);
  if (outFile) await writeFile(outFile, json);
  else process.stdout.write(json);

  const multi = clusters.filter((c) => c.sourceCount >= 2).length;
  process.stderr.write(
    `crypto: ${out.stats.feedsOk}/${out.stats.feeds} feeds ok · ${candidates.length} candidates in ${clusters.length} stories ` +
      `(${multi} covered by 2+ sources) · ${gatedOut.length} gated · ${hacks.length} hacks ≥ $${cfg.minHackUsd.toLocaleString()}\n`,
  );
  for (const f of failures) process.stderr.write(`  FAIL ${f.feed}: ${f.error}\n`);
  if (failures.length === cfg.feeds.length) process.exit(1);
}

main().catch((err) => {
  process.stderr.write(`fetch-crypto: ${err.stack ?? err}\n`);
  process.exit(1);
});
