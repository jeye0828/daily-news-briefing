import { NextRequest, NextResponse } from "next/server";
import { collectHeadlines } from "@/lib/news";
import { generateAnalysis } from "@/lib/summarize";
import { saveBriefing } from "@/lib/store";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function isAuthorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true; // no secret configured yet (local/dev)

  const authHeader = req.headers.get("authorization");
  if (authHeader === `Bearer ${secret}`) return true;

  const querySecret = req.nextUrl.searchParams.get("secret");
  if (querySecret === secret) return true;

  return false;
}

export async function GET(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
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

    const briefing = {
      generatedAtUtc: now.toISOString(),
      dateLabel,
      headlines,
      analysis,
    };

    await saveBriefing(briefing);

    return NextResponse.json({ ok: true, headlineCount: headlines.length, dateLabel });
  } catch (err) {
    console.error("Cron refresh failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
