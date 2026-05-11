import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Header from "@/components/Header";
import { EDITORIAL_COLUMNS, getColumnBySlug } from "@/lib/editorial";
import { loadFullPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";
import { decodeHTMLEntities } from "@/lib/utils";

export async function generateStaticParams() {
  return EDITORIAL_COLUMNS.map((column) => ({ slug: column.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const column = getColumnBySlug(slug);

  if (!column) {
    return { title: "칼럼을 찾을 수 없습니다 | PolicyRadar" };
  }

  const url = `${SITE_URL}/columns/${column.slug}`;

  return {
    title: `${column.title} | PolicyRadar`,
    description: column.summary,
    alternates: { canonical: url },
    openGraph: {
      title: `${column.title} | PolicyRadar`,
      description: column.summary,
      url,
      type: "article",
      locale: "ko_KR",
    },
  };
}

export default async function ColumnDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const column = getColumnBySlug(slug);

  if (!column) {
    notFound();
  }

  const posts = (await loadFullPosts()).slice(0, 3);

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white px-5 py-12">
        <article className="mx-auto max-w-4xl">
          <div className="mb-8 flex flex-wrap items-center gap-3 text-[0.82rem] text-[var(--text-muted)]">
            <Link href="/columns" className="font-bold text-[var(--accent)] underline underline-offset-4">
              칼럼 목록
            </Link>
            <span>{column.category}</span>
            <span>{column.date}</span>
          </div>

          <h1 className="text-[2rem] font-black leading-tight text-slate-950 sm:text-[2.45rem]">
            {column.title}
          </h1>
          <p className="mt-5 text-[1.04rem] leading-8 text-slate-700">{column.summary}</p>

          <section className="mt-9 border-y border-[var(--border)] bg-slate-50 px-5 py-5">
            <h2 className="text-[0.82rem] font-extrabold uppercase tracking-[1px] text-[var(--accent)]">
              핵심 요약 3줄
            </h2>
            <div className="mt-4 grid gap-3">
              {column.takeaways.map((item) => (
                <p key={item} className="border-l-4 border-[var(--accent)] bg-white px-4 py-3 text-[0.96rem] leading-7 text-slate-800">
                  {item}
                </p>
              ))}
            </div>
          </section>

          {column.sections.map((section) => (
            <section key={section.title} className="mt-10">
              <h2 className="text-[1.3rem] font-black text-slate-950">{section.title}</h2>
              <div className="mt-4 space-y-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-[1rem] leading-8 text-slate-700">
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>
          ))}

          <section className="mt-10 border-y border-[var(--border)] p-5">
            <h2 className="text-[1.2rem] font-black text-slate-950">실제 정책 자료에 적용하는 예시</h2>
            <p className="mt-3 text-[1rem] leading-8 text-slate-700">{column.example}</p>
          </section>

          <section className="mt-10 border-y border-[var(--border)] bg-slate-50 p-5">
            <h2 className="text-[1.2rem] font-black text-slate-950">주의사항</h2>
            <p className="mt-3 text-[1rem] leading-8 text-slate-700">{column.caution}</p>
          </section>

          <section className="mt-10">
            <h2 className="text-[1.2rem] font-black text-slate-950">마무리 요약</h2>
            <p className="mt-3 text-[1rem] leading-8 text-slate-700">{column.closing}</p>
          </section>

          <section className="mt-10">
            <h2 className="text-[1.2rem] font-black text-slate-950">관련 정책 분석 글</h2>
            <div className="mt-4 divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  href={`/${post.post_type || "insight"}/${post.id}`}
                  className="block py-4"
                >
                  <p className="text-[0.82rem] font-bold text-slate-500">
                    {post.source} · {post.date}
                  </p>
                  <p className="mt-1 font-black leading-7 text-slate-950">
                    {decodeHTMLEntities(post.headline)}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        </article>
      </main>
    </>
  );
}
