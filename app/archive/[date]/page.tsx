import Link from "next/link";
import { getBriefingForDate } from "@/lib/store";
import BriefingView from "@/components/BriefingView";

export const dynamic = "force-dynamic";

export default async function ArchiveDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = await params;
  const briefing = await getBriefingForDate(date);

  if (!briefing) {
    return (
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md text-center space-y-3">
          <div className="text-4xl">🗂️</div>
          <h1 className="text-xl font-bold text-primary">
            이 날짜의 브리핑이 없어요
          </h1>
          <p className="text-sm text-secondary">
            아직 생성되지 않았거나, 사이트가 없었던 날짜예요.
          </p>
          <Link
            href="/archive"
            className="inline-block text-[13px] font-semibold text-accent"
          >
            ← 지난 브리핑 목록으로
          </Link>
        </div>
      </main>
    );
  }

  return <BriefingView briefing={briefing} isArchive />;
}
