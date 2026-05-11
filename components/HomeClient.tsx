'use client';

import React from 'react';
import Link from 'next/link';

import Header from '@/components/Header';
import { useAuth } from '@/components/AuthProvider';
import { CAT_NAMES } from '@/components/PostComponents';
import { CATEGORY_GUIDES, DATA_SOURCES, EDITORIAL_COLUMNS, POLICY_READING_CHECKLIST, SITE_PRINCIPLES } from '@/lib/editorial';
import type { FullPost } from '@/lib/posts';
import { decodeHTMLEntities } from '@/lib/utils';

const CATEGORY_ITEMS = [
  { key: 'all', label: '전체' },
  { key: 'F', label: '부동산 금융' },
  { key: 'T', label: '부동산 거래' },
  { key: 'X', label: '부동산 세금' },
  { key: 'S', label: '공급·개발' },
  { key: 'R', label: '임대·주거' },
  { key: 'P', label: '프롭테크' },
];

const FEATURE_ITEMS = [
  {
    title: '원문 기반 핵심 요약',
    body: '정책명, 발표 기관, 발표일, 원문 링크를 기준으로 핵심 내용과 확인해야 할 항목을 분리합니다.',
  },
  {
    title: '관련 지표와 데이터 맥락',
    body: '통계청, 한국은행, 한국부동산원 등 공개 지표를 연결해 정책이 나온 배경과 변화 가능성을 설명합니다.',
  },
  {
    title: '실무형 체크리스트',
    body: '대상 여부, 신청 시기, 후속 공고, 지역별 차이, 담당 기관 확인 필요성을 체크리스트로 정리합니다.',
  },
];

