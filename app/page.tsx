import { getLatestBriefing } from "@/lib/store";
import type { Category, Headline } from "@/lib/news";

export const dynamic = "force-dynamic";

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

export default async function Home() {
  const briefing = await getLatestBriefing();

  if (!briefing) {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-3">
          <div className="text-4xl">📰</div>
          <h1 className="text-xl font-bold text-primary">
            아직 첫 브리핑이 없어요
          </h1>
          <p className="text-sm text-secondary">
            매일 아침 9시(KST)에 자동으로 뉴스와 AI 분석이 생성됩니다.
            <br />
            지금 바로 보고 싶다면 <code>/api/cron/refresh</code> 를 한 번 호출해보세요.
          </p>
        </div>
      </main>
    );
  }

  const groups = groupByCategory(briefing.headlines);

  return (
    <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="mb-8 space-y-1.5">
        <span className="inline-block rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
          {briefing.dateLabel}
        </span>
        <h1 className="text-[26px] sm:text-3xl font-extrabold tracking-tight text-primary">
          데일리 뉴스 브리핑
        </h1>
      </header>

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
