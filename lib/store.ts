import fs from "fs";
import path from "path";
import type { Headline } from "./news";
import type { Analysis } from "./summarize";

export interface Briefing {
  generatedAtUtc: string;
  dateLabel: string;
  headlines: Headline[];
  analysis: Analysis;
}

const KEY = "daily-news-briefing:latest";
const LOCAL_PATH = path.join(process.cwd(), ".data", "latest.json");

function hasKv() {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function saveBriefing(briefing: Briefing): Promise<void> {
  if (hasKv()) {
    const { kv } = await import("@vercel/kv");
    await kv.set(KEY, briefing);
    return;
  }
  fs.mkdirSync(path.dirname(LOCAL_PATH), { recursive: true });
  fs.writeFileSync(LOCAL_PATH, JSON.stringify(briefing, null, 2), "utf-8");
}

export async function getLatestBriefing(): Promise<Briefing | null> {
  if (hasKv()) {
    const { kv } = await import("@vercel/kv");
    const data = await kv.get<Briefing>(KEY);
    return data ?? null;
  }
  try {
    const raw = fs.readFileSync(LOCAL_PATH, "utf-8");
    return JSON.parse(raw) as Briefing;
  } catch {
    return null;
  }
}
