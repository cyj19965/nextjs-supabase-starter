# 코딩 스타일 가이드

- TypeScript strict 유지, `any` 금지 (외부 응답 파싱 등 불가피하면 경계에서만 좁은 범위로)
- 에러를 삼키지 않는다: 빈 catch, 의미 없는 fallback 금지 — 실패는 보이게
- 주석은 코드로 알 수 없는 제약/이유(why)만, 무엇(what) 반복 금지
- 네이밍: 컴포넌트 PascalCase, 파일 kebab-case(`place-card.tsx`), 함수/변수 camelCase
- 식별자·커밋 메시지는 영어, UI 문자열은 한국어
- 데이터 접근은 `lib/`에 격리 — 페이지/컴포넌트에서 Supabase 직접 호출 최소화
- 검증 습관: 수정 후 `npm run build` 통과 확인, 실행해보지 않은 코드를 "동작한다"고 보고하지 않는다
- Prettier로 포맷 (PostToolUse 훅이 자동 실행)
