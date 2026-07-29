import { getLatestBriefing } from "@/lib/store";
import type { Category, Headline } from "@/lib/news";

export const dynamic = "force-dynamic";

const CATEGORY_ORDER: Category[] = ["정치", "경제", "사회", "국제", "IT"];

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

export default async function Home() {
  const briefing = await getLatestBriefing();

  if (!briefing) {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-3">
          <div className="text-4xl">📰</div>
          <h1 className="text-xl font-semibold">아직 첫 브리핑이 없어요</h1>
          <p className="text-sm text-neutral-500">
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
    <main className="flex-1 w-full max-w-3xl mx-auto px-4 py-10 sm:py-14">
      <header className="mb-10 space-y-1">
        <p className="text-sm text-neutral-500">{briefing.dateLabel}</p>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
          데일리 뉴스 브리핑
        </h1>
      </header>

      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🗞️</span> 오늘의 주요 뉴스
        </h2>
        <div className="space-y-6">
          {CATEGORY_ORDER.filter((c) => groups[c]?.length).map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-500 mb-2">
                {category}
              </h3>
              <ul className="space-y-2">
                {groups[category]!.map((h, i) => (
                  <li
                    key={`${category}-${i}`}
                    className="border-b border-neutral-200 dark:border-neutral-800 pb-2"
                  >
                    <a
                      href={h.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm sm:text-base font-medium hover:underline"
                    >
                      {h.title}
                    </a>
                    <div className="text-xs text-neutral-500 mt-1">
                      {h.source}
                      {formatTime(h.pubDate) && ` · ${formatTime(h.pubDate)}`}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <span>🤖</span> AI 경제·사회 분석
        </h2>
        <div className="space-y-5 rounded-xl border border-neutral-200 dark:border-neutral-800 p-5 bg-neutral-50 dark:bg-neutral-900/40">
          <div>
            <h3 className="text-sm font-semibold text-neutral-500 mb-1">
              경제 흐름
            </h3>
            <p className="text-sm sm:text-base leading-relaxed">
              {briefing.analysis.economy}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-500 mb-1">
              사회 이슈
            </h3>
            <p className="text-sm sm:text-base leading-relaxed">
              {briefing.analysis.society}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-neutral-500 mb-1">
              향후 전망 및 시사점
            </h3>
            <p className="text-sm sm:text-base leading-relaxed">
              {briefing.analysis.outlook}
            </p>
          </div>
        </div>
      </section>

      <footer className="text-xs text-neutral-400 text-center pt-4">
        마지막 갱신:{" "}
        {new Date(briefing.generatedAtUtc).toLocaleString("ko-KR", {
          timeZone: "Asia/Seoul",
        })}{" "}
        (KST)
      </footer>
    </main>
  );
}
