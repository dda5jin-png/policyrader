import type { Metadata } from "next";

import Header from "@/components/Header";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "문의 | PolicyRadar",
  description: "PolicyRadar 운영 문의, 오류 제보, 원문 링크 오류 제보, 정책 자료 추천 제보 안내입니다.",
  alternates: { canonical: `${SITE_URL}/contact` },
  openGraph: {
    title: "문의 | PolicyRadar",
    description: "정책 자료 오류와 원문 링크 오류, 자료 추천을 접수합니다.",
    url: `${SITE_URL}/contact`,
    type: "article",
    locale: "ko_KR",
  },
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-14">
        <p className="text-[0.78rem] font-bold uppercase text-[var(--accent)]">Contact</p>
        <h1 className="mt-3 text-[2.1rem] font-black text-slate-950">문의</h1>
        <div className="mt-8 space-y-5 border-y border-[var(--border)] py-8 text-[1rem] leading-8 text-slate-700">
          <p>서비스 운영, 자료 정정, 출처 보완, 제휴 문의는 아래 이메일로 접수합니다.</p>
          <p>
            이메일:
            {" "}
            <a href="mailto:kiap.center@gmail.com" className="font-bold text-[var(--accent)] underline">
              kiap.center@gmail.com
            </a>
          </p>
          <p>오류 제보는 정책 제목, 원문 URL, 수정이 필요한 부분, 확인 가능한 근거를 함께 보내면 검토가 빠릅니다.</p>
          <p>원문 링크가 바뀌었거나 삭제된 경우에도 알려주세요. 가능한 경우 정부·공공기관의 새 링크나 보관 가능한 공식 자료를 기준으로 갱신합니다.</p>
          <p>새로 다루면 좋을 정책 자료 추천도 받습니다. 추천 시 발표 기관, 발표일, 원문 링크, 왜 확인이 필요한 정책인지 간단한 설명을 함께 보내주세요.</p>
        </div>
      </main>
    </>
  );
}
