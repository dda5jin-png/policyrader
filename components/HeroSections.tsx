import Link from "next/link";
import React from 'react';

import { GUIDE_SUMMARIES } from "@/lib/guides";

export const Hero = () => (
  <section className="px-6 py-[60px] text-center max-w-[900px] mx-auto">
    <div className="inline-block px-3.5 py-1.5 bg-[var(--accent-soft)] text-[var(--accent)] rounded-full text-[0.75rem] font-bold mb-5 uppercase tracking-[1px]">
      매일 아침 9시 · 정부 보도자료 원문 수집
    </div>
    <h1 className="text-[2.2rem] font-extrabold leading-[1.2] mb-5 text-[var(--text-main)]">
      오늘 정부가 발표한 부동산 정책<br/>원문으로 바로 확인하세요.
    </h1>
    <div className="mx-auto mt-6 max-w-[620px] rounded-2xl border border-[var(--border)] bg-[var(--card-bg)]/80 p-5 text-left shadow-sm">
      <div className="mb-3 text-[0.78rem] font-black uppercase tracking-[1px] text-[var(--accent)]">이용방법</div>
      <div className="space-y-2 text-[0.88rem] leading-[1.6] text-[var(--text-muted)]">
        <div>1. 아래 카드에서 원하는 정책 자료를 클릭해 상세 내용을 바로 확인하세요.</div>
        <div>2. 비회원도 요약, 기대효과, 지표 정리, 체크리스트까지 그대로 볼 수 있습니다.</div>
        <div>3. 비회원은 링크 생성, PDF 출력, 원문 바로가기 기능이 제한됩니다.</div>
        <div>4. 저장한 자료는 로그인 후 상단의 `내 서고`에서 다시 볼 수 있습니다.</div>
      </div>
    </div>
  </section>
);

export const PolicyGuideSection = () => (
  <section className="max-w-[900px] mx-auto mb-10 px-5">
    <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
      <div>
        <div className="text-[0.78rem] font-black uppercase tracking-[1px] text-[var(--accent)]">
          정책 기초 가이드
        </div>
        <h2 className="mt-2 text-[1.45rem] font-black text-[var(--text-main)]">
          보도자료를 읽기 전에 기준부터 잡기
        </h2>
      </div>
      <Link
        href="/guides"
        className="text-[0.88rem] font-bold text-[var(--accent)] underline underline-offset-4"
      >
        전체 가이드 보기
      </Link>
    </div>
    <div className="grid gap-4 sm:grid-cols-2">
      {GUIDE_SUMMARIES.map((guide) => (
        <Link
          key={guide.slug}
          href={`/guides/${guide.slug}`}
          className="rounded-2xl border border-[var(--border)] bg-[var(--card-bg)] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--accent)]/50"
        >
          <div className="text-[0.7rem] font-black uppercase tracking-[1px] text-[var(--accent)]">
            {guide.eyebrow}
          </div>
          <h3 className="mt-2 text-[1rem] font-black leading-snug text-[var(--text-main)]">
            {guide.title}
          </h3>
          <p className="mt-2 text-[0.86rem] leading-6 text-[var(--text-muted)]">
            {guide.description}
          </p>
        </Link>
      ))}
    </div>
  </section>
);

export const SloganSection = () => (
  <div className="max-w-[660px] mx-auto -mt-5 mb-11 px-5">
    <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-7.5 pb-5 shadow-sm">
      <div className="flex items-start gap-3 text-[0.9rem] text-[var(--text-muted)] font-medium leading-[1.65] mb-3.5">
        <svg className="text-[var(--accent)] flex-shrink-0 mt-[3px]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        모든 분석은 정부 공식 브리핑 원문만을 기반으로 합니다. (원문 바로가기 제공)
      </div>
      <div className="flex items-start gap-3 text-[0.9rem] text-[var(--text-muted)] font-medium leading-[1.65] mb-3.5">
        <svg className="text-[var(--accent)] flex-shrink-0 mt-[3px]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        원문 기반 정책 리서치(팩트체크·정치성향 배제·논문 리서치 정제)로 심층 인사이트를 제공합니다.
      </div>
      <div className="flex items-start gap-3 text-[0.9rem] text-[var(--text-muted)] font-medium leading-[1.65] mb-3.5">
        <svg className="text-[var(--accent)] flex-shrink-0 mt-[3px]" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        관심 자료의 링크 생성 및 PDF 출력 기능을 제공합니다.
      </div>
      <hr className="border-t border-[var(--border)] my-4 last:mb-0" />
      <div className="flex items-start gap-2 text-[0.8rem] text-[#f59e0b] font-medium leading-[1.6]">
        <span className="flex-shrink-0 text-[0.95rem] mt-px">※</span>
        비회원은 링크 생성, PDF 출력, 원문 바로가기 기능이 제한됩니다.
      </div>
    </div>
  </div>
);
