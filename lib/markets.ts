export interface MarketQuote {
  label: string;
  price: number;
  change: number;
  changePercent: number;
}

async function fetchQuote(symbol: string, label: string): Promise<MarketQuote | null> {
  try {
    const res = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=5d&interval=1d`,
      {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; DailyNewsBriefing/1.0)" },
        cache: "no-store",
      }
    );
    if (!res.ok) return null;

    const data = await res.json();
    const meta = data?.chart?.result?.[0]?.meta;
    if (!meta || typeof meta.regularMarketPrice !== "number") return null;

    const price = meta.regularMarketPrice;
    const prevClose = meta.chartPreviousClose ?? meta.previousClose ?? price;
    const change = price - prevClose;
    const changePercent = prevClose ? (change / prevClose) * 100 : 0;

    return { label, price, change, changePercent };
  } catch (err) {
    console.error(`Failed to fetch market quote ${symbol}:`, err);
    return null;
  }
}

export async function collectMarketSnapshot(): Promise<MarketQuote[]> {
  const [kospi, usdKrw] = await Promise.all([
    fetchQuote("^KS11", "코스피"),
    fetchQuote("KRW=X", "원/달러"),
  ]);
  return [kospi, usdKrw].filter((q): q is MarketQuote => q !== null);
}
