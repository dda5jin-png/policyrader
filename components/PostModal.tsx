'use client';
import React from 'react';
import { Post, CAT_NAMES } from './PostComponents';

interface PostModalProps {
  post: Post | null;
  onClose: () => void;
  onCopyLink: (id: string) => void;
  onPrintPDF: (post: Post) => void;
}

const PostModal: React.FC<PostModalProps> = ({ post, onClose, onCopyLink, onPrintPDF }) => {
  if (!post) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-[8px] z-[2000] flex items-center justify-center p-5 animate-[modalFade_0.3s_cubic-bezier(0.16,1,0.3,1)]">
      <div className="w-full max-w-[700px] bg-[#0f172a] border border-[var(--border)] rounded-[24px] max-h-[85vh] overflow-y-auto p-10 px-7.5 relative">
        <div className="absolute top-5 right-5 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center cursor-pointer text-white hover:bg-white/10" onClick={onClose}>✕</div>
        
        <span className={`text-[0.65rem] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-[0.5px] cat-${post.cat}`}>
          {CAT_NAMES[post.cat] || post.catName}
        </span>
        
        <h1 className="my-5 text-[1.5rem] font-extrabold leading-[1.3] text-white">{post.headline}</h1>
        <p className="text-[var(--text-muted)] text-[0.85rem]">발행: {post.date} | 출처: {post.source}</p>

        <div className="text-[0.75rem] text-[var(--accent)] font-extrabold mt-8 mb-3 uppercase tracking-[1px] flex items-center gap-2">
          핵심 정책 요약
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>
        <div className="list-none">
          {post.summary.map((s, i) => (
            <div key={i} className="p-3 px-4 bg-white/3 rounded-xl mb-2.5 text-[0.95rem] flex gap-3">
              <span className="text-[var(--accent)] font-black">→</span>
              {s}
            </div>
          ))}
        </div>

        <div className="text-[0.75rem] text-[var(--accent)] font-extrabold mt-8 mb-3 uppercase tracking-[1px] flex items-center gap-2">
          전문가 시나리오 분석
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>
        <div className="bg-linear-to-br from-[var(--accent-soft)] to-transparent border border-[var(--accent-soft)] p-6 rounded-2xl italic leading-1.7">
          "{post.expertOpinions[0]?.comment}"
          <p className="mt-4 font-bold text-[0.8rem] text-right not-italic text-[var(--accent)]">
            — {post.expertOpinions[0]?.name} ({post.expertOpinions[0]?.affiliation})
          </p>
        </div>

        <div className="text-[0.75rem] text-[var(--accent)] font-extrabold mt-8 mb-3 uppercase tracking-[1px] flex items-center gap-2">
          데이터 세부 지표
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>
        <div className="overflow-x-auto mt-2.5 rounded-lg border border-[var(--border)]">
          <table className="w-full border-collapse min-w-[400px]">
            <thead>
              <tr className="bg-white/5">
                <th className="text-left text-[0.75rem] text-[var(--text-muted)] p-3 border-b border-[var(--border)]">항목</th>
                <th className="text-left text-[0.75rem] text-[var(--text-muted)] p-3 border-b border-[var(--border)]">수치</th>
                <th className="text-left text-[0.75rem] text-[var(--text-muted)] p-3 border-b border-[var(--border)]">비고</th>
              </tr>
            </thead>
            <tbody>
              {post.keyData.map((d, i) => (
                <tr key={i} className="border-b border-white/2">
                  <td className="p-3 text-[0.9rem] text-white/80">{d.항목}</td>
                  <td className="p-3 text-[0.9rem] text-white font-bold">{d.수치}</td>
                  <td className="p-3 text-[0.9rem] text-white/60">{d.적용대상}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 체크리스트: 임시 전면 개방 */}
        <div className="text-[0.75rem] text-[var(--accent)] font-extrabold mt-8 mb-3 uppercase tracking-[1px] flex items-center gap-2">
          사용자 액션 체크리스트
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>
        <div className="list-none">
          {post.checklist.map((c, i) => (
            <div key={i} className="p-3 px-4 bg-[var(--accent-soft)] border-l-3 border-[var(--accent)] rounded-r-xl rounded-l-none mb-2.5 text-[0.95rem] flex gap-3">
              {c}
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-8 justify-center">
          {/* 링크생성, PDF출력: 임시 전면 개방 */}
          <button className="flex-1 max-w-[160px] p-3.5 rounded-xl border border-[var(--border)] bg-white/5 text-white text-[0.85rem] font-bold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-white/10 hover:border-white/20" onClick={() => onCopyLink(post.id)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            링크생성
          </button>
          <button className="flex-1 max-w-[160px] p-3.5 rounded-xl border border-[var(--border)] bg-white/5 text-white text-[0.85rem] font-bold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-white/10 hover:border-white/20" onClick={() => onPrintPDF(post)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="18" x2="12" y2="12" strokeLinecap="round"/>
              <line x1="9" y1="15" x2="15" y2="15" strokeLinecap="round"/>
            </svg>
            PDF 출력
          </button>
          
          {/* 원문보기: 항상 표시 */}
          <button className="flex-1 max-w-[160px] p-3.5 rounded-xl border-none bg-white text-black text-[0.85rem] font-bold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-slate-200" onClick={() => window.open(post.sourceUrl)}>
            원문보기
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
