'use client';

import Link from 'next/link';
import React from 'react';

import Header from '@/components/Header';
import { CAT_NAMES } from '@/components/PostComponents';
import { GUIDES } from '@/lib/guides';
import type { FullPost } from '@/lib/posts';
import { decodeHTMLEntities } from '@/lib/utils';

type TabKey = 'summary' | 'impact' | 'data' | 'insight' | 'source' | 'actions';
type SortKey = 'latest' | 'importance';
type DateFilter = 'all' | '7' | '30' | '90';

const TABS: Array<{ key: TabKey; label: string }> = [
  { key: 'summary', label: '핵심 요약' },
  { key: 'impact', label: '기대효과 및 전망' },
  { key: 'data', label: '관련 지표' },
  { key: 'insight', label: '인사이트' },
  { key: 'source', label: '원문 보기' },
  { key: 'actions', label: 'PDF / 공유' },
];

const GUIDE_GROUPS = [
  {
    title: '가격 vs 가치',
    body: '가격은 거래 시점의 시장 합의 결과이고, 가치는 소득, 이용 가능성, 입지, 규제, 장기 수요를 함께 반영한 판단 기준입니다.',
  },
  {
    title: '부동산 시장 구조',
    body: '주택시장은 공급 계획, 금융 여건, 세제, 임대차 제도, 지역별 일자리와 교통망이 동시에 작동하는 복합 시장입니다.',
  },
  {
    title: '정책 이해 기본 개념',
    body: '정책 발표는 대상, 적용 시점, 법령 개정 여부, 예산 확보 여부, 시행기관을 분리해서 읽어야 실제 영향을 판단할 수 있습니다.',
  },
  {
    title: '데이터 해석 방법',
    body: '통계는 기준 시점, 표본 범위, 계절 조정 여부, 전월 대비와 전년 대비의 차이를 확인해야 정책 효과와 시장 변동을 구분할 수 있습니다.',
  },
];

interface FiltersState {
  query: string;
  source: string;
  category: string;
  dateRange: DateFilter;
  sort: SortKey;
}

const initialFilters: FiltersState = {
  query: '',
  source: 'all',
  category: 'all',
  dateRange: 'all',
  sort: 'latest',
};

export default function HomeClient({ initialPosts }: { initialPosts: FullPost[] }) {
  const [selectedId, setSelectedId] = React.useState(initialPosts[0]?.id ?? '');
  const [activeTab, setActiveTab] = React.useState<TabKey>('summary');
  const [filters, setFilters] = React.useState<FiltersState>(initialFilters);
  const [mobileDetailOpen, setMobileDetailOpen] = React.useState(false);
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);

  const sources = React.useMemo(
    () => Array.from(new Set(initialPosts.map((post) => post.source))).sort(),
    [initialPosts]
  );

  const filteredPosts = React.useMemo(() => {
    const now = new Date();
    const query = filters.query.trim().toLowerCase();

    const result = initialPosts.filter((post) => {
      const haystack = [
        post.headline,
        post.source,
        post.catName,
        ...post.summary,
        post.evidenceText ?? '',
      ]
        .join(' ')
        .toLowerCase();

      if (query && !haystack.includes(query)) return false;
      if (filters.source !== 'all' && post.source !== filters.source) return false;
      if (filters.category !== 'all' && post.cat !== filters.category) return false;

      if (filters.dateRange !== 'all') {
        const published = new Date(post.date);
        const days = Number(filters.dateRange);
        const diff = (now.getTime() - published.getTime()) / (1000 * 60 * 60 * 24);
        if (diff > days) return false;
      }

      return true;
    });

    result.sort((a, b) => {
      if (filters.sort === 'importance') {
        return getImportanceScore(b) - getImportanceScore(a);
      }

      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    return result;
  }, [filters, initialPosts]);

  const selectedPost =
    filteredPosts.find((post) => post.id === selectedId) ??
    filteredPosts[0] ??
    initialPosts[0];

  React.useEffect(() => {
    if (filteredPosts.length > 0 && !filteredPosts.some((post) => post.id === selectedId)) {
      setSelectedId(filteredPosts[0].id);
      setActiveTab('summary');
    }
  }, [filteredPosts, selectedId]);

  const selectPost = (id: string) => {
    setSelectedId(id);
    setActiveTab('summary');
    setMobileDetailOpen(true);
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text-main)]">
      <Header />
      <main>
        <section className="border-b border-[var(--border)] bg-white">
          <div className="mx-auto max-w-[1440px] px-5 py-8 lg:px-8">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
              <div>
                <p className="text-[0.76rem] font-bold uppercase text-[var(--accent)]">
                  Policy Analysis Archive
                </p>
                <h1 className="mt-3 max-w-4xl text-[2rem] font-black leading-tight text-slate-950 sm:text-[2.65rem]">
                  부동산 정책 원문, 지표, 해석을 함께 읽는 리서치 플랫폼
                </h1>
                <p className="mt-4 max-w-3xl text-[1rem] leading-8 text-slate-600">
                  공공기관 발표 자료와 통계 항목을 연결해 정책 개요, 핵심 근거, 시장 영향,
                  확인해야 할 지표를 문서형 구조로 제공합니다.
                </p>
              </div>
              <UXIssueAnalysis />
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-[1440px] px-5 py-5 lg:px-8">
          <TopControls
            filters={filters}
            setFilters={setFilters}
            sources={sources}
            onOpenMobileFilters={() => setMobileFilterOpen(true)}
          />

          <div className="mt-5 lg:grid lg:grid-cols-[420px_minmax(0,1fr)] lg:gap-7">
            <div className={mobileDetailOpen ? 'hidden lg:block' : 'block'}>
              <Sidebar
                filters={filters}
                setFilters={setFilters}
                sources={sources}
                totalCount={initialPosts.length}
                filteredCount={filteredPosts.length}
              />
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
                  posts={initialPosts}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                  onBack={() => setMobileDetailOpen(false)}
                  onSelectRelated={selectPost}
                />
              </div>
            ) : null}
          </div>
        </div>

        <ReferenceArchive />
      </main>

      <MobileDrawerFilter
        open={mobileFilterOpen}
        filters={filters}
        setFilters={setFilters}
        sources={sources}
        onClose={() => setMobileFilterOpen(false)}
      />
    </div>
  );
}

