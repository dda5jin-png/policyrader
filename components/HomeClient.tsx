'use client';

import React from 'react';

import Header from '@/components/Header';
import { useAuth } from '@/components/AuthProvider';
import { CAT_NAMES } from '@/components/PostComponents';
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

  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Header />
      <main>
        <section className="border-b border-[var(--border)] bg-white">
          <div className="mx-auto max-w-[1320px] px-5 py-8 lg:px-8">
            <p className="text-[0.76rem] font-bold uppercase text-[var(--accent)]">
              Policy Research Archive
            </p>
            <h1 className="mt-3 max-w-4xl text-[2rem] font-black leading-tight sm:text-[2.6rem]">
              부동산 정책자료를 분야별로 읽는 리서치 아카이브
            </h1>
            <p className="mt-4 max-w-3xl text-[1rem] leading-8 text-slate-600">
              카테고리를 선택하면 해당 분야 정책자료만 목록에 표시됩니다. 자료를 누르면 우측 상세 영역에서
              원문 근거, 지표, 체크리스트, 원문 링크를 한 번에 확인할 수 있습니다.
            </p>
          </div>
        </section>

        <div className="mx-auto max-w-[1320px] px-5 py-5 lg:px-8">
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

  const detailUrl = typeof window === 'undefined' ? `/posts/${post.id}` : `${window.location.origin}/posts/${post.id}`;

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
