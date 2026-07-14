# Supabase 사용 가이드

## 클라이언트 구분 (템플릿 제공)

- 서버 컴포넌트/서버 액션: `lib/supabase/server.ts`의 `createClient()` (쿠키 기반 세션)
- 클라이언트 컴포넌트: `lib/supabase/client.ts`의 `createClient()`
- 혼용하지 않는다 — 서버에서 클라이언트용을 쓰면 세션이 깨진다

## 보안 (가장 중요)

- **모든 테이블에 RLS 필수**: `enable row level security` 없는 테이블은 anon key만으로 전체가 노출된다
- 기본 정책: `auth.uid() = user_id` (select/insert/update/delete 각각, update는 `using` + `with check` 둘 다)
- `sb_secret_`/service_role 키는 절대 클라이언트 코드·`NEXT_PUBLIC_` 변수·git에 넣지 않는다
- 환경 변수는 `.env.local`에만 (훅이 자동 편집을 차단함 — 수동으로 관리)
- 테이블 작업 후에는 rls-checker 에이전트로 검증한다

## 스키마 관리

- 스키마 변경은 `supabase/migrations/*.sql` 파일로 관리하고 커밋한다 (대시보드에서 임의 변경 금지)
- 새 테이블 설계는 `/db-table` 커맨드 사용

## 프로젝트 정보

- 프로젝트 ref: `fzoingecensepnnunoaa` (Seoul, ap-northeast-2)
- 대시보드: https://supabase.com/dashboard/project/fzoingecensepnnunoaa
- MCP 서버(읽기 전용)가 연결되어 있어 스키마 조회·쿼리 확인 가능 (`SUPABASE_ACCESS_TOKEN` 환경 변수 필요)
