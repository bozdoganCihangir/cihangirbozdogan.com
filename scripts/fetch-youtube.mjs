#!/usr/bin/env node
// Candidate fetcher for the /youtube page — run by `/refresh` (PART E).
//
// YouTube retired its RSS feeds (`/feeds/videos.xml` 404s since 2026), so this
// scrapes each channel's /videos tab instead. That page carries ~30 recent
// uploads with duration, relative age and views, and excludes Shorts. Every
// video that survives the coarse window + duration filter is then enriched via
// the public `youtubei/v1/next` endpoint (no API key) for its exact publish
// date and full description.
//
// The roster and limits are read from `youtube` in lib/sources.ts — the single
// source of truth. Keep one channel per line there; this script parses it.
//
// Usage: node scripts/fetch-youtube.mjs [--category tech] [--out <file>]   (default: stdout)
// Zero dependencies. Needs Node 18+ (global fetch).

import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0 Safari/537.36";
// Without these, EU/UK egress 302s to consent.youtube.com.
const COOKIE = "CONSENT=YES+cb; SOCS=CAI";
const CLIENT = { clientName: "WEB", clientVersion: "2.20250925.01.00", hl: "en", gl: "US" };
const CHANNEL_CONCURRENCY = 6;
const VIDEO_CONCURRENCY = 8;
const DESCRIPTION_MAX_CHARS = 1500;
// One /videos page holds ~30 uploads; busy channels need more to cover the window.
const MAX_PAGES_PER_CHANNEL = 4;
const DAY_MS = 86_400_000;

// ── config ──────────────────────────────────────────────────────────────────