function TopControls({
  filters,
  setFilters,
  sources,
  onOpenMobileFilters,
}: {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  sources: string[];
  onOpenMobileFilters: () => void;
}) {
  return (
    <section className="sticky top-[73px] z-30 border-b border-[var(--border)] bg-white/95 py-3 backdrop-blur">
      <div className="flex gap-3">
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">정책 검색</span>
          <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 21l-5.2-5.2" strokeLinecap="round" />
            <circle cx="10.5" cy="10.5" r="6.5" />
          </svg>
          <input
            value={filters.query}
            onChange={(event) => setFilters((prev) => ({ ...prev, query: event.target.value }))}
            placeholder="정책명, 기관, 지표 검색"
            className="h-12 w-full border border-[var(--border)] bg-white pl-11 pr-4 text-[0.95rem] text-slate-900 outline-none transition focus:border-[var(--accent)]"
          />
        </label>
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="inline-flex h-12 items-center justify-center border border-[var(--border)] px-4 text-[0.9rem] font-bold text-slate-800 lg:hidden"
        >
          필터
        </button>
        <div className="hidden gap-3 lg:flex">
          <SelectBox label="기관" value={filters.source} onChange={(value) => setFilters((prev) => ({ ...prev, source: value }))}>
            <option value="all">전체 기관</option>
            {sources.map((source) => (
              <option key={source} value={source}>{source}</option>
            ))}
          </SelectBox>
          <SelectBox label="카테고리" value={filters.category} onChange={(value) => setFilters((prev) => ({ ...prev, category: value }))}>
            <option value="all">전체 카테고리</option>
            {Object.entries(CAT_NAMES).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </SelectBox>
          <SelectBox label="날짜" value={filters.dateRange} onChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value as DateFilter }))}>
            <option value="all">전체 기간</option>
            <option value="7">최근 7일</option>
            <option value="30">최근 30일</option>
            <option value="90">최근 90일</option>
          </SelectBox>
          <SelectBox label="정렬" value={filters.sort} onChange={(value) => setFilters((prev) => ({ ...prev, sort: value as SortKey }))}>
            <option value="latest">최신순</option>
            <option value="importance">중요도순</option>
          </SelectBox>
        </div>
      </div>
    </section>
  );
}

