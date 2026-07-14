---
description: Supabase 테이블 설계 — 스키마 SQL과 RLS 정책 초안 작성
argument-hint: "[테이블 용도 설명]"
---

Supabase 테이블을 설계해줘: $ARGUMENTS

1. docs/PRD.md를 읽고 데이터 요구사항을 파악해
2. 다음을 포함한 SQL을 `supabase/migrations/` 폴더에 작성해:
   - `create table` (적절한 타입, not null 제약, default, `user_id uuid references auth.users`)
   - `created_at timestamptz default now()`
   - **RLS 활성화 필수**: `alter table ... enable row level security`
   - RLS 정책: 기본은 "본인 데이터만 CRUD" (`auth.uid() = user_id`)
3. 정책이 왜 그렇게 설계됐는지 주석으로 설명해
4. 적용 방법(supabase db push 또는 대시보드 SQL Editor)을 안내해

주의: RLS 없이 테이블을 만들지 마. 공개 읽기가 필요하면 명시적으로 정책을 분리해.
