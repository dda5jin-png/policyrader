import React from 'react';
import { decodeHTMLEntities } from '../lib/utils';

export const CAT_INFO: Record<string, string> = {
  all: "전체 부동산 관련 정책 자료를 모두 표시합니다.",
  F: "대출 규제(LTV·DSR), 금리 변동, 보증 보험 등 자금 조달 정책을 분석합니다.",
  X: "취득세, 종부세, 양도세 등 부동산 세제 개편 및 과세 표준을 분석합니다.",
  S: "공공 주택 공급, 3기 신도시, 재건축·재개발 및 SOC 개발 정책을 분석합니다.",
  T: "청약 제도, 부동산 거래 규제, 공인중개법, 시장 모니터링 정보를 분석합니다.",
  R: "전월세 상한제, 계약갱신학구권, 공공임대 및 주거 복지 지원책을 분석합니다.",
  P: "부동산 신기술, 프롭테크 스타트업, 디지털 부동산 서비스 정책을 분석합니다."
};

export const CAT_NAMES: Record<string, string> = {
  F: "부동산 금융정책",
  X: "부동산 세금정책",
  S: "부동산 공급·개발정책",
  T: "부동산 거래·법령",
  R: "부동산 임대·주거정책",
  P: "프롭테크"
};

interface FiltersProps {
  currentCat: string;
  setCat: (cat: string) => void;
}

export const Filters: React.FC<FiltersProps> = ({ currentCat, setCat }) => (
  <div className="max-w-[900px] mx-auto text-center px-4">
    {/* 모바일: 가로 스크롤 레이아웃으로 변경 (넘침 방지) */}
    <div className="flex sm:hidden overflow-x-auto no-scrollbar gap-2 mb-4 pb-1 px-1 -mx-1 snap-x">
      <button
        onClick={() => setCat('all')}
        className={`flex-none px-4 py-2 border rounded-xl text-[0.8rem] font-semibold cursor-pointer transition-all duration-300 snap-start ${currentCat === 'all' ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-[0_2px_8px_var(--accent-soft)]' : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--text-muted)]'}`}
      >
        전체
      </button>
      {Object.entries(CAT_NAMES).map(([key, value]) => (
        <button
          key={key}
          onClick={() => setCat(key)}
          className={`flex-none px-4 py-2 border rounded-xl text-[0.8rem] font-semibold cursor-pointer whitespace-nowrap transition-all duration-300 snap-start ${currentCat === key ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-[0_2px_8px_var(--accent-soft)]' : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--text-muted)]'}`}
        >
          {value.replace('부동산 ', '')}
        </button>
      ))}
    </div>
    {/* 데스크탑: 기존 2행 그리드 레이아웃 유지 */}
    <div className="hidden sm:inline-grid sm:grid-cols-[auto_repeat(3,auto)] gap-2.5 mb-3">
      <button
        onClick={() => setCat('all')}
        className={`row-span-2 px-4 py-2.5 border rounded-xl text-[0.85rem] font-semibold cursor-pointer whitespace-nowrap transition-all duration-300 hover:border-[var(--accent)] ${currentCat === 'all' ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-[0_4px_12px_var(--accent-soft)]' : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--text-muted)]'}`}
      >
        전체
      </button>
      {Object.entries(CAT_NAMES).map(([key, value]) => (
        <button
          key={key}
          onClick={() => setCat(key)}
          className={`px-4 py-2.5 border rounded-xl text-[0.85rem] font-semibold cursor-pointer whitespace-nowrap transition-all duration-300 hover:border-[var(--accent)] ${currentCat === key ? 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-[0_4px_12px_var(--accent-soft)]' : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--text-muted)]'}`}
        >
          {value}
        </button>
      ))}
    </div>
    <div className="text-[0.8rem] text-[#71717a] mb-[30px] min-h-[1.2rem] px-2">
      {CAT_INFO[currentCat] || ""}
    </div>
  </div>
);

export interface Post {
  id: string;
  cat: string;
  catName?: string;
  date: string;
  headline: string;
  source: string;
  sourceUrl: string;
  summary: string[];
  expertOpinions: Array<{ name: string; affiliation: string; comment: string }>;
  keyData: Array<{ 항목: string; 수치: string; 적용대상: string }>;
  checklist: string[];
  regionalImpact?: string;
  yieldImpact?: string;
  evidenceText?: string;
}

interface PostCardProps {
  post: Post;
  onClick: (id: string) => void;
  index: number;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick, index }) => (
  <div 
    onClick={() => onClick(post.id)}
    className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[var(--radius)] p-6 cursor-pointer transition-all duration-300 relative overflow-hidden group hover:-translate-y-1 hover:border-white/20 hover:shadow-[var(--shadow-lg)]"
    style={{ animation: `modalFade 0.5s ease backwards ${index * 0.05}s` }}
  >
    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[var(--accent)] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <div className="flex justify-between mb-4">
      <span className={`text-[0.65rem] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-[0.5px] cat-${post.cat}`}>
        {CAT_NAMES[post.cat] || post.catName}
      </span>
      <span className="text-[0.75rem] text-[var(--text-muted)]">{post.date}</span>
    </div>
    <h2 className="text-[1.2rem] font-bold mb-4 text-[var(--text-main)] leading-1.4 line-clamp-2">
      {decodeHTMLEntities(post.headline)}
    </h2>
    <div className="flex items-center gap-4 text-[0.8rem] text-[var(--text-muted)]">
      <span>{post.source}</span>
      <span>•</span>
      <span>Premium Research</span>
    </div>
  </div>
);
