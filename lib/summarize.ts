import OpenAI from "openai";
import type { Headline } from "./news";

export interface Analysis {
  economy: string;
  society: string;
  outlook: string;
}

const FALLBACK_ANALYSIS: Analysis = {
  economy:
    "(테스트 모드) OPENAI_API_KEY가 설정되지 않아 실제 AI 분석 대신 임시 문구를 표시합니다. Vercel 환경변수에 키를 등록하면 실제 경제 흐름 분석이 생성됩니다.",
  society:
    "(테스트 모드) 실제 배포 후에는 이 자리에 수집된 뉴스를 근거로 한 사회 이슈 분석이 표시됩니다.",
  outlook:
    "(테스트 모드) 향후 전망 및 시사점도 API 키 등록 후 자동으로 채워집니다.",
};

export async function generateAnalysis(headlines: Headline[]): Promise<Analysis> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return FALLBACK_ANALYSIS;
  }

  const client = new OpenAI({ apiKey });

  const headlineList = headlines
    .map((h) => `[${h.category}/${h.source}] ${h.title}`)
    .join("\n");

  const completion = await client.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: `아래는 오늘 수집된 한국 주요 뉴스 헤드라인 목록입니다.

${headlineList}

이 헤드라인들을 근거로 한국어로 실제 분석 글을 작성해주세요. 단순히 헤드라인을 나열하지 말고, 기사 제목들 사이의 흐름과 맥락을 엮어서 분석하세요. 반드시 아래 JSON 형식으로만 응답하세요 (다른 설명 없이 JSON만):

{
  "economy": "경제 흐름 분석 (금리, 환율, 증시, 주요 기업 동향 등 트렌드 중심, 3~5문장)",
  "society": "주요 사회 이슈 요약 (3~5문장)",
  "outlook": "향후 전망 및 시사점 (2~3문장, 짧고 명확하게)"
}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content || "";

  try {
    const parsed = JSON.parse(raw);
    return {
      economy: parsed.economy || FALLBACK_ANALYSIS.economy,
      society: parsed.society || FALLBACK_ANALYSIS.society,
      outlook: parsed.outlook || FALLBACK_ANALYSIS.outlook,
    };
  } catch (err) {
    console.error("Failed to parse OpenAI response as JSON:", err, raw);
    return FALLBACK_ANALYSIS;
  }
}
