import { unstable_cache, revalidateTag } from "next/cache";
import { collectHeadlines, type Headline } from "./news";
import { generateAnalysis, type Analysis } from "./summarize";

export interface Briefing {
  generatedAtUtc: string;
  dateLabel: string;
  headlines: Headline[];
  analysis: Analysis;
}

const TAG = "daily-briefing";

async function buildBriefing(): Promise<Briefing> {
  const headlines = await collectHeadlines();
  const analysis = await generateAnalysis(headlines);

  const now = new Date();
  const dateLabel = new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  }).format(now);

  return {
    generatedAtUtc: now.toISOString(),
    dateLabel,
    headlines,
    analysis,
  };
}

// Cached indefinitely (revalidate: false) using Next.js's built-in Data Cache —
// no external database needed. Only regenerates when revalidateTag(TAG) is called.
const getCachedBriefing = unstable_cache(buildBriefing, ["daily-briefing"], {
  tags: [TAG],
  revalidate: false,
});

export async function getLatestBriefing(): Promise<Briefing | null> {
  try {
    return await getCachedBriefing();
  } catch (err) {
    console.error("Failed to load briefing:", err);
    return null;
  }
}

export async function refreshBriefing(): Promise<Briefing> {
  // { expire: 0 } forces immediate expiration so this call gets freshly
  // regenerated data right away, instead of stale-while-revalidate semantics.
  revalidateTag(TAG, { expire: 0 });
  return getCachedBriefing();
}
