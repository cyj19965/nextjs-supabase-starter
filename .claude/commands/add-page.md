---
description: 새 라우트 페이지를 App Router 컨벤션에 맞게 생성
argument-hint: "[경로 예: places/new]"
---

새 페이지를 추가해줘. 경로: $1

1. 기존 `app/` 하위 페이지 하나를 읽고 이 프로젝트의 컨벤션(서버 컴포넌트 우선, 스타일링 방식)을 파악해
2. `app/$1/page.tsx`를 생성해 — 인증이 필요한 페이지면 기존 protected 패턴을 따라 Supabase 세션 확인을 포함해
3. 필요하면 layout.tsx도 함께 생성해
4. `npm run build`로 컴파일 에러가 없는지 확인하고 결과를 보고해
