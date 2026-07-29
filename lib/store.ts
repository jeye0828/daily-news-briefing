import { unstable_cache, revalidateTag } from "next/cache";
import { collectHeadlines, type Headline } from "./news";
import { generateAnalysis, type Analysis } from "./summarize";
import { classifyIndustries } from "./industries";
import { collectMarketSnapshot, type MarketQuote } from "./markets";
import { rankTrendingIssues, type TrendingIssue } from "./trending";

export interface Briefing {
  dateKey: string;
  generatedAtUtc: string;
  dateLabel: string;
  headlines: Headline[];
  analysis: Analysis;
  industryNews: { industry: string; headlines: Headline[] }[];
  markets: MarketQuote[];
  trending: TrendingIssue[];
}

const ARCHIVE_LOOKBACK_DAYS = 30;

export function todayKeyKST(): string {
  // e.g. "2026-07-30"
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date());
}

function dateLabelFor(dateKey: string): string {
  // dateKey is a KST calendar date; construct at local noon to avoid TZ boundary issues
  const d = new Date(`${dateKey}T12:00:00+09:00`);
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(d);
}

async function buildBriefingForDate(dateKey: string): Promise<Briefing | null> {
  // Only "today" (KST) can ever be freshly generated. A dateKey that isn't
  // today and has no existing cache entry means that day simply has no
  // archived briefing (e.g. before this feature existed, or a day the site
  // was down) — we must not silently regenerate it with today's news.
  if (dateKey !== todayKeyKST()) {
    return null;
  }

  const [headlines, markets] = [await collectHeadlines(), await collectMarketSnapshot()];
  const analysis = await generateAnalysis(headlines);
  const industryNews = classifyIndustries(headlines);
  const trending = rankTrendingIssues(headlines);

  return {
    dateKey,
    generatedAtUtc: new Date().toISOString(),
    dateLabel: dateLabelFor(dateKey),
    headlines,
    analysis,
    industryNews,
    markets,
    trending,
  };
}

// Cached per date-key, indefinitely (revalidate: false), using Next.js's
// built-in Data Cache — no external database needed. Each date gets its
// own cache tag (`briefing:<dateKey>`) so that force-refreshing "today"
// can never accidentally invalidate — and thus wipe — an archived day.
function getCachedBriefingForDate(dateKey: string): Promise<Briefing | null> {
  const cached = unstable_cache(
    () => buildBriefingForDate(dateKey),
    ["daily-briefing-by-date", dateKey],
    { tags: [briefingTag(dateKey)], revalidate: false }
  );
  return cached();
}

function briefingTag(dateKey: string): string {
  return `briefing:${dateKey}`;
}

export async function getBriefingForDate(dateKey: string): Promise<Briefing | null> {
  try {
    // In dev, bypass the cache so repeated manual refreshes during testing
    // actually pick up code/data changes for "today" instead of returning
    // a stale same-day cache entry.
    if (process.env.NODE_ENV !== "production") {
      return await buildBriefingForDate(dateKey);
    }
    return await getCachedBriefingForDate(dateKey);
  } catch (err) {
    console.error("Failed to load briefing:", err);
    return null;
  }
}

export async function getLatestBriefing(): Promise<Briefing | null> {
  return getBriefingForDate(todayKeyKST());
}

export async function refreshBriefing(): Promise<Briefing | null> {
  const key = todayKeyKST();
  // Force today's entry to regenerate even if it was already cached earlier
  // today (e.g. right after a code change). { expire: 0 } expires
  // immediately instead of stale-while-revalidate, so this call gets fresh
  // data back synchronously. Only today's tag is touched — other dates are
  // untouched.
  revalidateTag(briefingTag(key), { expire: 0 });
  return getBriefingForDate(key);
}

export interface ArchiveEntry {
  dateKey: string;
  dateLabel: string;
}

export async function listArchiveDates(): Promise<ArchiveEntry[]> {
  const today = todayKeyKST();
  const candidates: string[] = [];
  for (let i = 0; i < ARCHIVE_LOOKBACK_DAYS; i++) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(d);
    if (key !== today) candidates.push(key);
  }

  const results = await Promise.all(
    candidates.map(async (key) => {
      const briefing = await getCachedBriefingForDate(key).catch(() => null);
      return briefing ? { dateKey: key, dateLabel: briefing.dateLabel } : null;
    })
  );

  return results.filter((r): r is ArchiveEntry => r !== null);
}
