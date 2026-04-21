import type { Metadata } from "next";
import Link from "next/link";

import { GUIDES, GUIDES_UPDATED_AT } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "부동산 정책 기초 가이드 | 폴리시레이더",
  description:
    "DSR/LTV, 종부세·재산세·양도세, 부동산 PF, 전세보증, 공공주택 공급 정책을 공식 근거와 함께 정리한 공개 가이드입니다.",
  alternates: {
    canonical: `${SITE_URL}/guides`,
  },
  openGraph: {
    title: "부동산 정책 기초 가이드 | 폴리시레이더",
    description:
      "정부 부동산 정책을 읽기 전에 알아야 할 법령·제도 기초를 한 곳에 정리했습니다.",
    url: `${SITE_URL}/guides`,
    type: "website",
    locale: "ko_KR",
  },
};

export default function GuidesPage() {
  return (
    <main className="min-h-screen bg-[var(--primary)] px-5 py-14">
      <section className="mx-auto max-w-5xl">
        <Link
          href="/"
          className="text-[0.9rem] font-bold text-[var(--accent)] underline underline-offset-4"
        >
          홈으로 돌아가기
        </Link>

        <div className="mt-8 rounded-[28px] border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-[var(--shadow-lg)] sm:p-10">
          <div className="text-[0.78rem] font-black uppercase tracking-[1px] text-[var(--accent)]">
            Public Policy Guides
          </div>
          <h1 className="mt-4 text-[2rem] font-black leading-tight text-[var(--text-main)] sm:text-[2.5rem]">
            부동산 정책을 읽기 전에
            <br />
            꼭 알아야 할 기초 가이드
          </h1>
          <p className="mt-5 max-w-3xl text-[1rem] leading-7 text-[var(--text-muted)]">
            애드센스 심사와 검색 노출에서 중요한 것은 원문을 단순히 모아두는 것보다
            이용자가 스스로 판단할 수 있는 공개 설명과 근거입니다. 아래 가이드는
            법제처·정부기관 자료를 바탕으로 초보자도 정책 발표를 읽을 수 있게 정리했습니다.
          </p>
          <p className="mt-4 text-[0.86rem] text-[var(--text-muted)]">
            기준일: {GUIDES_UPDATED_AT}. 세율, 대출규제, 보증요건은 개정될 수 있으므로 실제 신고·대출·계약 전에는 공식기관 최신 안내를 다시 확인하세요.
          </p>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          {GUIDES.map((guide) => (
            <Link
              key={guide.slug}
              href={`/guides/${guide.slug}`}
              className="group rounded-[24px] border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-sm transition hover:-translate-y-1 hover:border-[var(--accent)]/50"
            >
              <div className="text-[0.72rem] font-black uppercase tracking-[1px] text-[var(--accent)]">
                {guide.eyebrow}
              </div>
              <h2 className="mt-3 text-[1.35rem] font-black leading-snug text-[var(--text-main)]">
                {guide.title}
              </h2>
              <p className="mt-3 text-[0.95rem] leading-7 text-[var(--text-muted)]">
                {guide.description}
              </p>
              <div className="mt-5 text-[0.86rem] font-bold text-[var(--accent)]">
                가이드 읽기 →
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
