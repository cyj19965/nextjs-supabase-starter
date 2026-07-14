# Next.js 규칙 (App Router, v16)

- **서버 컴포넌트 우선**: 'use client'는 상호작용(onClick, useState)이 필요한 말단 컴포넌트에만
- **Next 15 주의**: `params`와 `searchParams`는 Promise — 반드시 `await` 후 사용
- **데이터 변경은 server action**으로 (`'use server'`), 변경 후 `revalidatePath` 호출
- server action의 formData는 신뢰하지 않는다 — 타입/범위 검증 후 사용, 검증 실패는 조용한 no-op 또는 명확한 에러로
- **폼 제출 버튼의 name/value에 의존하지 않는다** — React가 submitter 값을 전달하지 않는 경우가 있으므로 hidden input 사용 (식물 일지 프로젝트에서 실제 겪은 버그)
- **이 프로젝트는 `cacheComponents` 모드** (next.config.ts): `dynamic = 'force-dynamic'`은 빌드 에러가 난다 — 인증 등 캐시 불가 데이터는 `<Suspense>` 안의 async 컴포넌트에서 접근 (미션 23에서 실제 겪은 빌드 에러)
- 라우트 구조: 목록 `/things`, 생성 `/things/new`, 상세 `/things/[id]`
