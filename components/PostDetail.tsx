import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { CAT_NAMES } from "@/components/PostComponents";
import { decodeHTMLEntities } from "@/lib/utils";
import type { FullPost } from "@/lib/posts";

export default function PostDetail({ post }: { post: FullPost }) {
  if (!post) {
    notFound();
  }

  const sections = post.content_sections;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white px-5 py-12">
        <article className="mx-auto max-w-4xl">
          <div className="mb-6 flex flex-wrap items-center gap-3 text-[0.78rem] text-[var(--text-muted)]">
            <Link
              href="/"
              className="font-bold text-[var(--accent)] underline underline-offset-4"
            >
              홈으로 돌아가기
            </Link>
            <span>발행일 {post.date}</span>
            <span>출처 {post.source}</span>
          </div>

          <span
            className={`cat-${post.cat} inline-flex rounded-md px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.5px]`}
          >
            {CAT_NAMES[post.cat] || post.catName}
          </span>

          <h1 className="mt-4 text-[1.9rem] font-black leading-tight text-[var(--text-main)]">
            {decodeHTMLEntities(post.headline)}
          </h1>

          <p className="mt-6 text-[1rem] leading-8 text-[var(--text-muted)]">
            이 문서는 원문 발표 내용과 정책 해석을 분리해 정리한 자료입니다. 정책 개요,
            핵심 요약, 기대효과 및 시장 영향, 관련 지표, 인사이트, 원문 출처 순서로 구성해
            동일한 기준에서 다른 정책과 비교할 수 있도록 했습니다.
          </p>

          {/* New 4-part structure */}
          {sections && Object.keys(sections).length > 0 ? (
            <div className="mt-10 space-y-12">
              <section>
                <h2 className="mb-4 text-[1.2rem] font-bold text-[var(--text-main)]">
                  정책 핵심 요약
                </h2>
                <div className="border-l-4 border-[var(--accent)] bg-slate-50 px-5 py-5 text-[1.05rem] leading-8 text-[var(--text-main)] whitespace-pre-wrap">
                  {decodeHTMLEntities(sections.summary)}
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-[1.2rem] font-bold text-[var(--text-main)]">
                  정책의 숨은 의미와 해석
                </h2>
                <div className="px-1 text-[1.05rem] leading-8 text-[var(--text-main)] whitespace-pre-wrap">
                  {decodeHTMLEntities(sections.meaning)}
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-[1.2rem] font-bold text-[var(--text-main)]">
                  부동산 및 시장 파급력
                </h2>
                <div className="px-1 text-[1.05rem] leading-8 text-[var(--text-main)] whitespace-pre-wrap">
                  {decodeHTMLEntities(sections.market_impact)}
                </div>
              </section>

              <section>
                <h2 className="mb-4 text-[1.2rem] font-bold text-[var(--text-main)]">
                  실수요자 및 투자자 인사이트
                </h2>
                <div className="px-1 text-[1.05rem] leading-8 text-[var(--text-main)] whitespace-pre-wrap">
                  {decodeHTMLEntities(sections.investor_insight)}
                </div>
              </section>
            </div>
          ) : (
            // Legacy format
            <section className="mt-10">
              <h2 className="mb-4 text-[0.8rem] font-extrabold uppercase tracking-[1px] text-[var(--accent)]">
                핵심 정책 요약
              </h2>
              <div className="space-y-3">
                {post.summary?.map((summary, index) => (
                  <p
                    key={`${post.id}-summary-${index}`}
                    className="border-l-4 border-[var(--accent)] bg-rose-50 px-4 py-4 text-[0.98rem] leading-7 text-[var(--text-main)]"
                  >
                    {decodeHTMLEntities(summary)}
                  </p>
                ))}
              </div>
            </section>
          )}

          {post.evidenceText ? (
            <section className="mt-10">
              <h2 className="mb-4 text-[0.8rem] font-extrabold uppercase tracking-[1px] text-[var(--text-muted)]">
                공개 근거 문장
              </h2>
              <p className="border-y border-[var(--border)] px-5 py-5 text-[0.96rem] leading-7 text-[var(--text-muted)] whitespace-pre-wrap">
                {decodeHTMLEntities(post.evidenceText)}
              </p>
            </section>
          ) : null}

          {post.keyData && post.keyData.length > 0 ? (
            <section className="mt-10">
              <h2 className="mb-4 text-[0.8rem] font-extrabold uppercase tracking-[1px] text-[var(--accent)]">
                공개 지표 정리
              </h2>
              <div className="overflow-x-auto border border-[var(--border)]">
                <table className="w-full min-w-[560px] border-collapse">
                  <thead>
                    <tr className="bg-[var(--accent-soft)]/20 text-left">
                      <th className="border-b border-[var(--border)] px-4 py-3 text-[0.78rem] text-[var(--text-muted)]">
                        항목
                      </th>
                      <th className="border-b border-[var(--border)] px-4 py-3 text-[0.78rem] text-[var(--text-muted)]">
                        수치
                      </th>
                      <th className="border-b border-[var(--border)] px-4 py-3 text-[0.78rem] text-[var(--text-muted)]">
                        적용 대상
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {post.keyData.map((item, index) => (
                      <tr
                        key={`${post.id}-keydata-${index}`}
                        className="border-b border-[var(--border)] last:border-b-0"
                      >
                        <td className="px-4 py-3 text-[0.92rem] leading-6 text-[var(--text-main)]">
                          {decodeHTMLEntities(item.항목)}
                        </td>
                        <td className="px-4 py-3 text-[0.92rem] font-bold leading-6 text-[var(--accent)]">
                          {decodeHTMLEntities(item.수치)}
                        </td>
                        <td className="px-4 py-3 text-[0.92rem] leading-6 text-[var(--text-muted)]">
                          {decodeHTMLEntities(item.적용대상)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          ) : null}

          {/* Legacy impact format */}
          {!sections && (post.regionalImpact || post.yieldImpact) ? (
            <section className="mt-10">
              <h2 className="mb-4 text-[0.8rem] font-extrabold uppercase tracking-[1px] text-[var(--accent)]">
                정책 영향 요약
              </h2>
              <div className="grid gap-4">
                {post.regionalImpact ? (
                  <div className="border-y border-[var(--border)] bg-slate-50 px-5 py-5">
                    <h3 className="text-[0.95rem] font-bold text-[var(--text-main)]">
                      지역·대상별 영향
                    </h3>
                    <p className="mt-3 text-[0.95rem] leading-7 text-[var(--text-muted)]">
                      {decodeHTMLEntities(post.regionalImpact)}
                    </p>
                  </div>
                ) : null}
                {post.yieldImpact ? (
                  <div className="border-y border-[var(--border)] bg-slate-50 px-5 py-5">
                    <h3 className="text-[0.95rem] font-bold text-[var(--text-main)]">
                      시장·수익률 관점
                    </h3>
                    <p className="mt-3 text-[0.95rem] leading-7 text-[var(--text-muted)]">
                      {decodeHTMLEntities(post.yieldImpact)}
                    </p>
                  </div>
                ) : null}
              </div>
            </section>
          ) : null}

          {post.checklist && post.checklist.length > 0 ? (
            <section className="mt-10">
              <h2 className="mb-4 text-[0.8rem] font-extrabold uppercase tracking-[1px] text-[var(--accent)]">
                확인 체크리스트
              </h2>
              <div className="space-y-3">
                {post.checklist.map((item, index) => (
                  <p
                    key={`${post.id}-checklist-${index}`}
                    className="border-l-4 border-[var(--accent)] bg-slate-50 px-4 py-4 text-[0.95rem] leading-7 text-[var(--text-main)]"
                  >
                    {decodeHTMLEntities(item)}
                  </p>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-10">
            <h2 className="mb-4 text-[0.8rem] font-extrabold uppercase tracking-[1px] text-[var(--accent)]">
              원문 확인
            </h2>
            <a
              href={post.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-white"
            >
              정부 원문 보기
            </a>
          </section>

          <section className="mt-10 border-y border-[var(--border)] bg-slate-50 px-5 py-5">
            <h2 className="text-[1rem] font-bold text-[var(--text-main)]">
              자료 이용 안내
            </h2>
            <p className="mt-2 text-[0.95rem] leading-7 text-[var(--text-muted)]">
              본문은 정책 이해를 돕기 위한 참고 자료입니다. 실제 거래, 신고, 대출, 청약
              판단은 원문 공고와 담당 기관의 최신 안내를 확인한 뒤 진행해야 합니다.
            </p>
          </section>
        </article>
      </main>
    </>
  );
}
