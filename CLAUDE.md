# 오늘의 뜨개 (My Knitting Counter)

Next.js 15 + Supabase(Auth/Postgres/RLS) 기반의 뜨개질 단수 카운터·진행률 트래커.

## Project Context

- PRD 문서: @docs/PRD.md
- 개발 로드맵: @docs/ROADMAP.md
- Next.js 규칙: @docs/next-js.md
- Supabase 가이드: @docs/supabase.md
- 코딩 스타일: @docs/coding-style.md

## 폴더 구조

- `app/` — 라우트 (App Router, 서버 컴포넌트 우선)
- `components/` — 재사용 UI (shadcn/ui 기반)
- `lib/supabase/` — Supabase 클라이언트 (server/client 구분, 템플릿 제공)
- `supabase/migrations/` — 스키마 SQL (RLS 포함)
- `docs/` — 프로젝트 문서

## 작업 규칙

- 기능 범위는 PRD, 구현 순서는 ROADMAP의 Phase를 따른다 — Phase 1 완료 전 Phase 2 착수 금지
- 테이블 생성/변경 시 RLS 정책을 반드시 함께 작성하고 rls-checker 에이전트로 검증한다
- 한 번에 한 기능씩, 기능마다 커밋한다
- `.env.local`은 편집하지 않는다 (훅이 차단 — 키 변경은 사용자가 수동으로)
