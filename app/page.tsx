import { getLatestBriefing } from "@/lib/store";
import BriefingView from "@/components/BriefingView";

export const dynamic = "force-dynamic";

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

  return <BriefingView briefing={briefing} />;
}
