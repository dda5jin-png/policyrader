@AGENTS.md

# Policy Radar — AI Agent Context

## 프로젝트 개요
- **이름**: Policy Radar (정책레이더)
- **목적**: 한국 부동산·금융 정책 스크랩 + 전문가 의견 구독 웹사이트
- **현재 URL**: `dda5jin-png.github.io/policyrader/` → Vercel + 커스텀 도메인으로 이전 예정
- **스택**: Next.js (App Router) + TypeScript + Tailwind CSS + Better-Auth + PostgreSQL

---

## 디렉토리 구조
```
/policyrader
├── app/
│   ├── api/auth/[...all]/route.ts   # Better-Auth API 핸들러
│   ├── globals.css                   # CSS 변수, 다크테마, 카테고리 색상
│   ├── layout.tsx                    # 메타데이터, Pretendard 폰트
│   └── page.tsx                      # 메인 페이지
├── components/
│   ├── Header.tsx                    # 로고 + 로그인/로그아웃 버튼
│   ├── HeroSections.tsx              # Hero + SloganSection
│   ├── PostComponents.tsx            # Filters + PostCard + Post 타입
│   └── PostModal.tsx                 # 상세 모달 (링크복사/PDF/체크리스트)
├── lib/
│   ├── auth.ts                       # Better-Auth 서버 설정
│   ├── auth-client.ts                # Better-Auth 클라이언트
│   └── utils.ts                      # copyLink, printPDF 유틸
├── public/posts.json                 # 실제 데이터 (15개 항목)
├── .github/workflows/update_posts.yml
├── .env.example
└── backup_legacy/index.html          # 이전 정적 HTML (참고용)
```

---

## 카테고리 시스템
| 코드 | 이름 | 기관 | CSS 클래스 |
|------|------|------|-----------|
| F | 금융정책 | 금융위원회 | cat-F |
| X | 세금정책 | 기획재정부 | cat-X |
| S | 공급·개발 | 국토교통부 | cat-S |
| T | 거래·법령 | 국토교통부 | cat-T |
| R | 임대·주거 | 국토교통부 | cat-R |
| P | 프롭테크 | 다부처 | cat-P |

---

## posts.json 데이터 구조
```json
{
  "id": "post-001",
  "cat": "F",
  "catName": "금융정책",
  "headline": "정책 제목",
  "date": "2025-01-15",
  "source": "금융위원회",
  "sourceUrl": "https://...",
  "summary": ["핵심 포인트 1"],
  "keyData": [{ "항목": "", "수치": "", "적용대상": "" }],
  "expertOpinions": [{ "name": "", "affiliation": "", "comment": "" }],
  "checklist": ["체크리스트 항목 1"],
  "views": 0
}
```
**스크랩 원칙**: 기사 아닌 원문(정부 보도자료/공고) 인용 → 요약 구성

---

## 인증 시스템 (Better-Auth)
- 라이브러리: `better-auth` + `pg` (PostgreSQL)
- 서버: `lib/auth.ts` — `betterAuth()` with Google OAuth
- 클라이언트: `lib/auth-client.ts` — `createAuthClient()`
- API 라우트: `app/api/auth/[...all]/route.ts`
- **필요 환경변수**:
  ```
  DATABASE_URL=postgresql://...
  GOOGLE_CLIENT_ID=...
  GOOGLE_CLIENT_SECRET=...
  BETTER_AUTH_SECRET=...   # openssl rand -base64 32 로 생성
  GEMINI_API_KEY=...
  ```

---

## 기능 게이팅 (Feature Gating) — 미구현
- **비로그인**: 목록 조회 + 상세 모달 열람만
- **로그인 후**: 링크 복사, PDF 출력, 체크리스트 표시 활성화
- 구현 위치: `PostModal.tsx`에서 `authClient.useSession()` 분기 필요

---

## 배포 순서 (중요)
1. Vercel 연동 → `.vercel.app` 임시 도메인 확인
2. 도메인 구매 (Namecheap/Porkbun)
3. Vercel에 커스텀 도메인 연결
4. **Google Cloud Console OAuth 리다이렉트 URI를 최종 도메인으로 업데이트** ← 반드시!
5. Google Search Console + Naver Search Advisor 등록

---

## 자동 업데이트
- `.github/workflows/update_posts.yml` — 매일 KST 09:00
- Gemini API로 posts.json 자동 업데이트
- GitHub Secret: `GEMINI_API_KEY`

---

## 코딩 주의사항
1. AGENTS.md의 Next.js 가이드를 먼저 읽을 것
2. Tailwind: core utility 클래스만 사용
3. CSS 변수는 globals.css `:root`에 정의 (`--accent`, `--glass`, `--border` 등)
4. `'use client'` 지시어: 클라이언트 컴포넌트에만 추가
5. posts.json fetch 경로: `/posts.json` (public 폴더 기준)
