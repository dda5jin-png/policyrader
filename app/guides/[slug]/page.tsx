import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import Header from "@/components/Header";
import { GUIDES, getGuideBySlug } from "@/lib/guides";
import { SITE_URL } from "@/lib/site";

export async function generateStaticParams() {
  return GUIDES.map((guide) => ({
    slug: guide.slug,
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    return {
      title: "가이드를 찾을 수 없습니다 | 폴리시레이더",
    };
  }

  const url = `${SITE_URL}/guides/${guide.slug}`;

  return {
    title: `${guide.title} | 폴리시레이더`,
    description: guide.description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title: `${guide.title} | 폴리시레이더`,
      description: guide.description,
      url,
      type: "article",
      locale: "ko_KR",
    },
    twitter: {
      card: "summary_large_image",
      title: `${guide.title} | 폴리시레이더`,
      description: guide.description,
    },
  };
}

export default async function GuideDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const guide = getGuideBySlug(slug);

  if (!guide) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-white px-5 py-12">
      <article className="mx-auto max-w-4xl">
        <div className="mb-8 flex flex-wrap items-center gap-3 text-[0.82rem] text-[var(--text-muted)]">
          <Link
            href="/guides"
            className="font-bold text-[var(--accent)] underline underline-offset-4"
          >
            가이드 목록
          </Link>
          <span>기준일 {guide.updatedAt}</span>
          <span>{guide.readingTime}</span>
        </div>

        <div className="text-[0.78rem] font-black uppercase tracking-[1px] text-[var(--accent)]">
          {guide.eyebrow}
        </div>
        <h1 className="mt-4 text-[2rem] font-black leading-tight text-[var(--text-main)] sm:text-[2.45rem]">
          {guide.title}
        </h1>
        <p className="mt-5 text-[1.02rem] leading-8 text-[var(--text-muted)]">
          {guide.summary}
        </p>

        <section className="mt-9 border-y border-[var(--border)] bg-[var(--accent-soft)] px-5 py-5">
          <h2 className="text-[0.82rem] font-extrabold uppercase tracking-[1px] text-[var(--accent)]">
            먼저 기억할 것
          </h2>
          <div className="mt-4 grid gap-3">
            {guide.keyTakeaways.map((item) => (
              <p
                key={item}
                className="border-l-4 border-[var(--accent)] bg-white px-4 py-3 text-[0.95rem] leading-7 text-[var(--text-main)]"
              >
                {item}
              </p>
            ))}
          </div>
        </section>

        {guide.sections.map((section) => (
          <section key={section.title} className="mt-10">
            <h2 className="text-[1.25rem] font-black text-[var(--text-main)]">
              {section.title}
            </h2>
            <div className="mt-4 space-y-4">
              {section.body.map((paragraph) => (
                <p
                  key={paragraph}
                  className="text-[0.98rem] leading-8 text-[var(--text-muted)]"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}

        <section className="mt-10">
          <h2 className="text-[1.25rem] font-black text-[var(--text-main)]">
            확인 체크리스트
          </h2>
          <div className="mt-4 space-y-3">
            {guide.checklist.map((item) => (
              <p
                key={item}
                className="border-l-4 border-[var(--accent)] bg-slate-50 px-4 py-4 text-[0.95rem] leading-7 text-[var(--text-main)]"
              >
                {item}
              </p>
            ))}
          </div>
        </section>

        <section className="mt-10 grid gap-5 md:grid-cols-2">
          <ReferenceBlock title="법령 근거" references={guide.legalRefs} />
          <ReferenceBlock title="공식 자료" references={guide.officialRefs} />
        </section>

        <section className="mt-10 border-y border-[var(--border)] bg-slate-50 p-5">
          <h2 className="text-[1rem] font-bold text-[var(--text-main)]">
            안내
          </h2>
          <p className="mt-2 text-[0.92rem] leading-7 text-[var(--text-muted)]">
            이 글은 정책 이해를 돕기 위한 공개 가이드이며 세무·법률·대출 자문이 아닙니다.
            실제 신고, 대출 신청, 임대차 계약 전에는 담당 기관의 최신 공고와 전문가 상담을 확인하세요.
          </p>
        </section>
      </article>
    </main>
    </>
  );
}

function ReferenceBlock({
  title,
  references,
}: {
  title: string;
  references: Array<{ label: string; href: string; note: string }>;
}) {
  return (
    <div className="border-y border-[var(--border)] bg-slate-50 p-5">
      <h2 className="text-[0.82rem] font-extrabold uppercase tracking-[1px] text-[var(--accent)]">
        {title}
      </h2>
      <div className="mt-4 space-y-4">
        {references.map((reference) => (
          <div key={reference.href}>
            <a
              href={reference.href}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-[var(--text-main)] underline decoration-[var(--accent)] underline-offset-4"
            >
              {reference.label}
            </a>
            <p className="mt-2 text-[0.9rem] leading-6 text-[var(--text-muted)]">
              {reference.note}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
