import React from 'react';
import { Post, CAT_NAMES } from './PostComponents';
import { decodeHTMLEntities } from '../lib/utils';
import GoogleAd from './AdComponent';

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
      <div className="w-full max-w-[700px] bg-[var(--primary)] border border-[var(--border)] rounded-[24px] max-h-[85vh] overflow-y-auto p-10 px-7.5 relative">
        <div className="absolute top-5 right-5 w-10 h-10 bg-[var(--accent-soft)] rounded-full flex items-center justify-center cursor-pointer text-[var(--accent)] hover:opacity-80" onClick={onClose}>✕</div>
        
        <span className={`text-[0.65rem] font-extrabold px-2.5 py-1 rounded-md uppercase tracking-[0.5px] cat-${post.cat}`}>
          {CAT_NAMES[post.cat] || post.catName}
        </span>
        
        <h1 className="my-5 text-[1.5rem] font-extrabold leading-[1.3] text-[var(--text-main)]">{decodeHTMLEntities(post.headline)}</h1>
        <p className="text-[var(--text-muted)] text-[0.85rem]">발행: {post.date} | 출처: {post.source}</p>

        <div className="text-[0.75rem] text-[var(--accent)] font-extrabold mt-8 mb-3 uppercase tracking-[1px] flex items-center gap-2">
          핵심 정책 요약
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>
        <div className="list-none">
          {post.summary.map((s, i) => (
            <div key={i} className="p-3 px-4 bg-[var(--accent-soft)]/30 rounded-xl mb-2.5 text-[0.95rem] flex gap-3 text-[var(--text-main)]">
              <span className="text-[var(--accent)] font-black">→</span>
              {decodeHTMLEntities(s)}
            </div>
          ))}
        </div>

        <div className="text-[0.75rem] text-[var(--accent)] font-extrabold mt-8 mb-3 uppercase tracking-[1px] flex items-center gap-2">
          기대효과 및 전망
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>
        <div className="bg-linear-to-br from-[var(--accent-soft)] to-transparent border border-[var(--accent-soft)] p-6 rounded-2xl italic leading-1.7 text-[var(--text-main)]">
          "{decodeHTMLEntities(post.expertOpinions[0]?.comment)}"
          <p className="mt-4 font-bold text-[0.8rem] text-right not-italic text-[var(--accent)]">
            — 원문 기반 정책 리서치 ({post.expertOpinions[0]?.affiliation})
          </p>
        </div>

        {/* 신규: 지역별 영향 분석 */}
        {post.regionalImpact && (
          <>
            <div className="text-[0.75rem] text-[var(--accent)] font-extrabold mt-8 mb-3 uppercase tracking-[1px] flex items-center gap-2">
              지역별 세부 영향
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
            <div className="p-4 bg-[var(--accent-soft)]/20 border border-[var(--accent-soft)] rounded-xl text-[0.95rem] leading-relaxed text-[var(--text-main)]">
              {decodeHTMLEntities(post.regionalImpact)}
            </div>
          </>
        )}

        {/* 신규: 수익률/ROI 인사이트 */}
        {post.yieldImpact && (
          <>
            <div className="text-[0.75rem] text-[var(--accent)] font-extrabold mt-8 mb-3 uppercase tracking-[1px] flex items-center gap-2">
              수익률 및 투자 관점 분석
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
            <div className="p-4 bg-[var(--accent-soft)]/20 border border-[var(--accent-soft)] rounded-xl text-[0.95rem] leading-relaxed text-[var(--text-main)]">
              {decodeHTMLEntities(post.yieldImpact)}
            </div>
          </>
        )}

        <div className="text-[0.75rem] text-[var(--accent)] font-extrabold mt-8 mb-3 uppercase tracking-[1px] flex items-center gap-2">
          관련 지표 정리
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>
        <div className="overflow-x-auto mt-2.5 rounded-lg border border-[var(--border)]">
          <table className="w-full border-collapse min-w-[400px]">
            <thead>
              <tr className="bg-[var(--accent-soft)]/20">
                <th className="text-left text-[0.75rem] text-[var(--text-muted)] p-3 border-b border-[var(--border)]">항목</th>
                <th className="text-left text-[0.75rem] text-[var(--text-muted)] p-3 border-b border-[var(--border)]">수치</th>
                <th className="text-left text-[0.75rem] text-[var(--text-muted)] p-3 border-b border-[var(--border)]">비고</th>
              </tr>
            </thead>
            <tbody>
              {post.keyData.map((d, i) => (
                <tr key={i} className="border-b border-[var(--border)]">
                  <td className="p-3 text-[0.9rem] text-[var(--text-main)] transition-colors">{decodeHTMLEntities(d.항목)}</td>
                  <td className="p-3 text-[0.9rem] text-[var(--accent)] font-bold">{decodeHTMLEntities(d.수치)}</td>
                  <td className="p-3 text-[0.9rem] text-[var(--text-muted)]">{decodeHTMLEntities(d.적용대상)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* 체크리스트: 임시 전면 개방 */}
        <div className="text-[0.75rem] text-[var(--accent)] font-extrabold mt-8 mb-3 uppercase tracking-[1px] flex items-center gap-2">
          인사이트 체크리스트
          <div className="flex-1 h-px bg-[var(--border)]" />
        </div>
        <div className="list-none">
          {post.checklist.map((c, i) => (
            <div key={i} className="p-3 px-4 bg-[var(--accent-soft)] border-l-3 border-[var(--accent)] rounded-r-xl rounded-l-none mb-2.5 text-[0.95rem] flex gap-3 text-[var(--text-main)]">
              {decodeHTMLEntities(c)}
            </div>
          ))}
        </div>

        {/* 신규: 분석 근거 명시 (Text Only) */}
        {post.evidenceText && (
          <>
            <div className="text-[0.75rem] text-[var(--text-muted)] font-extrabold mt-10 mb-3 uppercase tracking-[1px] flex items-center gap-2">
              데이터 분석 근거
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
            <div className="text-[0.8rem] text-[var(--text-muted)] italic leading-relaxed px-1">
              * {decodeHTMLEntities(post.evidenceText)}
            </div>
          </>
        )}

        <GoogleAd />

        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center items-center">
          {/* 링크생성, PDF출력: 명확한 대비를 위해 색상 강화 */}
          <button className="w-full sm:w-auto sm:flex-1 sm:max-w-[160px] p-3.5 rounded-xl border-2 border-[var(--accent)] bg-transparent text-[var(--accent)] text-[0.85rem] font-bold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-[var(--accent)] hover:text-white" onClick={() => onCopyLink(post.id)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="whitespace-nowrap">링크 생성</span>
          </button>
          <button className="w-full sm:w-auto sm:flex-1 sm:max-w-[160px] p-3.5 rounded-xl border-2 border-[var(--accent)] bg-transparent text-[var(--accent)] text-[0.85rem] font-bold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-[var(--accent)] hover:text-white" onClick={() => onPrintPDF(post)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="18" x2="12" y2="12" strokeLinecap="round"/>
              <line x1="9" y1="15" x2="15" y2="15" strokeLinecap="round"/>
            </svg>
            <span className="whitespace-nowrap">PDF 출력</span>
          </button>
          
          {/* 원문보기: 항상 표시 */}
          <button className="w-full sm:w-auto sm:flex-1 sm:max-w-[160px] p-3.5 rounded-xl border-none bg-[var(--accent)] text-white text-[0.85rem] font-bold cursor-pointer flex items-center justify-center gap-2 transition-all hover:opacity-90" onClick={() => window.open(post.sourceUrl)}>
            <span className="whitespace-nowrap">원문보기</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostModal;