async function readConfig(category) {
  const src = await readFile(path.join(ROOT, "lib/sources.ts"), "utf8");
  // Scope to the requested CategoryConfig — each category carries its own roster.
  const catStart = src.indexOf(`id: "${category}"`);
  if (catStart === -1) throw new Error(`no category with id "${category}" in lib/sources.ts`);
  const nextCat = src.indexOf(": CategoryConfig = {", catStart);
  const catSrc = src.slice(catStart, nextCat === -1 ? undefined : nextCat);
  const start = catSrc.search(/^\s*youtube:\s*\{/m);
  if (start === -1) throw new Error(`category "${category}" has no \`youtube:\` block`);
  const block = catSrc.slice(start);

  const num = (key) => {
    const m = block.match(new RegExp(`\\b${key}:\\s*(\\d+)`));
    if (!m) throw new Error(`youtube.${key} missing in lib/sources.ts`);
    return Number(m[1]);
  };

  const channels = [];
  const entry =
    /\{\s*name:\s*"([^"]+)",\s*channelId:\s*"(UC[\w-]{22})",\s*url:\s*"([^"]+)",\s*group:\s*"(\w+)"(?:,\s*lang:\s*"(\w+)")?\s*\}/g;
  // Stop at the end of the channels array so later config can't leak in.
  const channelsStart = block.indexOf("channels:");
  const channelsSrc = block.slice(channelsStart, block.indexOf("]", channelsStart));
  for (const m of channelsSrc.matchAll(entry)) {
    channels.push({ name: m[1], channelId: m[2], url: m[3], group: m[4], lang: m[5] ?? "en" });
  }
  if (channels.length === 0) throw new Error("youtube.channels is empty or unparseable");

  return {
    lookbackDays: num("lookbackDays"),
    hardMaxMinutes: num("hardMaxMinutes"),
    channels,
  };
}

// ── parsing helpers ─────────────────────────────────────────────────────────

/** "5:41" → 341, "1:02:03" → 3723, anything else → null (live, upcoming, premiere). */
export function parseDuration(text) {
  if (!/^\d+(:\d{2}){1,2}$/.test(text ?? "")) return null;
  return text.split(":").reduce((acc, part) => acc * 60 + Number(part), 0);
}

/** "3 days ago" / "Streamed 2 weeks ago" → upper-bound age in days, or null. */
export function parseRelativeAgeDays(text) {
  const m = (text ?? "").match(/(\d+)\s+(second|minute|hour|day|week|month|year)s?\s+ago/i);
  if (!m) return null;
  const n = Number(m[1]);
  // YouTube floors: "2 weeks ago" covers 14–20 days, so use the bucket's upper edge.
  const upper = { second: 0, minute: 0, hour: 1, day: n, week: n * 7 + 6, month: n * 31 + 30, year: 366 * n };
  return upper[m[2].toLowerCase()];
}

/** "1.2m" / "950k" / "12,345" / "No views" → number. */
export function parseViews(text) {
  const m = (text ?? "").replace(/,/g, "").match(/([\d.]+)\s*([kmb])?/i);
  if (!m) return 0;
  const mult = { k: 1e3, m: 1e6, b: 1e9 }[(m[2] ?? "").toLowerCase()] ?? 1;
  return Math.round(Number(m[1]) * mult);
}

/** "Sep 25, 2026" / "September 25, 2026" (optionally prefixed "Premiered" /
    "Streamed live on") → "2026-09-25". */
export function parseDateText(text) {
  const m = (text ?? "").match(/([A-Z][a-z]{2,8}) (\d{1,2}), (\d{4})/);
  if (!m) return null;
  const d = new Date(`${m[1]} ${m[2]}, ${m[3]} 00:00:00 UTC`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

function extractInitialData(html) {
  const m = html.match(/var ytInitialData = (\{.*?\});<\/script>/s);
  if (!m) throw new Error("ytInitialData not found (consent wall or layout change)");
  return JSON.parse(m[1]);
}

function collect(node, key, out = []) {
  if (Array.isArray(node)) node.forEach((n) => collect(n, key, out));
  else if (node && typeof node === "object") {
    if (key in node) out.push(node[key]);
    else Object.values(node).forEach((n) => collect(n, key, out));
  }
  return out;
}

/** Channel /videos tab → [{ videoId, title, durationSeconds, ageDays, views }]. */
export function parseChannelVideos(data) {
  const videos = [];
  for (const l of collect(data, "lockupViewModel")) {
    if (l.contentType !== "LOCKUP_CONTENT_TYPE_VIDEO") continue;
    const meta = l.metadata?.lockupMetadataViewModel;
    const parts = (meta?.metadata?.contentMetadataViewModel?.metadataRows ?? []).flatMap(
      (r) => r.metadataParts ?? [],
    );
    // Display text is abbreviated ("1d ago", "1M"); the accessibility label is
    // spelled out ("1 day ago", "1 million views"). Age from label, views from text.
    const texts = parts.flatMap((p) => [p.accessibilityLabel ?? "", p.text?.content ?? ""]);
    const badge = collect(l.contentImage, "thumbnailBadgeViewModel")[0]?.text;
    videos.push({
      videoId: l.contentId,
      title: meta?.title?.content ?? "",
      durationSeconds: parseDuration(badge),
      ageDays: texts.map(parseRelativeAgeDays).find((d) => d !== null) ?? null,
      views: parseViews(parts.find((p) => /view/i.test(p.accessibilityLabel ?? ""))?.text?.content),
    });
  }
  // Pre-2026 layout fallback.
  for (const v of collect(data, "videoRenderer")) {
    videos.push({
      videoId: v.videoId,
      title: v.title?.runs?.map((r) => r.text).join("") ?? "",
      durationSeconds: parseDuration(v.lengthText?.simpleText),
      ageDays: parseRelativeAgeDays(v.publishedTimeText?.simpleText),
      views: parseViews(v.viewCountText?.simpleText),
    });
  }
  return videos;
}

/** `youtubei/v1/next` response → { publishedDate, description }. */
export function parseNextResponse(data) {
  const primary = collect(data, "videoPrimaryInfoRenderer")[0];
  const secondary = collect(data, "videoSecondaryInfoRenderer")[0];
  const dateText = primary?.dateText?.simpleText ?? "";
  const description =
    secondary?.attributedDescription?.content ??
    secondary?.description?.runs?.map((r) => r.text).join("") ??
    "";
  return { publishedDate: parseDateText(dateText), description };
}

function median(nums) {
  if (nums.length === 0) return 0;
  const s = [...nums].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
}

// ── network ─────────────────────────────────────────────────────────────────

async function withRetry(fn, attempts = 3) {
  let last;
  for (let i = 0; i < attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      last = err;
      await new Promise((r) => setTimeout(r, 1000 * (i + 1)));
    }
  }
  throw last;
}

/** Token for the next page of a /videos grid, or null on the last page. */
export function continuationToken(data) {
  return (
    collect(data, "continuationItemRenderer")[0]?.continuationEndpoint?.continuationCommand?.token ??
    null
  );
}

async function fetchChannelPage(channel, token) {
  if (!token) {
    const res = await fetch(`https://www.youtube.com/channel/${channel.channelId}/videos`, {
      headers: { "User-Agent": UA, Cookie: COOKIE, "Accept-Language": "en-US,en;q=0.9" },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return extractInitialData(await res.text());
  }
  const res = await fetch("https://www.youtube.com/youtubei/v1/browse?prettyPrint=false", {
    method: "POST",
    headers: { "User-Agent": UA, Cookie: COOKIE, "Content-Type": "application/json" },
    body: JSON.stringify({ continuation: token, context: { client: CLIENT } }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} (page 2+)`);
  return res.json();
}

/** Pages through /videos until the oldest upload falls outside the window. */
async function fetchChannel(channel, lookbackDays) {
  const videos = [];
  let token = null;
  for (let page = 0; page < MAX_PAGES_PER_CHANNEL; page++) {
    const data = await withRetry(() => fetchChannelPage(channel, token));
    const batch = parseChannelVideos(data);
    videos.push(...batch);
    token = continuationToken(data);
    const oldest = batch.at(-1)?.ageDays;
    if (!token || batch.length === 0 || oldest === null || oldest > lookbackDays + 6) break;
  }
  return videos;
}

async function fetchVideoDetails(videoId) {
  const res = await fetch("https://www.youtube.com/youtubei/v1/next?prettyPrint=false", {
    method: "POST",
    headers: { "User-Agent": UA, Cookie: COOKIE, "Content-Type": "application/json" },
    body: JSON.stringify({ videoId, context: { client: CLIENT } }),
    signal: AbortSignal.timeout(20_000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return parseNextResponse(await res.json());
}

async function pool(items, size, worker) {
  const results = new Array(items.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(size, items.length) }, async () => {
      while (next < items.length) {
        const i = next++;
        results[i] = await worker(items[i], i);
      }
    }),
  );
  return results;
}

// ── main ────────────────────────────────────────────────────────────────────

async function main() {
  const arg = (name) => {
    const i = process.argv.indexOf(name);
    return i !== -1 ? process.argv[i + 1] : null;
  };
  const outPath = arg("--out");
  const category = arg("--category") ?? "tech";

  const { lookbackDays, hardMaxMinutes, channels } = await readConfig(category);
  const now = Date.now();
  const cutoff = new Date(now - lookbackDays * DAY_MS).toISOString().slice(0, 10);
  const failures = [];
  const skipped = { tooLong: 0, noDuration: 0, tooOld: 0 };

  // 1. Coarse pass: channel pages → recent, short-enough uploads.
  const perChannel = await pool(channels, CHANNEL_CONCURRENCY, async (channel) => {
    try {
      const videos = await fetchChannel(channel, lookbackDays);
      // An empty grid usually means a wrong/squatted channel ID, not a quiet channel.
      if (videos.length === 0) throw new Error("0 videos parsed — check the channelId");
      const unique = [...new Map(videos.map((v) => [v.videoId, v])).values()];
      const medianViews = median(unique.map((v) => v.views));
      const recent = [];
      for (const v of unique) {
        if (v.ageDays === null || v.ageDays > lookbackDays + 6) { skipped.tooOld++; continue; }
        if (v.durationSeconds === null) { skipped.noDuration++; continue; }
        if (v.durationSeconds > hardMaxMinutes * 60) { skipped.tooLong++; continue; }
        recent.push({ ...v, channel, channelMedianViews: medianViews });
      }
      return recent;
    } catch (err) {
      failures.push({ channel: channel.name, stage: "channel", error: String(err.message ?? err) });
      return [];
    }
  });

  // 2. Exact pass: publish date + description per video.
  const coarse = perChannel.flat();
  const enriched = await pool(coarse, VIDEO_CONCURRENCY, async (v) => {
    try {
      const d = await withRetry(() => fetchVideoDetails(v.videoId));
      return { ...v, ...d };
    } catch (err) {
      failures.push({ channel: v.channel.name, stage: "video", videoId: v.videoId, error: String(err.message ?? err) });
      return null;
    }
  });

  const candidates = [];
  for (const v of enriched) {
    if (!v) continue;
    // No exact date → fall back to the relative age (an upper bound, so this
    // only ever errs towards dropping) and surface it in the report.
    if (!v.publishedDate) {
      failures.push({ channel: v.channel.name, stage: "date", videoId: v.videoId, error: "no exact publish date; used relative age" });
    }
    const inWindow = v.publishedDate ? v.publishedDate >= cutoff : v.ageDays <= lookbackDays;
    if (!inWindow) { skipped.tooOld++; continue; }
    candidates.push({
      videoId: v.videoId,
      url: `https://www.youtube.com/watch?v=${v.videoId}`,
      channel: v.channel.name,
      channelId: v.channel.channelId,
      group: v.channel.group,
      lang: v.channel.lang,
      title: v.title,
      description: v.description.slice(0, DESCRIPTION_MAX_CHARS),
      durationMinutes: Math.round((v.durationSeconds / 60) * 10) / 10,
      publishedDate: v.publishedDate,
      views: v.views,
      channelMedianViews: v.channelMedianViews,
    });
  }
  candidates.sort((a, b) => (b.publishedDate ?? "").localeCompare(a.publishedDate ?? ""));

  const result = {
    fetched_at: new Date(now).toISOString(),
    window: { lookbackDays, cutoff, hardMaxMinutes },
    stats: {
      channels: channels.length,
      channelsOk: channels.length - new Set(failures.filter((f) => f.stage === "channel").map((f) => f.channel)).size,
      candidates: candidates.length,
      skipped,
    },
    failures,
    candidates,
  };

  const json = JSON.stringify(result, null, 2);
  if (outPath) await writeFile(outPath, json);
  else process.stdout.write(json + "\n");
  process.stderr.write(
    `youtube: ${result.stats.channelsOk}/${channels.length} channels ok, ${candidates.length} candidates, ` +
      `${failures.length} failures, skipped ${JSON.stringify(skipped)}\n`,
  );
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    process.stderr.write(`fetch-youtube: ${err.stack ?? err}\n`);
    process.exit(1);
  });
}
