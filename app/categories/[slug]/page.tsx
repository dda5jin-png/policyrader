import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Header from "@/components/Header";
import { CATEGORY_GUIDES, getCategoryGuideBySlug, SITE_PRINCIPLES } from "@/lib/editorial";
import { loadFullPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";
import { decodeHTMLEntities } from "@/lib/utils";

export async function generateStaticParams() {
  return CATEGORY_GUIDES.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryGuideBySlug(slug);

  if (!category) {
    return { title: "분야를 찾을 수 없습니다 | PolicyRadar" };
  }

  const url = `${SITE_URL}/categories/${category.slug}`;
  const description = `${category.label} 정책 원문, 관련 지표, 체크리스트를 함께 확인할 수 있는 분야별 정책 아카이브입니다.`;

  return {
    title: `${category.label} 정책 원문과 지표 해설 | PolicyRadar`,
    description,
    alternates: { canonical: url },
    openGraph: {
      title: `${category.label} 정책 원문과 지표 해설 | PolicyRadar`,
      description,
      url,
      type: "website",
      locale: "ko_KR",
    },
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const category = getCategoryGuideBySlug(slug);

  if (!category) {
    notFound();
  }

  const posts = (await loadFullPosts())
    .filter((post) => category.keys.includes(post.cat))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 24);

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-5 py-14">
        <p className="text-[0.78rem] font-bold uppercase text-[var(--accent)]">Policy Category</p>
        <h1 className="mt-3 text-[2.1rem] font-black leading-tight text-slate-950">
          {category.label} 정책
        </h1>
        <div className="mt-5 max-w-3xl space-y-4 text-[1rem] leading-8 text-slate-700">
          {category.description.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>

        <section className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["원문 기준", "정책 발표 기관과 원문 링크를 기준으로 내용을 확인합니다."],
            ["지표 연결", "정책 배경을 설명하는 공개 통계와 시장 지표를 함께 봅니다."],
            ["체크리스트", "대상, 시기, 예산, 담당 기관, 후속 공고 여부를 분리해 봅니다."],
          ].map(([title, body]) => (
            <div key={title} className="border-y border-[var(--border)] bg-slate-50 p-5">
              <h2 className="font-black text-slate-950">{title}</h2>
              <p className="mt-2 text-[0.95rem] leading-7 text-slate-700">{body}</p>
            </div>
          ))}
        </section>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="text-[1.5rem] font-black text-slate-950">최신 {category.label} 정책 분석</h2>
              <p className="mt-2 text-[0.95rem] text-slate-600">최신순 {posts.length}건</p>
            </div>
            <Link href="/" className="text-[0.92rem] font-bold text-[var(--accent)] underline">
              전체 정책 보기
            </Link>
          </div>

          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/${post.post_type || "insight"}/${post.id}`}
                className="border-y border-[var(--border)] bg-white py-5"
              >
                <p className="text-[0.78rem] font-bold text-slate-500">
                  {post.source} · {post.date}
                </p>
                <h3 className="mt-2 text-[1.05rem] font-black leading-7 text-slate-950">
                  {decodeHTMLEntities(post.headline)}
                </h3>
                <p className="mt-3 line-clamp-3 text-[0.94rem] leading-7 text-slate-600">
                  {decodeHTMLEntities(post.summary[0] || post.evidenceText || "")}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12 border-y border-[var(--border)] bg-slate-50 p-5">
          <h2 className="text-[1.1rem] font-black text-slate-950">참고 안내</h2>
          <p className="mt-3 text-[0.96rem] leading-7 text-slate-700">{SITE_PRINCIPLES[1]}</p>
        </section>
      </main>
    </>
  );
}
