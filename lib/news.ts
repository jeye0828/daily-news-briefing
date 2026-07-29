import Parser from "rss-parser";

export type Category = "정치" | "경제" | "사회" | "국제" | "IT";

export interface Headline {
  title: string;
  link: string;
  source: string;
  category: Category;
  pubDate: string;
}

const FEEDS: { url: string; source: string; category: Category }[] = [
  { url: "https://www.yna.co.kr/rss/politics.xml", source: "연합뉴스", category: "정치" },
  { url: "https://rss.donga.com/politics.xml", source: "동아일보", category: "정치" },
  { url: "https://www.yna.co.kr/rss/economy.xml", source: "연합뉴스", category: "경제" },
  { url: "https://rss.donga.com/economy.xml", source: "동아일보", category: "경제" },
  { url: "https://www.hani.co.kr/rss/economy/", source: "한겨레", category: "경제" },
  { url: "https://www.yna.co.kr/rss/society.xml", source: "연합뉴스", category: "사회" },
  { url: "https://www.hani.co.kr/rss/society/", source: "한겨레", category: "사회" },
  { url: "https://rss.donga.com/national.xml", source: "동아일보", category: "사회" },
  { url: "https://www.yna.co.kr/rss/international.xml", source: "연합뉴스", category: "국제" },
  { url: "https://rss.donga.com/international.xml", source: "동아일보", category: "국제" },
  { url: "https://www.hani.co.kr/rss/international/", source: "한겨레", category: "국제" },
  { url: "https://rss.etnews.com/Section901.xml", source: "전자신문", category: "IT" },
];

const parser = new Parser({
  requestOptions: {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; DailyNewsBriefing/1.0)" },
  },
});

async function fetchFeed(feed: (typeof FEEDS)[number]): Promise<Headline[]> {
  try {
    const result = await parser.parseURL(feed.url);
    return (result.items || []).slice(0, 12).map((item) => ({
      title: (item.title || "").trim(),
      link: item.link || "",
      source: feed.source,
      category: feed.category,
      pubDate: item.pubDate || item.isoDate || "",
    }));
  } catch (err) {
    console.error(`Failed to fetch feed ${feed.url}:`, err);
    return [];
  }
}

export async function collectHeadlines(): Promise<Headline[]> {
  const results = await Promise.all(FEEDS.map(fetchFeed));
  const all = results.flat().filter((h) => h.title && h.link);

  const seen = new Set<string>();
  const deduped = all.filter((h) => {
    const key = h.title.replace(/\s+/g, "");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort((a, b) => {
    const da = new Date(a.pubDate).getTime() || 0;
    const db = new Date(b.pubDate).getTime() || 0;
    return db - da;
  });

  const perCategoryLimit = 12;
  const counts: Record<string, number> = {};
  const limited = deduped.filter((h) => {
    counts[h.category] = (counts[h.category] || 0) + 1;
    return counts[h.category] <= perCategoryLimit;
  });

  return limited;
}
