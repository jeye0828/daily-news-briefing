import type { Headline } from "./news";

export interface TrendingIssue {
  title: string;
  count: number;
  items: Headline[];
}

// Korean headlines vary a lot in spacing/particles across outlets
// ("단일종목레버리지" vs "단일종목 레버리지", "당국" vs "금융당국"), so
// word-token overlap is too brittle. Character bigrams over the fully
// stripped (whitespace/punctuation-free) string are far more robust to
// these surface-level differences while still separating unrelated stories.
function normalizeForCompare(title: string): string {
  return title
    .replace(/\[[^\]]*\]/g, "")
    .replace(/\([^)]*\)/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, "");
}

function bigramSet(s: string): Set<string> {
  const grams = new Set<string>();
  for (let i = 0; i < s.length - 1; i++) grams.add(s.slice(i, i + 2));
  return grams;
}

function overlapScore(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 || b.size === 0) return 0;
  let shared = 0;
  for (const g of a) if (b.has(g)) shared++;
  return shared / Math.min(a.size, b.size);
}

const SIMILARITY_THRESHOLD = 0.45;

export function rankTrendingIssues(
  headlines: Headline[],
  limit = 6
): TrendingIssue[] {
  const clusters: { grams: Set<string>; items: Headline[] }[] = [];

  for (const headline of headlines) {
    const normalized = normalizeForCompare(headline.title);
    if (normalized.length < 4) continue;
    const grams = bigramSet(normalized);

    let bestCluster: (typeof clusters)[number] | null = null;
    let bestScore = 0;

    for (const cluster of clusters) {
      const score = overlapScore(grams, cluster.grams);
      if (score > bestScore) {
        bestScore = score;
        bestCluster = cluster;
      }
    }

    if (bestCluster && bestScore >= SIMILARITY_THRESHOLD) {
      bestCluster.items.push(headline);
      // Keep growing the cluster's gram set (union) so later, more loosely
      // related headlines in the same story can still match.
      for (const g of grams) bestCluster.grams.add(g);
    } else {
      clusters.push({ grams, items: [headline] });
    }
  }

  return clusters
    .filter((c) => c.items.length >= 2)
    .sort((a, b) => b.items.length - a.items.length)
    .slice(0, limit)
    .map((c) => ({
      title: c.items[0].title,
      count: c.items.length,
      items: c.items,
    }));
}
