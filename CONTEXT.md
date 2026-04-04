# Policy Radar — 프로젝트 인수인계 (Antigravity용)

> 최종 업데이트: 2026-04-04
> 작성자: 진헌호 (dda5.jin@gmail.com)

---

## 지금까지 뭘 만들었나?

한국 부동산·금융 정책을 매일 자동으로 스크랩하고, AI가 요약·전문가 의견까지 붙여주는 구독형 웹사이트입니다.

- 현재 주소: https://dda5jin-png.github.io/policyrader/
- 기술: Next.js + Tailwind CSS + Better-Auth (Google 로그인) + Vercel 예정

---

## 완료된 작업

### UI/UX
- 다크테마 전체 적용
- 카테고리 필터: CSS Grid 2행 — 전체 버튼이 2행 차지, 나머지 6개가 3×2 배치
- 슬로건 섹션: 반투명 글래스모피즘 카드 디자인
- 딥링크: `?id=post-001` 쿼리로 모달 직접 열기
- 링크 복사: `navigator.clipboard.writeText()` + textarea 폴백
- PDF 출력: `window.open()` 새 창에서 A4 레이아웃

### 카테고리 재편
- 기존 분류 → 새 분류로 전환
  - F: 금융정책 (DSR/LTV, 금융위원회)
  - X: 세금정책 (취득세/양도세, 기획재정부)
  - S: 공급·개발 (신규 공급, 국토교통부)
  - T: 거래·법령 (매매 규제, 국토교통부)
  - R: 임대·주거 (임차인 보호, 국토교통부)
  - P: 프롭테크 (기술혁신, 다부처)
- posts.json 15개 항목 모두 새 카테고리로 재분류 완료

### Next.js 마이그레이션 (Antigravity로 진행)
- `app/page.tsx` — 메인 페이지 완성
- `components/Header.tsx` — Google 로그인 버튼 + 세션 표시
- `components/PostModal.tsx` — 상세 모달
- `components/PostComponents.tsx` — Filters, PostCard
- `components/HeroSections.tsx` — Hero, SloganSection
- `lib/auth.ts` — Better-Auth 서버 설정 완료
- `lib/auth-client.ts` — 클라이언트 설정 완료
- `app/api/auth/[...all]/route.ts` — API 라우트 완료

---

## 아직 남은 작업 (이 순서대로)

### 1단계 — 환경변수 준비 (사람이 직접)
- [ ] Google Cloud Console에서 OAuth 2.0 Client ID/Secret 발급
- [ ] Vercel Postgres 또는 Supabase 무료 DB 생성 → DATABASE_URL 확보
- [ ] `openssl rand -base64 32` 로 BETTER_AUTH_SECRET 생성
- [ ] `.env.local` 파일에 아래 항목 채우기:
  ```
  DATABASE_URL=postgresql://...
  GOOGLE_CLIENT_ID=...
  GOOGLE_CLIENT_SECRET=...
  BETTER_AUTH_SECRET=...
  GEMINI_API_KEY=...
  ```

### 2단계 — 기능 게이팅 코드 추가 (AI 작업 가능)
- [ ] `PostModal.tsx`에서 `authClient.useSession()` 확인 후:
  - 로그인 O → 링크복사/PDF출력/체크리스트 버튼 표시
  - 로그인 X → "로그인하면 더 많은 기능을 사용할 수 있습니다" 배너 표시

### 3단계 — Vercel 배포
- [ ] GitHub 리포지토리 연결
- [ ] Vercel 환경변수 등록 (위 4개 항목)
- [ ] `vercel.json` 필요 시 추가

### 4단계 — 도메인 구매 및 연결
- [ ] 도메인 구매 (Porkbun/Namecheap 권장, 연 $10~15)
- [ ] Vercel DNS 설정에서 도메인 연결
- [ ] HTTPS 자동 발급 확인

### 5단계 — Google Console OAuth URI 업데이트 ⚠️ 중요
- [ ] Google Cloud Console → OAuth 2.0 클라이언트
- [ ] 승인된 리다이렉트 URI에 최종 도메인 추가:
  - `https://최종도메인/api/auth/callback/google`
- [ ] 기존 localhost URI는 개발용으로 남겨도 됨

### 6단계 — 검색 등록
- [ ] `public/sitemap.xml` 생성
- [ ] `public/robots.txt` 생성
- [ ] Google Search Console에 최종 도메인 등록 + 소유권 확인
- [ ] Naver Search Advisor에 최종 도메인 등록 + 소유권 확인

---

## 핵심 주의사항

**Google OAuth 리다이렉트 URI 순서가 틀리면 로그인이 안 됩니다.**
- 도메인 확정 전에 OAuth를 설정하면 → 나중에 URI 다시 변경해야 함
- 반드시: Vercel 배포 → 도메인 연결 → 그 다음 Google Console URI 등록

**Better-Auth DB 마이그레이션**
- 처음 실행 시 `npx better-auth migrate` 로 DB 테이블 자동 생성
- 또는 Vercel 빌드 명령어에 포함 가능

**GitHub Actions 자동 업데이트**
- `.github/workflows/update_posts.yml` 이미 설정됨
- GitHub 리포지토리 Settings → Secrets에 `GEMINI_API_KEY` 등록 필요

---

## 파일 위치
- 로컬 폴더: `~/바탕화면/policyrader/` (또는 실제 경로)
- GitHub: `dda5jin-png/policyrader`
- 현재 배포: GitHub Pages → Vercel로 이전 예정
