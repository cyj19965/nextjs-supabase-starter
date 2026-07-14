---
description: 배포 전 체크리스트 — 빌드, 시크릿, RLS, 환경 변수 점검
---

배포 전 점검을 수행하고 결과를 체크리스트로 보고해줘.

1. **빌드**: `npm run build` 통과 여부
2. **시크릿 노출**: `.env.local`이 git에 추적되지 않는지 (`git ls-files | grep env`), 소스에 하드코딩된 키(`sb_secret_`, `service_role`)가 없는지 검색
3. **RLS**: `supabase/migrations/`의 모든 테이블에 `enable row level security`가 있는지
4. **환경 변수**: 배포 대상(Vercel 등)에 `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`가 등록돼 있는지 확인 안내
5. **디버그 잔재**: console.log, 주석 처리된 코드 덩어리
6. **커밋 상태**: 커밋 안 된 변경사항

각 항목을 ✅/❌로 표시하고, ❌는 위치와 수정 방법을 제시해. 실패 항목이 있으면 "배포 전 수정 필요"로 결론 내려줘.
