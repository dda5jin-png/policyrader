import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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
    <main className="min-h-screen bg-[var(--primary)] px-5 py-12">
      <article className="mx-auto max-w-4xl rounded-[28px] border border-[var(--border)] bg-[var(--card-bg)] p-6 shadow-[var(--shadow-lg)] sm:p-10">
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

        <p className="mt-6 text-[1rem] leading-7 text-[var(--text-muted)]">
          폴리시레이더는 정부 보도자료 핵심 내용을 공개 요약으로 제공하고, 추가 분석은 회원 기능으로 분리합니다.
        </p>

        <section className="mt-10">
          <h2 className="mb-4 text-[0.8rem] font-extrabold uppercase tracking-[1px] text-[var(--accent)]">
            핵심 정책 요약
          </h2>
          <div className="space-y-3">
            {post.summary.map((summary, index) => (
              <p
                key={`${post.id}-summary-${index}`}
                className="rounded-2xl border border-[var(--border)] bg-[var(--accent-soft)]/20 px-4 py-4 text-[0.98rem] leading-7 text-[var(--text-main)]"
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
            <p className="rounded-2xl border border-[var(--border)] px-5 py-5 text-[0.96rem] leading-7 text-[var(--text-muted)]">
              {decodeHTMLEntities(post.evidenceText)}
            </p>
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
            className="inline-flex rounded-xl bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-white"
          >
            정부 원문 보기
          </a>
        </section>

        <section className="mt-10 rounded-2xl border border-[var(--border)] bg-black/10 px-5 py-5">
          <h2 className="text-[1rem] font-bold text-[var(--text-main)]">
            회원 기능 안내
          </h2>
          <p className="mt-2 text-[0.95rem] leading-7 text-[var(--text-muted)]">
            상세 영향 분석, 체크리스트, 서고 저장, PDF 출력은 로그인 후 이용할 수 있습니다.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/signup?next=/posts/${post.id}`}
              className="rounded-xl bg-[var(--accent)] px-4 py-3 text-[0.88rem] font-bold text-white"
            >
              회원가입
            </Link>
            <Link
              href={`/login?next=/posts/${post.id}`}
              className="rounded-xl border border-[var(--border)] px-4 py-3 text-[0.88rem] font-bold text-[var(--text-main)]"
            >
              로그인
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
