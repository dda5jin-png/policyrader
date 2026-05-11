import type { Metadata } from "next";
import Link from "next/link";

import Header from "@/components/Header";
import { EDITORIAL_COLUMNS } from "@/lib/editorial";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "정책 해설 칼럼 | PolicyRadar",
  description:
    "정책 원문 읽는 법, 지원사업 공고 해석, 관련 지표 활용법 등 단순 요약과 분리된 정책 해설 칼럼 목록입니다.",
  alternates: { canonical: `${SITE_URL}/columns` },
  openGraph: {
    title: "정책 해설 칼럼 | PolicyRadar",
    description: "정책 원문과 공개 데이터를 더 정확히 읽기 위한 해설형 콘텐츠를 모았습니다.",
    url: `${SITE_URL}/columns`,
    type: "website",
    locale: "ko_KR",
  },
};

export default function ColumnsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-14">
        <p className="text-[0.78rem] font-bold uppercase text-[var(--accent)]">Editorial</p>
        <h1 className="mt-3 text-[2.1rem] font-black leading-tight text-slate-950">
          정책 해설 칼럼
        </h1>
        <p className="mt-5 max-w-3xl text-[1rem] leading-8 text-slate-700">
          정책 원문을 어떻게 읽어야 하는지, 관련 지표를 어디까지 참고해야 하는지, 지원사업
          공고에서 놓치기 쉬운 조건은 무엇인지 운영자의 관점으로 정리한 글입니다.
        </p>

        <div className="mt-10 divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {EDITORIAL_COLUMNS.map((column) => (
            <Link
              key={column.slug}
              href={`/columns/${column.slug}`}
              className="grid gap-3 py-6 md:grid-cols-[160px_1fr_auto] md:items-start"
            >
              <div>
                <p className="text-[0.78rem] font-bold text-[var(--accent)]">{column.category}</p>
                <p className="mt-2 text-[0.82rem] text-slate-500">{column.date}</p>
              </div>
              <div>
                <h2 className="text-[1.25rem] font-black leading-snug text-slate-950">
                  {column.title}
                </h2>
                <p className="mt-2 text-[0.96rem] leading-7 text-slate-600">{column.summary}</p>
              </div>
              <span className="text-[0.9rem] font-bold text-slate-900">읽기</span>
            </Link>
          ))}
        </div>
      </main>
    </>
  );
}