export function Sidebar({
  filters,
  setFilters,
  sources,
  totalCount,
  filteredCount,
}: {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  sources: string[];
  totalCount: number;
  filteredCount: number;
}) {
  return (
    <aside className="hidden lg:block">
      <div className="border-r border-[var(--border)] pr-5">
        <div className="pb-5">
          <p className="text-[0.76rem] font-bold uppercase text-slate-500">Filter Panel</p>
          <h2 className="mt-2 text-[1.2rem] font-black text-slate-950">자료 분류</h2>
          <p className="mt-2 text-[0.9rem] leading-6 text-slate-600">
            전체 {totalCount}건 중 {filteredCount}건을 표시합니다.
          </p>
        </div>
        <FilterFields filters={filters} setFilters={setFilters} sources={sources} />
      </div>
    </aside>
  );
}

function FilterFields({
  filters,
  setFilters,
  sources,
}: {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  sources: string[];
}) {
  return (
    <div className="space-y-5">
      <SelectBox label="기관 필터" value={filters.source} onChange={(value) => setFilters((prev) => ({ ...prev, source: value }))} full>
        <option value="all">전체 기관</option>
        {sources.map((source) => (
          <option key={source} value={source}>{source}</option>
        ))}
      </SelectBox>
      <SelectBox label="카테고리 필터" value={filters.category} onChange={(value) => setFilters((prev) => ({ ...prev, category: value }))} full>
        <option value="all">전체 카테고리</option>
        {Object.entries(CAT_NAMES).map(([key, label]) => (
          <option key={key} value={key}>{label}</option>
        ))}
      </SelectBox>
      <SelectBox label="날짜 필터" value={filters.dateRange} onChange={(value) => setFilters((prev) => ({ ...prev, dateRange: value as DateFilter }))} full>
        <option value="all">전체 기간</option>
        <option value="7">최근 7일</option>
        <option value="30">최근 30일</option>
        <option value="90">최근 90일</option>
      </SelectBox>
      <SelectBox label="정렬" value={filters.sort} onChange={(value) => setFilters((prev) => ({ ...prev, sort: value as SortKey }))} full>
        <option value="latest">최신순</option>
        <option value="importance">중요도순</option>
      </SelectBox>
      <button
        type="button"
        onClick={() => setFilters(initialFilters)}
        className="h-11 w-full border border-slate-300 text-[0.9rem] font-bold text-slate-700"
      >
        필터 초기화
      </button>
    </div>
  );
}

function SelectBox({
  label,
  value,
  onChange,
  children,
  full = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <label className={full ? 'block' : 'block w-[170px]'}>
      <span className="mb-2 block text-[0.75rem] font-bold text-slate-500">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full border border-[var(--border)] bg-white px-3 text-[0.9rem] font-semibold text-slate-800 outline-none focus:border-[var(--accent)]"
      >
        {children}
      </select>
    </label>
  );
}

