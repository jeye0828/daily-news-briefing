import Link from "next/link";
import type { Briefing } from "@/lib/store";
import type { Category, Headline } from "@/lib/news";

const CATEGORY_ORDER: Category[] = ["정치", "경제", "사회", "국제", "IT"];
const CATEGORY_ITEM_LIMIT = 6;

function groupByCategory(headlines: Headline[]) {
  const groups: Partial<Record<Category, Headline[]>> = {};
  for (const h of headlines) {
    if (!groups[h.category]) groups[h.category] = [];
    groups[h.category]!.push(h);
  }
  return groups;
}

function formatTime(pubDate: string) {
  if (!pubDate) return "";
  const d = new Date(pubDate);
  if (isNaN(d.getTime())) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function HeadlineRow({ h }: { h: Headline }) {
  return (
    <li>
      <a
        href={h.link}
        target="_blank"
        rel="noopener noreferrer"
        className="block rounded-xl px-3 py-2.5 -mx-3 transition-colors hover:bg-page"
      >
        <p className="text-[13.5px] leading-snug font-medium text-primary line-clamp-2">
          {h.title}
        </p>
        <p className="mt-1 text-[11.5px] text-tertiary">
          {h.source}
          {formatTime(h.pubDate) && ` · ${formatTime(h.pubDate)}`}
        </p>
      </a>
    </li>
  );
}

function NewsCard({ title, items }: { title: string; items: Headline[] }) {
  return (
    <div className="rounded-2xl bg-card border border-border p-4 sm:p-5 flex flex-col">
      <h3 className="text-[15px] font-bold text-primary mb-1 px-1">{title}</h3>
      <ul className="flex flex-col">
        {items.map((h, i) => (
          <HeadlineRow key={i} h={h} />
        ))}
      </ul>
    </div>
  );
}

function MarketBar({ markets }: { markets: Briefing["markets"] }) {
  if (markets.length === 0) return null;
  return (
    <div className="mb-8 flex flex-wrap gap-3">
      {markets.map((m) => {
        const up = m.change >= 0;
        return (
          <div
            key={m.label}
            className="rounded-xl bg-card border border-border px-4 py-2.5 flex items-center gap-2.5"
          >
            <span className="text-[13px] font-semibold text-secondary">{m.label}</span>
            <span className="text-[15px] font-bold text-primary">
              {m.price.toLocaleString("ko-KR", { maximumFractionDigits: 2 })}
            </span>
            <span
              className={`text-[13px] font-semibold ${up ? "text-red-500" : "text-blue-500"}`}
            >
              {up ? "▲" : "▼"} {Math.abs(m.changePercent).toFixed(2)}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function BriefingView({
  briefing,
  isArchive = false,
}: {
  briefing: Briefing;
  isArchive?: boolean;
}) {
  const groups = groupByCategory(briefing.headlines);

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-1.5">
          <span className="inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
            {briefing.dateLabel}
          </span>
          <h1 className="text-[26px] sm:text-3xl font-extrabold tracking-tight text-primary">
            데일리 뉴스 브리핑
          </h1>
        </div>
        <Link
          href={isArchive ? "/" : "/archive"}
          className="text-[13px] font-semibold text-secondary hover:text-accent transition-colors mt-1"
        >
          {isArchive ? "← 오늘 브리핑 보기" : "지난 브리핑 보기 →"}
        </Link>
      </header>

      <MarketBar markets={briefing.markets} />

      <section className="mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CATEGORY_ORDER.filter((c) => groups[c]?.length).map((category) => (
            <NewsCard
              key={category}
              title={category}
              items={groups[category]!.slice(0, CATEGORY_ITEM_LIMIT)}
            />
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-1.5">
          <span>🤖</span> AI 경제·사회 분석
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl bg-card border border-border p-5">
            <h3 className="text-xs font-bold text-accent mb-2">경제 흐름</h3>
            <p className="text-[13.5px] leading-relaxed text-primary">
              {briefing.analysis.economy}
            </p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-5">
            <h3 className="text-xs font-bold text-accent mb-2">사회 이슈</h3>
            <p className="text-[13.5px] leading-relaxed text-primary">
              {briefing.analysis.society}
            </p>
          </div>
          <div className="rounded-2xl bg-card border border-border p-5">
            <h3 className="text-xs font-bold text-accent mb-2">
              향후 전망 및 시사점
            </h3>
            <p className="text-[13.5px] leading-relaxed text-primary">
              {briefing.analysis.outlook}
            </p>
          </div>
        </div>
      </section>

      {briefing.trending.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-1.5">
            <span>🔥</span> 많이 다뤄진 이슈
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {briefing.trending.map((issue, i) => (
              <div
                key={i}
                className="rounded-2xl bg-card border border-border p-4 sm:p-5"
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="inline-flex items-center justify-center rounded-full bg-accent-soft text-accent text-[11px] font-bold w-5 h-5">
                    {i + 1}
                  </span>
                  <span className="text-[11px] font-semibold text-tertiary">
                    {issue.count}개 매체 보도
                  </span>
                </div>
                <p className="text-[13.5px] leading-snug font-semibold text-primary line-clamp-3 mb-2">
                  {issue.title}
                </p>
                <ul className="space-y-1">
                  {issue.items.slice(0, 3).map((h, j) => (
                    <li key={j}>
                      <a
                        href={h.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[11.5px] text-secondary hover:text-accent transition-colors"
                      >
                        {h.source}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {briefing.industryNews.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold text-primary mb-4 flex items-center gap-1.5">
            <span>🏭</span> 산업별 뉴스
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {briefing.industryNews.map(({ industry, headlines }) => (
              <NewsCard key={industry} title={industry} items={headlines} />
            ))}
          </div>
        </section>
      )}

      <footer className="text-xs text-tertiary text-center pt-4">
        마지막 갱신:{" "}
        {new Date(briefing.generatedAtUtc).toLocaleString("ko-KR", {
          timeZone: "Asia/Seoul",
        })}{" "}
        (KST)
      </footer>
    </main>
  );
}
