import type { Metadata } from "next";

import Header from "@/components/Header";
import { SITE_PRINCIPLES } from "@/lib/editorial";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "면책고지 및 이용약관 | PolicyRadar",
  description:
    "PolicyRadar는 공개 자료 기반 참고용 해설 사이트이며 행정, 법률, 세무, 투자 판단의 최종 근거가 아니라는 점을 안내합니다.",
  alternates: { canonical: `${SITE_URL}/terms` },
  openGraph: {
    title: "면책고지 및 이용약관 | PolicyRadar",
    description: "정책 해설 이용 시 확인해야 할 면책사항과 이용 기준입니다.",
    url: `${SITE_URL}/terms`,
    type: "article",
    locale: "ko_KR",
  },
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-14">
        <p className="text-[0.78rem] font-bold uppercase text-[var(--accent)]">Disclaimer</p>
        <h1 className="mt-3 text-[2.1rem] font-black text-slate-950">면책고지 및 이용약관</h1>
        <div className="mt-8 space-y-5 border-y border-[var(--border)] py-8 text-[1rem] leading-8 text-slate-700">
          <p>폴리시레이더는 공개된 정책자료와 통계 정보를 바탕으로 부동산 정책 이해를 돕는 정보 서비스를 제공합니다.</p>
          <p>서비스 내 요약, 지표 정리, 해석 문단은 참고 자료이며, 법률·세무·투자 자문으로 해석되지 않습니다.</p>
          <p>이용자는 정책 판단, 거래, 신고, 대출 신청 전 반드시 원문 공고와 담당 기관의 최신 안내를 확인해야 합니다.</p>
          <p>정책 내용은 발표 이후 시행령, 고시, 세부 공고, 예산 배정, 지자체별 집행 기준에 따라 변경될 수 있습니다.</p>
          <p>본 사이트는 행정, 법률, 세무, 투자 판단의 최종 근거가 아니며, 실제 신청이나 제도 적용 전 담당 기관 및 전문가 확인이 필요합니다.</p>
          <p>무단 대량 수집, 비정상적 트래픽 유발, 서비스 운영 방해 행위는 제한될 수 있습니다.</p>
          <p>외부 기관의 원문 수정, 링크 변경, 통계 기준 변경에 따라 서비스 내용은 업데이트될 수 있습니다.</p>
          <p>오류나 원문 링크 문제를 발견한 경우 문의 페이지의 이메일로 제보할 수 있습니다.</p>
          {SITE_PRINCIPLES.map((principle) => (
            <p key={principle}>{principle}</p>
          ))}
        </div>
      </main>
    </>
  );
}
