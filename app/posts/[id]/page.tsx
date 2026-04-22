import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Header from "@/components/Header";
import { CAT_NAMES } from "@/components/PostComponents";
import { getFullPostById, loadFullPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";
import { decodeHTMLEntities } from "@/lib/utils";

export async function generateStaticParams() {
  const posts = await loadFullPosts();

  return posts.map((post) => ({
    id: post.id,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const post = await getFullPostById(id);

  if (!post) {
    return {
      title: "정책을 찾을 수 없습니다 | 폴리시레이더",
    };
  }

  const title = `${decodeHTMLEntities(post.headline)} | 폴리시레이더`;
  const description = decodeHTMLEntities(
    post.summary.join(" ").slice(0, 160) || post.evidenceText || ""
  );
  const url = `${SITE_URL}/posts/${post.id}`;

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description,
      url,
      type: "article",
      locale: "ko_KR",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function PostDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getFullPostById(id);

  if (!post) {
    notFound();
  }

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

        <span className={`cat-${post.cat} inline-flex rounded-md px-2.5 py-1 text-[0.68rem] font-extrabold uppercase tracking-[0.5px]`}>
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

        <section className="mt-10">
          <h2 className="mb-4 text-[0.8rem] font-extrabold uppercase tracking-[1px] text-[var(--accent)]">
            핵심 정책 요약
          </h2>
          <div className="space-y-3">
            {post.summary.map((summary, index) => (
              <p
                key={`${post.id}-summary-${index}`}
                className="border-l-4 border-[var(--accent)] bg-rose-50 px-4 py-4 text-[0.98rem] leading-7 text-[var(--text-main)]"
              >
                {decodeHTMLEntities(summary)}
              </p>
            ))}
          </div>
        </section>

        {post.evidenceText ? (
          <section className="mt-10">
            <h2 className="mb-4 text-[0.8rem] font-extrabold uppercase tracking-[1px] text-[var(--text-muted)]">
              공개 근거 문장
            </h2>
            <p className="border-y border-[var(--border)] px-5 py-5 text-[0.96rem] leading-7 text-[var(--text-muted)]">
              {decodeHTMLEntities(post.evidenceText)}
            </p>
          </section>
        ) : null}

        {post.keyData.length > 0 ? (
          <section className="mt-10">
            <h2 className="mb-4 text-[0.8rem] font-extrabold uppercase tracking-[1px] text-[var(--accent)]">
              공개 지표 정리
            </h2>
            <div className="overflow-x-auto border border-[var(--border)]">
              <table className="w-full min-w-[560px] border-collapse">
                <thead>
                  <tr className="bg-[var(--accent-soft)]/20 text-left">
                    <th className="border-b border-[var(--border)] px-4 py-3 text-[0.78rem] text-[var(--text-muted)]">항목</th>
                    <th className="border-b border-[var(--border)] px-4 py-3 text-[0.78rem] text-[var(--text-muted)]">수치</th>
                    <th className="border-b border-[var(--border)] px-4 py-3 text-[0.78rem] text-[var(--text-muted)]">적용 대상</th>
                  </tr>
                </thead>
                <tbody>
                  {post.keyData.map((item, index) => (
                    <tr key={`${post.id}-keydata-${index}`} className="border-b border-[var(--border)] last:border-b-0">
                      <td className="px-4 py-3 text-[0.92rem] leading-6 text-[var(--text-main)]">{decodeHTMLEntities(item.항목)}</td>
                      <td className="px-4 py-3 text-[0.92rem] font-bold leading-6 text-[var(--accent)]">{decodeHTMLEntities(item.수치)}</td>
                      <td className="px-4 py-3 text-[0.92rem] leading-6 text-[var(--text-muted)]">{decodeHTMLEntities(item.적용대상)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}

        {post.regionalImpact || post.yieldImpact ? (
          <section className="mt-10">
            <h2 className="mb-4 text-[0.8rem] font-extrabold uppercase tracking-[1px] text-[var(--accent)]">
              정책 영향 요약
            </h2>
            <div className="grid gap-4">
              {post.regionalImpact ? (
                <div className="border-y border-[var(--border)] bg-slate-50 px-5 py-5">
                  <h3 className="text-[0.95rem] font-bold text-[var(--text-main)]">지역·대상별 영향</h3>
                  <p className="mt-3 text-[0.95rem] leading-7 text-[var(--text-muted)]">
                    {decodeHTMLEntities(post.regionalImpact)}
                  </p>
                </div>
              ) : null}
              {post.yieldImpact ? (
                <div className="border-y border-[var(--border)] bg-slate-50 px-5 py-5">
                  <h3 className="text-[0.95rem] font-bold text-[var(--text-main)]">시장·수익률 관점</h3>
                  <p className="mt-3 text-[0.95rem] leading-7 text-[var(--text-muted)]">
                    {decodeHTMLEntities(post.yieldImpact)}
                  </p>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {post.checklist.length > 0 ? (
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
            본문은 정책 이해를 돕기 위한 참고 자료입니다. 실제 거래, 신고, 대출, 청약 판단은 원문 공고와 담당 기관의 최신 안내를 확인한 뒤 진행해야 합니다.
          </p>
        </section>
      </article>
    </main>
    </>
  );
}
