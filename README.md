# 데일리 뉴스 브리핑

매일 아침 9시(KST)에 한국 주요 뉴스를 수집하고, Claude가 경제 흐름·사회 이슈·향후 전망을 분석해 보여주는 웹사이트입니다.

## 로컬 실행

```bash
npm install
npm run dev
```

`ANTHROPIC_API_KEY`가 없으면 AI 분석 자리에 테스트용 안내 문구가 표시됩니다. `.env.local`에 키를 넣으면 실제 분석이 생성됩니다.

브리핑을 수동으로 한 번 생성하려면:

```bash
curl http://localhost:3000/api/cron/refresh
```

## Vercel 배포 체크리스트

1. **Vercel 프로젝트 생성**: [vercel.com/new](https://vercel.com/new)에서 이 GitHub 저장소를 Import
2. **환경변수 등록** (Project → Settings → Environment Variables)
   - `ANTHROPIC_API_KEY` — [console.anthropic.com](https://console.anthropic.com)에서 발급
   - `CRON_SECRET` — 임의의 랜덤 문자열 (cron 엔드포인트 보호용). Vercel이 이 값을 자동으로 크론 요청의 `Authorization: Bearer <값>` 헤더에 실어 보냅니다.
3. **Vercel KV(또는 Upstash Redis) 스토리지 연결**: Project → Storage → Create Database → KV
   - 연결하면 `KV_REST_API_URL`, `KV_REST_API_TOKEN` 등이 자동으로 환경변수에 추가됩니다.
   - KV를 연결하지 않으면 서버리스 함수 인스턴스 간 데이터가 유지되지 않아 매번 "브리핑 없음" 상태로 보일 수 있습니다.
4. **배포 후 첫 데이터 생성**: 배포 URL + `/api/cron/refresh?secret=<CRON_SECRET>` 을 한 번 호출해 초기 데이터를 만드세요.
5. 이후로는 `vercel.json`에 설정된 cron이 매일 00:00 UTC(오전 9시 KST)에 자동으로 갱신합니다.
