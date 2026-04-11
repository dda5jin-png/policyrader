# PolicyRadar

PolicyRadar는 정부 부동산 정책 원문을 공개 SEO 콘텐츠로 유지하면서, 회원 전용 인사이트를 부분 잠금 구조로 확장한 Next.js 16 앱입니다.

## 현재 구조

- 공개 유지: 메인 카드 목록, 원문 제목, 기본 요약, 일부 근거 문장, 원문 링크
- 로그인 필요: 정책 영향 분석, 시장 전망, 관련 지표, 인사이트 체크리스트
- 추후 유료/크레딧 확장: PDF 다운로드, 저장/북마크, AI 심화 분석, 논문분석기 연동

프리미엄 데이터는 정적 공개 JSON에서 직접 노출하지 않고, 서버 API가 세션을 검증한 뒤에만 응답합니다.

## 인증 구조

- 인증 공급자: Supabase Auth
- 우선 지원: Google 로그인
- 추가 지원: 이메일 매직 링크 로그인
- 공통 세션 처리: `@supabase/ssr`
- 보호 라우트 진입: 루트 `proxy.ts`에서 1차 체크
- 실제 권한 검증: 서버에서 다시 `profiles`와 세션을 확인

## 주요 파일

- 공개 콘텐츠 로딩: [app/page.tsx](/Users/hunho/Desktop/policyrader/app/page.tsx)
- 로그인/가입: [app/login/page.tsx](/Users/hunho/Desktop/policyrader/app/login/page.tsx), [app/signup/page.tsx](/Users/hunho/Desktop/policyrader/app/signup/page.tsx)
- Supabase 세션 유틸: [lib/supabase/server.ts](/Users/hunho/Desktop/policyrader/lib/supabase/server.ts), [lib/supabase/browser.ts](/Users/hunho/Desktop/policyrader/lib/supabase/browser.ts)
- 권한 헬퍼: [lib/auth/access.ts](/Users/hunho/Desktop/policyrader/lib/auth/access.ts)
- 프로필 동기화: [lib/auth/profile.ts](/Users/hunho/Desktop/policyrader/lib/auth/profile.ts)
- SQL 스키마: [supabase/policyradar_auth.sql](/Users/hunho/Desktop/policyrader/supabase/policyradar_auth.sql)

## 환경 변수

`.env.local`에 아래 값을 채워 넣습니다.

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `GEMINI_API_KEY`

Google 로그인 사용 시 Supabase Google Provider와 Google Cloud Console redirect URL도 함께 설정해야 합니다.

## Supabase 준비

1. Supabase 프로젝트를 생성합니다.
2. [supabase/policyradar_auth.sql](/Users/hunho/Desktop/policyrader/supabase/policyradar_auth.sql)의 SQL을 실행합니다.
3. Authentication > Providers에서 Google을 활성화합니다.
4. Authentication > URL Configuration에서 사이트 URL과 redirect URL을 등록합니다.

기본 `profiles` 구조는 아래 정책 확장을 바로 붙일 수 있게 설계했습니다.

- `role`: `user`, `admin`
- `is_free_whitelist`
- `free_daily_limit` 기본값 `3`
- `paid_plan`
- `credits`
- `is_active`

## 개발 실행

```bash
npm run dev
```

로그인 흐름 확인 순서:

- `/signup`에서 Google 또는 이메일 링크로 로그인
- 로그인 완료 후 `/auth/callback`에서 세션 교환 및 `profiles` upsert
- `/library` 접근 시 `proxy.ts`와 서버 페이지에서 이중 검증
- 홈 상세 모달에서 로그인 사용자만 프리미엄 API 응답 수신

## 권한 헬퍼

[lib/auth/access.ts](/Users/hunho/Desktop/policyrader/lib/auth/access.ts)에서 아래 함수를 분리해 두었습니다.

- `isAdmin(profile)`
- `isWhitelisted(profile)`
- `canViewPremiumInsight(profile)`
- `canViewIndicators(profile)`
- `canDownloadPdf(profile)`
- `canUseCredits(profile)`
- `getEffectiveAccessLevel(profile)`

이번 단계에서는 결제와 크레딧 차감은 구현하지 않았고, 그 기능을 붙이기 쉬운 권한 구조까지 정리했습니다.
