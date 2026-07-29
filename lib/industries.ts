import type { Headline } from "./news";

export interface Industry {
  name: string;
  keywords: string[];
}

const INDUSTRIES: Industry[] = [
  {
    name: "반도체산업",
    keywords: [
      "반도체", "삼성전자", "SK하이닉스", "하이닉스", "파운드리", "메모리",
      "낸드", "D램", "디램", "TSMC", "웨이퍼", "HBM", "칩",
    ],
  },
  {
    name: "바이오산업",
    keywords: [
      "바이오", "제약", "신약", "임상", "헬스케어", "백신", "셀트리온",
      "삼성바이오로직스", "유한양행", "식약처", "FDA", "치료제",
    ],
  },
  {
    name: "유통소비재산업",
    keywords: [
      "유통", "편의점", "백화점", "이커머스", "마트", "소비재", "화장품",
      "식품", "프랜차이즈", "쿠팡", "이마트", "롯데", "홈쇼핑", "면세점",
    ],
  },
  {
    name: "자동차산업",
    keywords: [
      "자동차", "현대차", "기아", "전기차", "완성차", "자율주행", "모빌리티",
      "테슬라", "타이어",
    ],
  },
  {
    name: "금융산업",
    keywords: [
      "금융", "은행", "증권", "보험", "카드사", "금융당국", "금융위",
      "대출", "기준금리", "예금", "핀테크",
    ],
  },
  {
    name: "에너지·화학산업",
    keywords: [
      "에너지", "화학", "정유", "태양광", "배터리", "석유", "LNG", "원전",
      "수소", "2차전지",
    ],
  },
  {
    name: "건설·부동산산업",
    keywords: [
      "건설", "부동산", "아파트", "재건축", "재개발", "분양", "시공",
      "엔지니어링", "PF", "시행사", "미분양", "청약", "전세", "매매가",
    ],
  },
  {
    name: "제조업",
    keywords: [
      "제조업", "공장", "생산라인", "스마트팩토리", "뿌리산업", "설비투자",
      "산업단지", "조선", "중공업", "철강", "기계",
    ],
  },
];

export function classifyIndustries(
  headlines: Headline[]
): { industry: string; headlines: Headline[] }[] {
  const buckets = new Map<string, Headline[]>();

  for (const headline of headlines) {
    for (const industry of INDUSTRIES) {
      const matched = industry.keywords.some((kw) => headline.title.includes(kw));
      if (matched) {
        const list = buckets.get(industry.name) ?? [];
        if (list.length < 6 && !list.some((h) => h.title === headline.title)) {
          list.push(headline);
          buckets.set(industry.name, list);
        }
        break; // assign to first matching industry only
      }
    }
  }

  return INDUSTRIES.map((i) => ({
    industry: i.name,
    headlines: buckets.get(i.name) ?? [],
  })).filter((b) => b.headlines.length > 0);
}
