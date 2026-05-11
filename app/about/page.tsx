import type { Metadata } from "next";

import Header from "@/components/Header";
import { SITE_PRINCIPLES } from "@/lib/editorial";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "소개 | PolicyRadar",
  description:
    "PolicyRadar를 만든 이유와 원문 기반 요약, 관련 지표 연결, 과장 없는 정책 해설 운영 원칙을 소개합니다.",
  alternates: { canonical: `${SITE_URL}/about` },
  openGraph: {
    title: "소개 | PolicyRadar",
    description: "정부·공공기관 정책 원문과 공개 지표를 함께 읽는 정책 정보 아카이브입니다.",
    url: `${SITE_URL}/about`,
    type: "article",
    locale: "ko_KR",
  },
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-14">
        <p className="text-[0.78rem] font-bold uppercase text-[var(--accent)]">About</p>
        <h1 className="mt-3 text-[2.1rem] font-black leading-tight text-slate-950">PolicyRadar 소개</h1>
        <div className="mt-8 space-y-6 border-y border-[var(--border)] py-8 text-[1rem] leading-8 text-slate-700">
          <p>
            PolicyRadar는 정보가 빠르게 흘러가고 자극적인 제목이 앞서는 환경에서, 정책을 다시
            원문 중심으로 읽기 위해 만든 정책 정보 아카이브입니다. 정부·공공기관의 발표 자료를
            바탕으로 핵심 내용, 관련 지표, 기대효과, 확인해야 할 쟁점을 정리합니다.
          </p>
          <p>
            운영 방향은 단순 요약보다 근거 확인과 비교 가능한 구조에 있습니다. 각 정책 콘텐츠에는
            발표 기관, 발표일, 원문 링크, 관련 지표, 체크리스트를 함께 표시해 이용자가 자료를
            독립적으로 검토할 수 있도록 합니다.
          </p>
          <p>
            PolicyRadar는 과장된 전망이나 단정적 판단을 피합니다. 정책 효과는 시행령, 세부 공고,
            예산 배정, 지자체 집행 기준에 따라 달라질 수 있으므로 원문과 담당 기관 안내를 최종
            기준으로 삼아야 합니다.
          </p>
          {SITE_PRINCIPLES.map((principle) => (
            <p key={principle}>{principle}</p>
          ))}
        </div>
      </main>
    </>
  );
}
