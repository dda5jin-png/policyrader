import type { Metadata } from "next";

import Header from "@/components/Header";
import { DATA_SOURCES, SITE_PRINCIPLES } from "@/lib/editorial";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "데이터 출처 안내 | PolicyRadar",
  description:
    "PolicyRadar가 정책 원문 해설과 관련 지표 분석에 활용하는 정부부처, 지자체, 통계청, 한국은행, 한국부동산원, 공공기관 자료의 활용 기준입니다.",
  alternates: { canonical: `${SITE_URL}/data-sources` },
  openGraph: {
    title: "데이터 출처 안내 | PolicyRadar",
    description: "정책 원문과 공개 통계를 어떤 기준으로 활용하는지 설명합니다.",
    url: `${SITE_URL}/data-sources`,
    type: "article",
    locale: "ko_KR",
  },
};

export default function DataSourcesPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-14">
        <p className="text-[0.78rem] font-bold uppercase text-[var(--accent)]">Sources</p>
        <h1 className="mt-3 text-[2.1rem] font-black leading-tight text-slate-950">
          데이터 출처와 분석 기준
        </h1>
        <p className="mt-5 text-[1rem] leading-8 text-slate-700">
          PolicyRadar는 정부·공공기관의 원문 자료를 우선 확인하고, 관련 공개 통계를 연결해
          정책의 배경과 확인해야 할 쟁점을 정리합니다. 출처가 불분명한 수치나 과도한 예측은
          해설의 근거로 사용하지 않습니다.
        </p>

        <section className="mt-10 grid gap-5">
          {DATA_SOURCES.map((source) => (
            <div key={source.name} className="border-y border-[var(--border)] bg-white py-5">
              <h2 className="text-[1.2rem] font-black text-slate-950">{source.name}</h2>
              <p className="mt-3 text-[1rem] leading-8 text-slate-700">{source.description}</p>
            </div>
          ))}
        </section>

        <section className="mt-10 border-y border-[var(--border)] bg-slate-50 p-5">
          <h2 className="text-[1.1rem] font-black text-slate-950">분석 기준</h2>
          <div className="mt-4 space-y-3 text-[0.96rem] leading-7 text-slate-700">
            {SITE_PRINCIPLES.map((principle) => (
              <p key={principle}>{principle}</p>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}
