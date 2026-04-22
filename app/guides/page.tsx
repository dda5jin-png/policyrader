import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/Header";
import { GUIDES, GUIDES_UPDATED_AT } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "부동산 정책 레퍼런스 | 폴리시레이더",
  description:
    "가격과 가치, 시장 구조, 대출·세금·공급·임대차 제도를 정책자료 해석에 필요한 기초 개념으로 정리합니다.",
  alternates: {
    canonical: `${SITE_URL}/guides`,
  },
};

export default function GuidesPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-14">
        <p className="text-[0.78rem] font-bold uppercase text-[var(--accent)]">Reference / Guide</p>
        <h1 className="mt-3 max-w-3xl text-[2.2rem] font-black leading-tight text-slate-950">
          부동산 정책을 읽기 위한 학습형 레퍼런스
        </h1>
        <p className="mt-5 max-w-3xl text-[1rem] leading-8 text-slate-700">
          정책자료를 해석할 때 반복적으로 등장하는 기초 개념을 별도 블로그가 아니라 플랫폼 내부의 참조 영역으로 통합했습니다.
          기준일은 {GUIDES_UPDATED_AT}이며, 실제 신고·대출·계약 전에는 담당 기관의 최신 공고를 확인해야 합니다.
        </p>

        <div className="mt-10 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {GUIDES.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`} className="grid gap-3 py-6 md:grid-cols-[220px_1fr_auto] md:items-start">
              <div>
                <p className="text-[0.78rem] font-bold text-[var(--accent)]">{guide.eyebrow}</p>
                <p className="mt-2 text-[0.82rem] text-slate-500">업데이트 {guide.updatedAt}</p>
              </div>
              <div>
                <h2 className="text-[1.25rem] font-black leading-snug text-slate-950">{guide.title}</h2>
                <p className="mt-2 text-[0.96rem] leading-7 text-slate-600">{guide.description}</p>
              </div>
              <span className="text-[0.9rem] font-bold text-slate-900">읽기</span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