export function PolicyList({
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
      <section className="border border-[var(--border)] bg-white p-8 text-center text-slate-600">
        조건에 맞는 정책자료가 없습니다.
      </section>
    );
  }

  return (
    <section aria-label="정책자료 목록" className="lg:sticky lg:top-[150px]">
      <div className="divide-y divide-[var(--border)] border-y border-[var(--border)] bg-white lg:max-h-[calc(100vh-170px)] lg:overflow-y-auto">
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

export function PolicyListItem({
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
      className={`block w-full px-4 py-5 text-left transition lg:px-0 ${selected ? 'bg-slate-50' : 'bg-white hover:bg-slate-50'}`}
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

export function PolicyDetail({
  post,
  posts,
  activeTab,
  setActiveTab,
  onBack,
  onSelectRelated,
}: {
  post: FullPost;
  posts: FullPost[];
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  onBack: () => void;
  onSelectRelated: (id: string) => void;
}) {
  const related = posts
    .filter((item) => item.id !== post.id && (item.cat === post.cat || item.source === post.source))
    .slice(0, 4);

  const sharePost = async () => {
    const url = `${window.location.origin}/posts/${post.id}`;
    if (navigator.share) {
      await navigator.share({ title: post.headline, url });
      return;
    }
    await navigator.clipboard.writeText(url);
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
        <button type="button" onClick={() => void sharePost()} className="h-11 min-w-11 border border-slate-300 text-[0.8rem] font-bold text-slate-800">
          공유
        </button>
      </div>

      <header className="border-b border-[var(--border)] py-7">
        <div className="flex flex-wrap items-center gap-2 text-[0.78rem] font-bold text-slate-500">
          <span>{post.source}</span>
          <span>발표일 {post.date}</span>
          <span>업데이트 {post.date}</span>
          <span className="border border-slate-200 px-2 py-1 text-slate-700">{CAT_NAMES[post.cat] || post.catName}</span>
        </div>
        <h1 className="mt-4 max-w-4xl text-[1.9rem] font-black leading-tight text-slate-950 sm:text-[2.35rem]">
          {decodeHTMLEntities(post.headline)}
        </h1>
        <p className="mt-5 max-w-4xl text-[1rem] leading-8 text-slate-600">
          본 문서는 원문 발표 내용과 정책 해석 영역을 분리해 정리한 분석형 자료입니다.
          정책 개요, 근거 수치, 시장 영향, 확인 항목을 동일한 구조로 배열해 비교 가능성을 높였습니다.
        </p>
      </header>

      <Tabs activeTab={activeTab} onChange={setActiveTab} />

      <div className="max-w-4xl py-8">
        <TabPanel active={activeTab === 'summary'}>
          <SectionTitle kicker="1" title="정책 개요" />
          <p className="text-[1rem] leading-8 text-slate-700">
            {buildOverview(post)}
          </p>
          <div className="my-8 border-y border-dashed border-slate-300 py-6 text-center text-[0.82rem] font-bold text-slate-400">
            본문 중간 고지 또는 후원 영역
          </div>
          <SectionTitle kicker="2" title="핵심 내용 요약" />
          <AccordionSection
            items={post.summary.map((summary, index) => ({
              title: `핵심 항목 ${index + 1}`,
              body: decodeHTMLEntities(summary),
            }))}
          />
        </TabPanel>

        <TabPanel active={activeTab === 'impact'}>
          <SectionTitle kicker="3" title="기대효과 및 시장 영향" />
          <div className="space-y-5">
            <HighlightBox title="정책 기대효과" body={buildImpact(post)} />
            {post.regionalImpact ? (
              <AccordionSection items={[{ title: '지역·대상별 영향', body: decodeHTMLEntities(post.regionalImpact) }]} defaultOpen />
            ) : null}
            {post.yieldImpact ? (
              <AccordionSection items={[{ title: '시장 전망', body: decodeHTMLEntities(post.yieldImpact) }]} defaultOpen />
            ) : null}
          </div>
        </TabPanel>

        <TabPanel active={activeTab === 'data'}>
          <SectionTitle kicker="4" title="관련 지표" />
          <DataTable rows={post.keyData} />
          <ChartSection post={post} />
        </TabPanel>

        <TabPanel active={activeTab === 'insight'}>
          <SectionTitle kicker="5" title="인사이트 체크리스트" />
          <AccordionSection
            items={post.checklist.map((item, index) => ({
              title: `검토 항목 ${index + 1}`,
              body: decodeHTMLEntities(item),
            }))}
            defaultOpen
          />
          <HighlightBox
            title="해석 기준"
            body="정책 영향은 발표 문구만으로 확정하기 어렵습니다. 적용 대상, 시행일, 하위 규정, 예산 집행, 시장 수급 조건을 함께 확인해야 합니다."
          />
        </TabPanel>

        <TabPanel active={activeTab === 'source'}>
          <SectionTitle kicker="6" title="원문 출처" />
          <div className="grid gap-5 border-y border-[var(--border)] py-6 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <p className="text-[0.82rem] font-bold text-slate-500">원문 영역</p>
              <p className="mt-2 text-[1rem] leading-7 text-slate-700">
                출처 기관: {post.source}. 원문은 외부 기관 페이지에서 제공되며, 고시·보도자료의 수정 여부는 원문 페이지 기준으로 확인해야 합니다.
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
              원문 보기
            </a>
          </div>
        </TabPanel>

        <TabPanel active={activeTab === 'actions'}>
          <SectionTitle kicker="기능" title="PDF / 공유" />
          <div className="grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="h-12 border border-slate-300 text-[0.95rem] font-bold text-slate-800"
            >
              PDF로 저장
            </button>
            <button
              type="button"
              onClick={() => void sharePost()}
              className="h-12 bg-[var(--accent)] text-[0.95rem] font-bold text-white"
            >
              공유 링크 복사
            </button>
          </div>
        </TabPanel>

        <RelatedContent posts={related} guides={GUIDES.slice(0, 3)} onSelect={onSelectRelated} />
      </div>
    </article>
  );
}

export function Tabs({ activeTab, onChange }: { activeTab: TabKey; onChange: (tab: TabKey) => void }) {
  return (
    <nav className="sticky top-[64px] z-20 -mx-5 overflow-x-auto border-b border-[var(--border)] bg-white px-5 lg:top-[137px] lg:mx-0 lg:px-0">
      <div className="flex min-w-max">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => onChange(tab.key)}
            className={`h-12 border-b-2 px-4 text-[0.88rem] font-bold ${activeTab === tab.key ? 'border-[var(--accent)] text-slate-950' : 'border-transparent text-slate-500'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}

export function TabPanel({ active, children }: { active: boolean; children: React.ReactNode }) {
  if (!active) return null;
  return <div className="space-y-7">{children}</div>;
}

export function HighlightBox({ title, body }: { title: string; body: string }) {
  return (
    <div className="border-l-4 border-[var(--accent)] bg-rose-50 px-5 py-5">
      <h3 className="text-[0.95rem] font-black text-slate-950">{title}</h3>
      <p className="mt-2 text-[0.98rem] leading-7 text-slate-700">{body}</p>
    </div>
  );
}

export function DataTable({ rows }: { rows: FullPost['keyData'] }) {
  if (rows.length === 0) {
    return <HighlightBox title="공개 지표" body="원문에 구조화 가능한 정량 지표가 명시되지 않았습니다. 정책 적용 대상과 후속 공고를 함께 확인해야 합니다." />;
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

export function ChartSection({ post }: { post: FullPost }) {
  const metrics = [
    { label: '요약 근거', value: Math.min(post.summary.length, 5), max: 5 },
    { label: '정량 지표', value: Math.min(post.keyData.length, 5), max: 5 },
    { label: '검토 항목', value: Math.min(post.checklist.length, 5), max: 5 },
  ];

  return (
    <section className="mt-7 border-t border-[var(--border)] pt-6">
      <h3 className="text-[1rem] font-black text-slate-950">자료 구성 지표</h3>
      <div className="mt-4 space-y-4">
        {metrics.map((metric) => (
          <div key={metric.label}>
            <div className="mb-2 flex justify-between text-[0.82rem] font-bold text-slate-600">
              <span>{metric.label}</span>
              <span>{metric.value}/{metric.max}</span>
            </div>
            <div className="h-2 bg-slate-100">
              <div className="h-2 bg-slate-900" style={{ width: `${(metric.value / metric.max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export function AccordionSection({
  items,
  defaultOpen = false,
}: {
  items: Array<{ title: string; body: string }>;
  defaultOpen?: boolean;
}) {
  return (
    <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
      {items.map((item, index) => (
        <details key={`${item.title}-${index}`} open={defaultOpen || index === 0} className="group py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[1rem] font-black text-slate-950">
            {item.title}
            <span className="text-[1.2rem] text-slate-400 group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 text-[0.98rem] leading-8 text-slate-700">{item.body}</p>
        </details>
      ))}
    </div>
  );
}

export function RelatedContent({
  posts,
  guides,
  onSelect,
}: {
  posts: FullPost[];
  guides: typeof GUIDES;
  onSelect: (id: string) => void;
}) {
  return (
    <section className="mt-12 border-t border-[var(--border)] pt-8">
      <h2 className="text-[1.25rem] font-black text-slate-950">관련 정책 / 관련 개념</h2>
      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {posts.length > 0 ? posts.map((post) => (
            <button key={post.id} type="button" onClick={() => onSelect(post.id)} className="block w-full py-4 text-left">
              <p className="text-[0.78rem] font-bold text-slate-500">{post.source} · {post.date}</p>
              <p className="mt-1 text-[0.96rem] font-black leading-6 text-slate-950">{decodeHTMLEntities(post.headline)}</p>
            </button>
          )) : (
            <p className="py-4 text-[0.95rem] text-slate-600">연결할 관련 정책이 아직 충분하지 않습니다.</p>
          )}
        </div>
        <div className="divide-y divide-[var(--border)] border-y border-[var(--border)]">
          {guides.map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`} className="block py-4">
              <p className="text-[0.78rem] font-bold text-[var(--accent)]">{guide.eyebrow}</p>
              <p className="mt-1 text-[0.96rem] font-black leading-6 text-slate-950">{guide.title}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function MobileDrawerFilter({
  open,
  filters,
  setFilters,
  sources,
  onClose,
}: {
  open: boolean;
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  sources: string[];
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[2000] bg-black/40 lg:hidden" role="dialog" aria-modal="true">
      <button className="absolute inset-0 h-full w-full" type="button" onClick={onClose} aria-label="필터 닫기" />
      <div className="absolute inset-x-0 bottom-0 bg-white px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-5">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-[1.15rem] font-black text-slate-950">필터</h2>
          <button type="button" onClick={onClose} className="h-11 min-w-11 border border-slate-300 text-slate-800">닫기</button>
        </div>
        <FilterFields filters={filters} setFilters={setFilters} sources={sources} />
        <button type="button" onClick={onClose} className="mt-5 h-12 w-full bg-slate-950 font-bold text-white">
          결과 보기
        </button>
      </div>
    </div>
  );
}

function UXIssueAnalysis() {
  return (
    <aside className="border-l-4 border-slate-900 bg-slate-50 px-5 py-4">
      <h2 className="text-[0.95rem] font-black text-slate-950">UX 문제 분석</h2>
      <p className="mt-2 text-[0.9rem] leading-7 text-slate-600">
        카드형 UI는 제목과 단편 요약을 빠르게 소비하게 만들어 정책의 근거, 적용 범위,
        수치 해석을 분리해 읽기 어렵습니다. 모바일에서는 카드가 계속 이어져 원문과 해석의
        경계가 더 흐려지므로, 정책 서비스에는 문서형 전환과 섹션 단위 읽기가 필요합니다.
      </p>
    </aside>
  );
}

function ReferenceArchive() {
  return (
    <section className="border-t border-[var(--border)] bg-slate-50">
      <div className="mx-auto max-w-[1440px] px-5 py-12 lg:px-8">
        <p className="text-[0.76rem] font-bold uppercase text-[var(--accent)]">Reference / Guide</p>
        <h2 className="mt-3 text-[1.8rem] font-black text-slate-950">학습형 레퍼런스 아카이브</h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {GUIDE_GROUPS.map((guide) => (
            <section key={guide.title} className="border-t border-slate-300 pt-4">
              <h3 className="text-[1rem] font-black text-slate-950">{guide.title}</h3>
              <p className="mt-3 text-[0.94rem] leading-7 text-slate-600">{guide.body}</p>
            </section>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3">
          {GUIDES.slice(0, 4).map((guide) => (
            <Link key={guide.slug} href={`/guides/${guide.slug}`} className="border border-slate-300 px-4 py-3 text-[0.9rem] font-bold text-slate-800">
              {guide.title}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionTitle({ kicker, title }: { kicker: string; title: string }) {
  return (
    <div>
      <p className="text-[0.76rem] font-bold uppercase text-[var(--accent)]">Section {kicker}</p>
      <h2 className="mt-1 text-[1.35rem] font-black text-slate-950">{title}</h2>
    </div>
  );
}

function getImportanceScore(post: FullPost): number {
  return post.summary.length * 2 + post.keyData.length * 3 + post.checklist.length + (post.regionalImpact ? 3 : 0) + (post.yieldImpact ? 3 : 0);
}

function buildOverview(post: FullPost): string {
  const category = CAT_NAMES[post.cat] || post.catName || '부동산 정책';
  return `${post.source}가 ${post.date} 발표한 ${category} 자료입니다. 핵심 쟁점은 ${decodeHTMLEntities(post.summary[0] || post.headline)}입니다. 이용자는 발표 제목만으로 판단하기보다 적용 대상, 시행 시점, 후속 절차, 관련 통계의 변화 가능성을 함께 확인해야 합니다.`;
}

function buildImpact(post: FullPost): string {
  const metric = post.keyData[0] ? `${post.keyData[0].항목} ${post.keyData[0].수치}` : '정책 적용 대상과 시행 조건';
  return `이 자료는 ${metric}을 중심으로 해석할 필요가 있습니다. 단기 영향은 발표 직후 이해관계자의 의사결정에 나타날 수 있고, 중장기 영향은 예산 집행, 제도 시행, 시장 수급 여건에 따라 달라질 수 있습니다.`;
}
