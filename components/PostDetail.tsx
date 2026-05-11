import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { CAT_NAMES } from "@/components/PostComponents";
import { DATA_SOURCES, POLICY_READING_CHECKLIST, SITE_PRINCIPLES } from "@/lib/editorial";
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

          <section className="mt-8 grid gap-4 border-y border-[var(--border)] py-6 md:grid-cols-3">
            <SourceFact label="기관명" value={post.source} />
            <SourceFact label="발표일" value={post.date} />
            <SourceFact label="분야" value={CAT_NAMES[post.cat] || post.catName || post.cat} />
          </section>

          <section className="mt-10 border-l-4 border-[var(--accent)] bg-slate-50 px-5 py-5">
            <h2 className="text-[0.82rem] font-extrabold uppercase tracking-[1px] text-[var(--accent)]">
              한 문장 요약
            </h2>
            <p className="mt-3 text-[1.05rem] leading-8 text-[var(--text-main)]">
              {buildOneSentence(post)}
            </p>
          </section>

          <section className="mt-10">
            <h2 className="mb-4 text-[1.2rem] font-bold text-[var(--text-main)]">
              핵심 내용 확인표
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {buildCoreFacts(post).map((item) => (
                <div key={item.label} className="border-y border-[var(--border)] bg-white py-4">
                  <h3 className="text-[0.84rem] font-black text-[var(--accent)]">{item.label}</h3>
                  <p className="mt-2 text-[0.96rem] leading-7 text-[var(--text-muted)]">{item.value}</p>
                </div>
              ))}
            </div>
          </section>

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
                원문에서 꼭 봐야 할 포인트
              </h2>
              <p className="border-y border-[var(--border)] px-5 py-5 text-[0.96rem] leading-7 text-[var(--text-muted)] whitespace-pre-wrap">
                {decodeHTMLEntities(post.evidenceText)}
              </p>
              <p className="mt-4 text-[0.96rem] leading-7 text-[var(--text-muted)]">
                이 문장은 정책의 적용 범위와 후속 조치 방향을 확인하는 기준입니다. 단, 원문 일부만으로
                최종 판단하지 말고 첨부자료, 세부 공고, 담당 기관 안내를 함께 확인해야 합니다.
              </p>
            </section>
          ) : null}

          {post.keyData && post.keyData.length > 0 ? (
            <section className="mt-10">
              <h2 className="mb-4 text-[0.8rem] font-extrabold uppercase tracking-[1px] text-[var(--accent)]">
                관련 지표로 보는 맥락
              </h2>
              <p className="mb-4 text-[0.96rem] leading-7 text-[var(--text-muted)]">
                아래 지표는 정책의 규모와 적용 대상을 이해하기 위한 단서입니다. 수치 자체보다
                이 지표가 어떤 대상과 절차를 설명하는지 함께 읽어야 합니다.
              </p>
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

          <section className="mt-10">
            <h2 className="mb-4 text-[1.2rem] font-bold text-[var(--text-main)]">
              이 정책이 중요한 이유
            </h2>
            <div className="space-y-4 text-[1.02rem] leading-8 text-[var(--text-muted)]">
              {buildImportance(post).map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="mb-4 text-[1.2rem] font-bold text-[var(--text-main)]">
              누가 봐야 하는 정책인가
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              {buildAudience(post).map((item) => (
                <div key={item.label} className="border-y border-[var(--border)] bg-slate-50 p-4">
                  <h3 className="text-[0.96rem] font-black text-[var(--text-main)]">{item.label}</h3>
                  <p className="mt-2 text-[0.94rem] leading-7 text-[var(--text-muted)]">{item.body}</p>
                </div>
              ))}
            </div>
          </section>

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
                수혜자·관계자별 체크리스트
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
            <h2 className="mb-4 text-[1.2rem] font-bold text-[var(--text-main)]">
              확인해야 할 한계와 주의사항
            </h2>
            <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
              {POLICY_READING_CHECKLIST.slice(1).map((item) => (
                <p key={item} className="py-4 text-[0.98rem] leading-8 text-[var(--text-muted)]">
                  {item}
                </p>
              ))}
            </div>
          </section>

          <section className="mt-10">
            <h2 className="mb-4 text-[0.8rem] font-extrabold uppercase tracking-[1px] text-[var(--accent)]">
              원문 및 관련 자료 확인
            </h2>
            <div className="grid gap-3 md:grid-cols-2">
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center justify-center bg-[var(--accent)] px-4 py-3 text-[0.92rem] font-bold text-white"
              >
                정부 원문 보기
              </a>
              {DATA_SOURCES.slice(0, 3).map((source) => (
                <div key={source.name} className="border-y border-[var(--border)] px-4 py-3">
                  <p className="text-[0.9rem] font-bold text-[var(--text-main)]">{source.name}</p>
                  <p className="mt-1 text-[0.85rem] leading-6 text-[var(--text-muted)]">
                    관련 지표 확인 시 참고하는 공개 자료 출처입니다.
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-10 border-y border-[var(--border)] bg-slate-50 px-5 py-5">
            <h2 className="text-[1rem] font-bold text-[var(--text-main)]">
              자료 이용 안내
            </h2>
            <p className="mt-2 text-[0.95rem] leading-7 text-[var(--text-muted)]">
              {SITE_PRINCIPLES[1]}
            </p>
          </section>
        </article>
      </main>
    </>
  );
}

function SourceFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[0.78rem] font-black uppercase tracking-[1px] text-[var(--accent)]">{label}</p>
      <p className="mt-2 text-[0.98rem] font-bold leading-7 text-[var(--text-main)]">{decodeHTMLEntities(value)}</p>
    </div>
  );
}

function buildOneSentence(post: FullPost): string {
  const summary = decodeHTMLEntities(post.summary[0] || post.evidenceText || post.headline);
  return `${post.source}가 ${post.date} 발표한 자료로, ${summary} 내용을 원문과 관련 지표 기준으로 확인해야 하는 정책입니다.`;
}

function buildCoreFacts(post: FullPost) {
  const firstMetric = post.keyData[0]
    ? `${decodeHTMLEntities(post.keyData[0].항목)} ${decodeHTMLEntities(post.keyData[0].수치)}`
    : "원문에 구조화된 정량 지표가 명확히 제시되지 않았습니다.";

  return [
    { label: "대상", value: post.keyData[0]?.적용대상 ? decodeHTMLEntities(post.keyData[0].적용대상) : "원문 본문과 첨부자료에서 세부 대상을 확인해야 합니다." },
    { label: "지원 내용", value: decodeHTMLEntities(post.summary[0] || "정책 발표의 핵심 내용을 원문 기준으로 확인해야 합니다.") },
    { label: "시행 시기", value: `${post.date} 발표 자료입니다. 실제 시행일과 신청 기간은 후속 공고에서 달라질 수 있습니다.` },
    { label: "예산 또는 규모", value: firstMetric },
    { label: "담당 기관", value: post.source },
    { label: "신청 또는 확인 방법", value: "원문 링크와 담당 기관 공고를 확인하고, 세부 접수 창구가 별도로 공지되는지 살펴야 합니다." },
  ];
}

function buildImportance(post: FullPost): string[] {
  const category = CAT_NAMES[post.cat] || post.catName || "정책";
  return [
    `${category} 자료는 발표 문구만으로 영향을 단정하기 어렵습니다. 대상, 시행 시기, 예산 또는 규모, 후속 공고가 어떻게 정리되는지에 따라 실제 체감 효과가 달라질 수 있습니다.`,
    post.regionalImpact
      ? decodeHTMLEntities(post.regionalImpact)
      : "정책의 의미는 기존 제도와 시장 상황 속에서 읽어야 합니다. 같은 지원 또는 규제라도 적용 지역, 대상자 범위, 행정 절차에 따라 결과가 달라집니다.",
    "따라서 이 자료는 원문 확인, 관련 지표 검토, 체크리스트 점검을 함께 진행할 때 가장 유용합니다.",
  ];
}

function buildAudience(post: FullPost) {
  const category = CAT_NAMES[post.cat] || post.catName || "정책";
  return [
    { label: "개인", body: "지원 대상, 신청 기간, 소득·자산·거주 요건처럼 내 상황에 직접 연결되는 조건을 확인해야 합니다." },
    { label: "사업자", body: "업종, 매출, 고용, 세금 체납 여부, 보증·융자 조건 등 실제 신청 가능성을 좌우하는 요건을 봐야 합니다." },
    { label: "부동산·금융 실무자", body: `${category} 변화가 거래, 대출, 보증, 세금, 지역별 수요에 어떤 확인 포인트를 만드는지 살펴볼 필요가 있습니다.` },
    { label: "지자체 및 공공기관 담당자", body: "중앙부처 발표와 지역별 집행 기준, 후속 공고, 예산 배정 여부를 연결해 확인할 수 있습니다." },
    { label: "연구자 또는 학생", body: "정책 원문, 발표일, 담당 기관, 관련 통계를 함께 확인해 보고서나 연구의 기초 자료로 활용할 수 있습니다." },
  ];
}
