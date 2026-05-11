import type { Metadata } from "next";

import Header from "@/components/Header";
import { POLICY_READING_CHECKLIST, SITE_PRINCIPLES } from "@/lib/editorial";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "이용 가이드 | PolicyRadar",
  description:
    "정책 카드, 상세 페이지, 원문 핵심 요약, 관련 지표, 체크리스트를 활용해 정책 원문을 읽는 방법을 안내합니다.",
  alternates: { canonical: `${SITE_URL}/usage-guide` },
  openGraph: {
    title: "이용 가이드 | PolicyRadar",
    description: "PolicyRadar의 정책 원문 기반 해설과 지표, 체크리스트 활용법을 정리했습니다.",
    url: `${SITE_URL}/usage-guide`,
    type: "article",
    locale: "ko_KR",
  },
};

export default function UsageGuidePage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-14">
        <p className="text-[0.78rem] font-bold uppercase text-[var(--accent)]">How to use</p>
        <h1 className="mt-3 text-[2.1rem] font-black leading-tight text-slate-950">
          정책 원문과 해설을 함께 읽는 방법
        </h1>
        <p className="mt-5 text-[1rem] leading-8 text-slate-700">
          PolicyRadar는 정책 제목만 빠르게 훑는 사이트가 아니라, 원문 출처와 관련 지표를
          함께 확인하며 정책의 적용 조건과 주의사항을 정리하는 정보 아카이브입니다.
        </p>

        <section className="mt-10 border-y border-[var(--border)] py-8">
          <h2 className="text-[1.35rem] font-black text-slate-950">정책 카드 읽는 법</h2>
          <div className="mt-5 space-y-4 text-[1rem] leading-8 text-slate-700">
            <p>
              목록의 정책 카드는 정책명, 발표 기관, 발표일, 분야, 핵심 요약을 먼저 보여줍니다.
              카드는 빠른 탐색용이므로 제목만으로 판단하지 말고 상세 페이지에서 대상, 시행 시기,
              예산, 원문 링크를 함께 확인해야 합니다.
            </p>
            <p>
              같은 날짜에 비슷한 정책이 여러 건 보일 수 있습니다. 이 경우 발표 기관과 원문 URL을
              확인해 보도자료, 설명자료, 후속 공고가 서로 다른 문서인지 구분하는 것이 좋습니다.
            </p>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[1.35rem] font-black text-slate-950">상세 페이지 활용법</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {[
              ["원문 출처", "기관명, 발표일, 원문 링크를 확인해 정보의 기준점을 잡습니다."],
              ["핵심 내용", "대상, 지원 내용, 시행 시기, 예산 또는 규모, 담당 기관을 분리해 봅니다."],
              ["관련 지표", "정책과 연결되는 통계가 무엇을 설명하는지 해석 문장까지 확인합니다."],
              ["체크리스트", "내가 대상자인지, 신청 시기와 후속 공고가 필요한지 점검합니다."],
            ].map(([title, body]) => (
              <div key={title} className="border-y border-[var(--border)] bg-slate-50 p-5">
                <h3 className="font-black text-slate-950">{title}</h3>
                <p className="mt-2 text-[0.95rem] leading-7 text-slate-700">{body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <h2 className="text-[1.35rem] font-black text-slate-950">원문에서 확인할 항목</h2>
          <div className="mt-5 divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {POLICY_READING_CHECKLIST.map((item) => (
              <p key={item} className="py-4 text-[1rem] leading-8 text-slate-700">
                {item}
              </p>
            ))}
          </div>
        </section>

        <section className="mt-10 border-y border-[var(--border)] bg-slate-50 p-5">
          <h2 className="text-[1.1rem] font-black text-slate-950">운영 원칙</h2>
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
