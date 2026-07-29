import { NextRequest, NextResponse } from "next/server";
import { refreshBriefing } from "@/lib/store";

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
    const briefing = await refreshBriefing();
    if (!briefing) {
      return NextResponse.json({ error: "generation_failed" }, { status: 500 });
    }
    return NextResponse.json({
      ok: true,
      headlineCount: briefing.headlines.length,
      dateLabel: briefing.dateLabel,
    });
  } catch (err) {
    console.error("Cron refresh failed:", err);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