export default function HomeClient({ initialPosts }: { initialPosts: FullPost[] }) {
  const [selectedCategory, setSelectedCategory] = React.useState('all');
  const [selectedId, setSelectedId] = React.useState(initialPosts[0]?.id ?? '');
  const [mobileDetailOpen, setMobileDetailOpen] = React.useState(false);

  const filteredPosts = React.useMemo(() => {
    const result =
      selectedCategory === 'all'
        ? initialPosts
        : initialPosts.filter((post) => post.cat === selectedCategory);

    return [...result].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [initialPosts, selectedCategory]);

  const selectedPost =
    filteredPosts.find((post) => post.id === selectedId) ??
    filteredPosts[0] ??
    initialPosts[0];

  React.useEffect(() => {
    if (filteredPosts.length > 0 && !filteredPosts.some((post) => post.id === selectedId)) {
      setSelectedId(filteredPosts[0].id);
    }
  }, [filteredPosts, selectedId]);

  const selectPost = (id: string) => {
    setSelectedId(id);
    setMobileDetailOpen(true);
  };

  const latestPosts = React.useMemo(
    () => [...initialPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 9),
    [initialPosts],
  );

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Header />
      <main>
        <section className="border-b border-[var(--border)] bg-white">
          <div className="mx-auto grid max-w-[1320px] gap-8 px-5 py-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-16">
            <div>
              <p className="text-[0.76rem] font-bold uppercase text-[var(--accent)]">
                Policy Research Archive
              </p>
              <h1 className="mt-3 max-w-4xl text-[2.1rem] font-black leading-tight sm:text-[3rem]">
                정책 원문을 읽고, 관련 지표로 흐름을 해석합니다.
              </h1>
              <p className="mt-5 max-w-3xl text-[1.03rem] leading-8 text-slate-700">
                PolicyRadar는 정부·공공기관의 원문 자료를 바탕으로 정책의 핵심 내용,
                관련 통계, 기대효과, 확인해야 할 쟁점을 정리하는 정책 정보 아카이브입니다.
              </p>
              <p className="mt-4 max-w-3xl text-[0.98rem] leading-8 text-slate-600">
                단순 요약보다 원문 확인 가능성과 지표 기반 해석을 우선합니다. 모든 정책 정보는
                원문 링크를 함께 제공하며, 해석은 공개 자료와 관련 통계에 근거해 작성됩니다.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                <a href="#latest-analysis" className="inline-flex h-12 items-center justify-center bg-slate-950 px-5 text-[0.92rem] font-bold text-white">
                  최신 정책 분석 보기
                </a>
                <Link href="/usage-guide" className="inline-flex h-12 items-center justify-center border border-slate-300 px-5 text-[0.92rem] font-bold text-slate-900">
                  정책 읽는 법 보기
                </Link>
              </div>
            </div>
            <div className="border-y border-[var(--border)] bg-slate-50 p-5">
              <h2 className="text-[1.1rem] font-black text-slate-950">공공자료 기반 확인 원칙</h2>
              <div className="mt-4 divide-y divide-slate-200">
                {POLICY_READING_CHECKLIST.slice(0, 5).map((item) => (
                  <p key={item} className="py-3 text-[0.95rem] leading-7 text-slate-700">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-[var(--border)] bg-slate-50">
          <div className="mx-auto grid max-w-[1320px] gap-5 px-5 py-10 md:grid-cols-3 lg:px-8">
            {FEATURE_ITEMS.map((item) => (
              <div key={item.title} className="border-y border-[var(--border)] bg-white p-5">
                <h2 className="text-[1.1rem] font-black text-slate-950">{item.title}</h2>
                <p className="mt-3 text-[0.96rem] leading-7 text-slate-700">{item.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="latest-analysis" className="mx-auto max-w-[1320px] px-5 py-12 lg:px-8">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[0.78rem] font-bold uppercase text-[var(--accent)]">Latest Analysis</p>
              <h2 className="mt-2 text-[1.8rem] font-black text-slate-950">최신 정책 분석</h2>
              <p className="mt-2 max-w-2xl text-[0.98rem] leading-7 text-slate-600">
                발표 기관, 발표일, 분야, 핵심 요약을 함께 확인하고 상세 페이지에서 원문과 지표를 이어서 볼 수 있습니다.
              </p>
            </div>
          </div>
          <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {latestPosts.map((post) => (
              <Link key={post.id} href={`/${post.post_type || 'insight'}/${post.id}`} className="border-y border-[var(--border)] bg-white py-5">
                <p className="text-[0.78rem] font-bold text-slate-500">
                  {post.source} · {post.date} · {CAT_NAMES[post.cat] || post.catName || post.cat}
                </p>
                <h3 className="mt-2 text-[1.08rem] font-black leading-7 text-slate-950">
                  {decodeHTMLEntities(post.headline)}
                </h3>
                <p className="mt-3 line-clamp-3 text-[0.94rem] leading-7 text-slate-600">
                  {decodeHTMLEntities(post.summary.slice(0, 2).join(' '))}
                </p>
              </Link>
            ))}
          </div>
        </section>

        <section className="border-y border-[var(--border)] bg-slate-50">
          <div className="mx-auto max-w-[1320px] px-5 py-12 lg:px-8">
            <p className="text-[0.78rem] font-bold uppercase text-[var(--accent)]">Categories</p>
            <h2 className="mt-2 text-[1.8rem] font-black text-slate-950">분야별 정책 보기</h2>
            <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              {CATEGORY_GUIDES.map((category) => (
                <Link key={category.slug} href={`/categories/${category.slug}`} className="border-y border-[var(--border)] bg-white p-5">
                  <h3 className="text-[1.08rem] font-black text-slate-950">{category.label}</h3>
                  <p className="mt-3 line-clamp-5 text-[0.93rem] leading-7 text-slate-600">
                    {category.description.join(' ')}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-[1320px] gap-8 px-5 py-12 lg:grid-cols-[0.85fr_1.15fr] lg:px-8">
          <div>
            <p className="text-[0.78rem] font-bold uppercase text-[var(--accent)]">Reading Guide</p>
            <h2 className="mt-2 text-[1.8rem] font-black text-slate-950">정책 읽는 법</h2>
            <p className="mt-4 text-[0.98rem] leading-8 text-slate-700">
              정책 원문을 볼 때는 지원 대상, 시행 시기, 예산, 담당 기관, 신청 방법, 후속 공고 여부를
              나누어 확인해야 합니다. 보도자료의 기대효과는 정책 목표에 가깝기 때문에 실제 판단 전
              원문과 담당 기관 공고를 함께 확인하는 과정이 필요합니다.
            </p>
            <Link href="/usage-guide" className="mt-5 inline-flex font-bold text-[var(--accent)] underline">
              이용 가이드 보기
            </Link>
          </div>
          <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {POLICY_READING_CHECKLIST.map((item) => (
              <p key={item} className="py-4 text-[0.98rem] leading-7 text-slate-700">{item}</p>
            ))}
          </div>
        </section>

        <section className="border-y border-[var(--border)] bg-slate-50">
          <div className="mx-auto max-w-[1320px] px-5 py-12 lg:px-8">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[0.78rem] font-bold uppercase text-[var(--accent)]">Editorial</p>
                <h2 className="mt-2 text-[1.8rem] font-black text-slate-950">최근 해설 칼럼</h2>
              </div>
              <Link href="/columns" className="font-bold text-[var(--accent)] underline">전체 칼럼 보기</Link>
            </div>
            <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {EDITORIAL_COLUMNS.slice(0, 6).map((column) => (
                <Link key={column.slug} href={`/columns/${column.slug}`} className="border-y border-[var(--border)] bg-white p-5">
                  <p className="text-[0.78rem] font-bold text-[var(--accent)]">{column.category} · {column.date}</p>
                  <h3 className="mt-2 text-[1.08rem] font-black leading-7 text-slate-950">{column.title}</h3>
                  <p className="mt-3 text-[0.94rem] leading-7 text-slate-600">{column.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1320px] px-5 py-12 lg:px-8">
          <p className="text-[0.78rem] font-bold uppercase text-[var(--accent)]">Sources</p>
          <h2 className="mt-2 text-[1.8rem] font-black text-slate-950">데이터 출처와 분석 기준</h2>
          <div className="mt-7 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {DATA_SOURCES.map((source) => (
              <div key={source.name} className="border-y border-[var(--border)] py-5">
                <h3 className="font-black text-slate-950">{source.name}</h3>
                <p className="mt-2 text-[0.93rem] leading-7 text-slate-600">{source.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 border-y border-[var(--border)] bg-slate-50 p-5 text-[0.95rem] leading-7 text-slate-700">
            <p>{SITE_PRINCIPLES[1]}</p>
          </div>
        </section>

        <div className="mx-auto max-w-[1320px] px-5 py-12 lg:px-8">
          <div className="mb-6">
            <p className="text-[0.78rem] font-bold uppercase text-[var(--accent)]">Archive</p>
            <h2 className="mt-2 text-[1.8rem] font-black text-slate-950">정책 원문 아카이브</h2>
            <p className="mt-2 max-w-3xl text-[0.98rem] leading-7 text-slate-600">
              기존 정책 카드, 원문 링크, 관련 지표, 체크리스트, PDF 출력 기능은 유지했습니다.
              분야를 선택하면 해당 정책만 필터링해 볼 수 있습니다.
            </p>
          </div>
          <CategorySlicer
            selectedCategory={selectedCategory}
            onSelect={(category) => {
              setSelectedCategory(category);
              setMobileDetailOpen(false);
            }}
            posts={initialPosts}
          />

          <div className="mt-5 lg:grid lg:grid-cols-[410px_minmax(0,1fr)] lg:gap-7">
            <div className={mobileDetailOpen ? 'hidden lg:block' : 'block'}>
              <PolicyList
                posts={filteredPosts}
                selectedId={selectedPost?.id}
                onSelect={selectPost}
              />
            </div>

            {selectedPost ? (
              <div className={mobileDetailOpen ? 'block' : 'hidden lg:block'}>
                <PolicyDetail
                  post={selectedPost}
                  onBack={() => setMobileDetailOpen(false)}
                />
              </div>
            ) : null}
          </div>
        </div>
      </main>
    </div>
  );
}

function CategorySlicer({
  selectedCategory,
  onSelect,
  posts,
}: {
  selectedCategory: string;
  onSelect: (category: string) => void;
  posts: FullPost[];
}) {
  return (
    <section className="sticky top-[65px] z-30 border-b border-[var(--border)] bg-white/95 py-3 backdrop-blur">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORY_ITEMS.map((category) => {
          const count =
            category.key === 'all'
              ? posts.length
              : posts.filter((post) => post.cat === category.key).length;
          const active = selectedCategory === category.key;

          return (
            <button
              key={category.key}
              type="button"
              onClick={() => onSelect(category.key)}
              className={`h-11 flex-none border px-4 text-[0.88rem] font-bold transition ${
                active
                  ? 'border-slate-950 bg-slate-950 text-white'
                  : 'border-slate-300 bg-white text-slate-700 hover:border-slate-950'
              }`}
            >
              {category.label}
              <span className={`ml-2 text-[0.75rem] ${active ? 'text-slate-300' : 'text-slate-400'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function PolicyList({
  posts,
  selectedId,
  onSelect,
}: {
  posts: FullPost[];
  selectedId?: string;
  onSelect: (id: string) => void;
}) {
  if (posts.length === 0) {
    return (
      <section className="border-y border-[var(--border)] bg-white p-8 text-center text-slate-600">
        선택한 분야의 정책자료가 없습니다.
      </section>
    );
  }

  return (
    <section aria-label="정책자료 목록" className="lg:sticky lg:top-[132px]">
      <div className="mb-3 flex items-center justify-between text-[0.85rem] text-slate-500">
        <span className="font-bold text-slate-800">정책자료 {posts.length}건</span>
        <span>최신순</span>
      </div>
      <div className="divide-y divide-[var(--border)] border-y border-[var(--border)] bg-white lg:max-h-[calc(100vh-155px)] lg:overflow-y-auto">
        {posts.map((post) => (
          <PolicyListItem
            key={post.id}
            post={post}
            selected={selectedId === post.id}
            onSelect={onSelect}
          />
        ))}
      </div>
    </section>
  );
}

function PolicyListItem({
  post,
  selected,
  onSelect,
}: {
  post: FullPost;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(post.id)}
      className={`block w-full px-4 py-5 text-left transition lg:px-0 ${
        selected ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2 text-[0.75rem] font-bold text-slate-500">
        <span>{post.source}</span>
        <span aria-hidden="true">/</span>
        <span>{post.date}</span>
        <span className="border border-slate-200 px-2 py-0.5 text-slate-700">
          {CAT_NAMES[post.cat] || post.catName || post.cat}
        </span>
      </div>
      <h2 className="mt-2 text-[1.05rem] font-black leading-snug text-slate-950">
        {decodeHTMLEntities(post.headline)}
      </h2>
      <p className="mt-2 line-clamp-2 text-[0.92rem] leading-6 text-slate-600">
        {decodeHTMLEntities(post.summary[0] || post.evidenceText || '')}
      </p>
    </button>
  );
}

function PolicyDetail({ post, onBack }: { post: FullPost; onBack: () => void }) {
  const { user } = useAuth();
  const [saveMessage, setSaveMessage] = React.useState<string | null>(null);
  const [savePending, setSavePending] = React.useState(false);

  React.useEffect(() => {
    setSaveMessage(null);
    setSavePending(false);
  }, [post.id]);

  const detailUrl = typeof window === 'undefined' ? `/${post.post_type || "insight"}/${post.id}` : `${window.location.origin}/${post.post_type || "insight"}/${post.id}`;

  const copyLink = async () => {
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(detailUrl);
      setSaveMessage('링크가 복사되었습니다.');
      return;
    }

    window.prompt('아래 링크를 복사하세요.', detailUrl);
  };

  const savePost = async () => {
    if (!user) {
      window.location.assign(`/login?next=${encodeURIComponent('/')}`);
      return;
    }

    setSavePending(true);
    setSaveMessage(null);

    try {
      const response = await fetch('/api/library/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ postId: post.id }),
      });

      if (!response.ok) {
        throw new Error('save_failed');
      }

      setSaveMessage('서고에 저장되었습니다.');
    } catch {
      setSaveMessage('서고 저장 중 오류가 발생했습니다.');
    } finally {
      setSavePending(false);
    }
  };

  return (
    <article className="bg-white lg:border-l lg:border-[var(--border)] lg:pl-7">
      <div className="sticky top-0 z-40 -mx-5 flex min-h-16 items-center gap-3 border-b border-[var(--border)] bg-white px-5 lg:hidden">
        <button type="button" onClick={onBack} className="h-11 min-w-11 border border-slate-300 font-bold text-slate-800">
          ←
        </button>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[0.82rem] font-bold text-slate-500">{post.source}</p>
          <h2 className="truncate text-[0.96rem] font-black text-slate-950">{decodeHTMLEntities(post.headline)}</h2>
        </div>
        <button type="button" onClick={() => void copyLink()} className="h-11 min-w-11 border border-slate-300 text-[0.8rem] font-bold text-slate-800">
          공유
        </button>
      </div>

      <header className="border-b border-[var(--border)] py-7">
        <div className="flex flex-wrap items-center gap-2 text-[0.78rem] font-bold text-slate-500">
          <span>{post.source}</span>
          <span>발표일 {post.date}</span>
          <span>업데이트 {post.date}</span>
          <span className="border border-slate-200 px-2 py-1 text-slate-700">
            {CAT_NAMES[post.cat] || post.catName}
          </span>
        </div>
        <h1 className="mt-4 max-w-4xl text-[1.9rem] font-black leading-tight text-slate-950 sm:text-[2.3rem]">
          {decodeHTMLEntities(post.headline)}
        </h1>
        <ActionBar
          post={post}
          savePending={savePending}
          onCopyLink={() => void copyLink()}
          onPrint={() => window.print()}
          onSave={() => void savePost()}
        />
        {saveMessage ? (
          <p className="mt-3 text-[0.86rem] font-bold text-slate-600">{saveMessage}</p>
        ) : null}
      </header>

      <div className="max-w-4xl space-y-11 py-8">
        <Section title="정책 개요">
          <p>{buildOverview(post)}</p>
        </Section>

        <Section title="핵심 요약">
          <div className="space-y-3">
            {post.summary.map((summary, index) => (
              <div key={`${post.id}-summary-${index}`} className="border-l-4 border-[var(--accent)] bg-rose-50 px-4 py-4">
                <p className="text-[0.98rem] leading-8 text-slate-700">{decodeHTMLEntities(summary)}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section title="기대효과 및 시장 영향">
          <HighlightBox title="정책 기대효과" body={buildImpact(post)} />
          {post.regionalImpact ? <p className="mt-5">{decodeHTMLEntities(post.regionalImpact)}</p> : null}
          {post.yieldImpact ? <p className="mt-5">{decodeHTMLEntities(post.yieldImpact)}</p> : null}
        </Section>

        <Section title="관련 지표">
          <DataTable rows={post.keyData} />
        </Section>

        <Section title="인사이트 체크리스트">
          <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
            {post.checklist.map((item, index) => (
              <p key={`${post.id}-checklist-${index}`} className="py-4 text-[0.98rem] leading-8 text-slate-700">
                {decodeHTMLEntities(item)}
              </p>
            ))}
          </div>
        </Section>

        <Section title="원문 출처">
          <div className="grid gap-5 border-y border-[var(--border)] py-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-[0.95rem] leading-7 text-slate-700">
                출처 기관: {post.source}. 원문은 외부 기관 페이지에서 제공되며, 수정 여부는 원문 페이지 기준으로 확인해야 합니다.
              </p>
              {post.evidenceText ? (
                <blockquote className="mt-5 border-l-4 border-slate-300 pl-4 text-[0.95rem] leading-7 text-slate-600">
                  {decodeHTMLEntities(post.evidenceText)}
                </blockquote>
              ) : null}
            </div>
            <a
              href={post.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center bg-slate-950 px-5 text-[0.92rem] font-bold text-white"
            >
              원문보기
            </a>
          </div>
        </Section>
      </div>
    </article>
  );
}

function ActionBar({
  post,
  savePending,
  onCopyLink,
  onPrint,
  onSave,
}: {
  post: FullPost;
  savePending: boolean;
  onCopyLink: () => void;
  onPrint: () => void;
  onSave: () => void;
}) {
  return (
    <div className="mt-6 grid gap-2 sm:grid-cols-4">
      <button type="button" onClick={onCopyLink} className="h-12 border border-slate-300 text-[0.9rem] font-bold text-slate-800">
        링크생성
      </button>
      <button type="button" onClick={onPrint} className="h-12 border border-slate-300 text-[0.9rem] font-bold text-slate-800">
        PDF 출력
      </button>
      <button
        type="button"
        onClick={onSave}
        disabled={savePending}
        className="h-12 border border-slate-300 text-[0.9rem] font-bold text-slate-800 disabled:opacity-60"
      >
        {savePending ? '저장 중' : '서고 저장'}
      </button>
      <a
        href={post.sourceUrl}
        target="_blank"
        rel="noreferrer"
        className="inline-flex h-12 items-center justify-center bg-[var(--accent)] text-[0.9rem] font-bold text-white"
      >
        원문보기
      </a>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="border-b border-[var(--border)] pb-3 text-[1.25rem] font-black text-slate-950">
        {title}
      </h2>
      <div className="mt-5 text-[1rem] leading-8 text-slate-700">{children}</div>
    </section>
  );
}

function HighlightBox({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-l-4 border-[var(--accent)] bg-rose-50 px-5 py-5">
      <h3 className="text-[0.95rem] font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-[0.98rem] leading-7 text-slate-700">{body}</p>
    </div>
  );
}

function DataTable({ rows }: { rows: FullPost['keyData'] }) {
  if (rows.length === 0) {
    return (
      <HighlightBox
        title="공개 지표"
        body="원문에 구조화 가능한 정량 지표가 명시되지 않았습니다. 정책 적용 대상과 후속 공고를 함께 확인해야 합니다."
      />
    );
  }

  return (
    <div className="overflow-x-auto border border-[var(--border)]">
      <table className="w-full min-w-[640px] border-collapse text-left">
        <thead className="bg-slate-50">
          <tr>
            <th className="border-b border-[var(--border)] px-4 py-3 text-[0.8rem] font-black text-slate-600">항목</th>
            <th className="border-b border-[var(--border)] px-4 py-3 text-[0.8rem] font-black text-slate-600">수치</th>
            <th className="border-b border-[var(--border)] px-4 py-3 text-[0.8rem] font-black text-slate-600">적용 대상</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${row.항목}-${index}`} className="border-b border-[var(--border)] last:border-b-0">
              <td className="px-4 py-4 text-[0.94rem] leading-6 text-slate-800">{decodeHTMLEntities(row.항목)}</td>
              <td className="px-4 py-4 text-[0.94rem] font-black leading-6 text-[var(--accent)]">{decodeHTMLEntities(row.수치)}</td>
              <td className="px-4 py-4 text-[0.94rem] leading-6 text-slate-600">{decodeHTMLEntities(row.적용대상)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function buildOverview(post: FullPost): string {
  const category = CAT_NAMES[post.cat] || post.catName || '부동산 정책';
  return `${post.source}가 ${post.date} 발표한 ${category} 자료입니다. 핵심 쟁점은 ${decodeHTMLEntities(post.summary[0] || post.headline)}입니다. 이용자는 발표 제목만으로 판단하기보다 적용 대상, 시행 시점, 후속 절차, 관련 통계의 변화 가능성을 함께 확인해야 합니다.`;
}

function buildImpact(post: FullPost): string {
  const metric = post.keyData[0] ? `${post.keyData[0].항목} ${post.keyData[0].수치}` : '정책 적용 대상과 시행 조건';
  return `이 자료는 ${metric}을 중심으로 해석할 필요가 있습니다. 단기 영향은 발표 직후 이해관계자의 의사결정에 나타날 수 있고, 중장기 영향은 예산 집행, 제도 시행, 시장 수급 여건에 따라 달라질 수 있습니다.`;
}
