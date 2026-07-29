import Link from "next/link";
import { listArchiveDates } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  const dates = await listArchiveDates();

  return (
    <main className="flex-1 w-full max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
      <header className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-extrabold tracking-tight text-primary">
          지난 브리핑
        </h1>
        <Link
          href="/"
          className="text-[13px] font-semibold text-secondary hover:text-accent transition-colors"
        >
          ← 오늘 브리핑 보기
        </Link>
      </header>

      {dates.length === 0 ? (
        <p className="text-sm text-secondary">
          아직 저장된 지난 브리핑이 없어요. 며칠 지나면 여기 쌓이기 시작합니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {dates.map((entry) => (
            <li key={entry.dateKey}>
              <Link
                href={`/archive/${entry.dateKey}`}
                className="block rounded-xl bg-card border border-border px-4 py-3.5 text-[14px] font-medium text-primary hover:border-accent transition-colors"
              >
                {entry.dateLabel}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
