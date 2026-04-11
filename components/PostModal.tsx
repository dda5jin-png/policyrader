'use client';

import React from 'react';
import { CAT_NAMES } from './PostComponents';
import { decodeHTMLEntities } from '../lib/utils';
import type { PremiumPostPayload, PublicPost } from '@/lib/posts';
import { useAuth } from '@/components/AuthProvider';
import PaywallModal from './PaywallModal';

interface PostModalProps {
  post: PublicPost | null;
  onClose: () => void;
  onCopyLink: (id: string) => void;
  onPrintPDF: (post: PublicPost & Partial<PremiumPostPayload>) => void;
}

const PostModal: React.FC<PostModalProps> = ({ post, onClose, onCopyLink, onPrintPDF }) => {
  const { user } = useAuth();
  const [premiumData, setPremiumData] = React.useState<PremiumPostPayload | null>(null);
  const [premiumLoading, setPremiumLoading] = React.useState(false);
  const [showPaywall, setShowPaywall] = React.useState(false);
  const [savePending, setSavePending] = React.useState(false);
  const [saveMessage, setSaveMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    setPremiumData(null);
    setSaveMessage(null);

    if (!post) {
      return;
    }

    const controller = new AbortController();

    const fetchPremiumData = async () => {
      setPremiumLoading(true);

      try {
        const response = await fetch(`/api/posts/${post.id}/premium`, {
          credentials: 'include',
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as PremiumPostPayload;
        setPremiumData(payload);
      } catch (error) {
        if (!(error instanceof DOMException && error.name === 'AbortError')) {
          console.error('프리미엄 데이터 로드 실패', error);
        }
      } finally {
        setPremiumLoading(false);
      }
    };

    void fetchPremiumData();

    return () => controller.abort();
  }, [post]);

  if (!post) return null;

  const openLoginPrompt = () => {
    setShowPaywall(true);
  };

  return (
    <>
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

        {post.evidenceText ? (
          <>
            <div className="text-[0.75rem] text-[var(--text-muted)] font-extrabold mt-10 mb-3 uppercase tracking-[1px] flex items-center gap-2">
              공개 근거 문장
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
            <div className="text-[0.92rem] text-[var(--text-muted)] leading-relaxed px-1">
              {decodeHTMLEntities(post.evidenceText)}
            </div>
          </>
        ) : null}

        {premiumData ? (
          <>
            <div className="text-[0.75rem] text-[var(--accent)] font-extrabold mt-8 mb-3 uppercase tracking-[1px] flex items-center gap-2">
              정책 영향 분석
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
            <div className="p-4 bg-[var(--accent-soft)]/20 border border-[var(--accent-soft)] rounded-xl text-[0.95rem] leading-relaxed text-[var(--text-main)]">
              {premiumData.regionalImpact ? decodeHTMLEntities(premiumData.regionalImpact) : '지역별 영향 분석이 곧 추가됩니다.'}
            </div>
            <div className="text-[0.75rem] text-[var(--accent)] font-extrabold mt-8 mb-3 uppercase tracking-[1px] flex items-center gap-2">
              시장 전망 및 추가 인사이트
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
            <div className="space-y-3">
              {premiumData.expertOpinions[0] ? (
                <div className="bg-linear-to-br from-[var(--accent-soft)] to-transparent border border-[var(--accent-soft)] p-6 rounded-2xl italic leading-1.7 text-[var(--text-main)]">
                  &ldquo;{decodeHTMLEntities(premiumData.expertOpinions[0].comment)}&rdquo;
                  <p className="mt-4 font-bold text-[0.8rem] text-right not-italic text-[var(--accent)]">
                    — 원문 기반 정책 리서치 ({premiumData.expertOpinions[0].affiliation})
                  </p>
                </div>
              ) : null}
              {premiumData.yieldImpact ? (
                <div className="p-4 bg-[var(--accent-soft)]/20 border border-[var(--accent-soft)] rounded-xl text-[0.95rem] leading-relaxed text-[var(--text-main)]">
                  {decodeHTMLEntities(premiumData.yieldImpact)}
                </div>
              ) : null}
            </div>
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
                  {premiumData.keyData.map((d, i) => (
                    <tr key={i} className="border-b border-[var(--border)]">
                      <td className="p-3 text-[0.9rem] text-[var(--text-main)] transition-colors">{decodeHTMLEntities(d.항목)}</td>
                      <td className="p-3 text-[0.9rem] text-[var(--accent)] font-bold">{decodeHTMLEntities(d.수치)}</td>
                      <td className="p-3 text-[0.9rem] text-[var(--text-muted)]">{decodeHTMLEntities(d.적용대상)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="text-[0.75rem] text-[var(--accent)] font-extrabold mt-8 mb-3 uppercase tracking-[1px] flex items-center gap-2">
              인사이트 체크리스트
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>
            <div className="list-none">
              {premiumData.checklist.map((c, i) => (
                <div key={i} className="p-3 px-4 bg-[var(--accent-soft)] border-l-3 border-[var(--accent)] rounded-r-xl rounded-l-none mb-2.5 text-[0.95rem] flex gap-3 text-[var(--text-main)]">
                  {decodeHTMLEntities(c)}
                </div>
              ))}
            </div>
          </>
        ) : null}

        {premiumLoading ? (
          <div className="mt-6 text-[0.82rem] text-[var(--text-muted)]">프리미엄 분석을 불러오는 중...</div>
        ) : null}

        <div className="flex flex-col sm:flex-row gap-3 mt-8 justify-center items-center">
          <button
            className="w-full sm:w-auto sm:flex-1 sm:max-w-[160px] p-3.5 rounded-xl border-2 border-[var(--accent)] bg-transparent text-[var(--accent)] text-[0.85rem] font-bold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-[var(--accent)] hover:text-white"
            onClick={() => {
              if (!user) {
                openLoginPrompt();
                return;
              }

              onCopyLink(post.id);
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="whitespace-nowrap">링크 생성</span>
          </button>
          <button
            className="w-full sm:w-auto sm:flex-1 sm:max-w-[160px] p-3.5 rounded-xl border-2 border-[var(--accent)] bg-transparent text-[var(--accent)] text-[0.85rem] font-bold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-[var(--accent)] hover:text-white"
            onClick={() => {
              if (!user) {
                openLoginPrompt();
                return;
              }

              onPrintPDF({ ...post, ...premiumData });
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round"/>
              <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round"/>
              <line x1="12" y1="18" x2="12" y2="12" strokeLinecap="round"/>
              <line x1="9" y1="15" x2="15" y2="15" strokeLinecap="round"/>
            </svg>
            <span className="whitespace-nowrap">PDF 출력</span>
          </button>

          <button
            className="w-full sm:w-auto sm:flex-1 sm:max-w-[160px] p-3.5 rounded-xl border-2 border-[var(--accent)] bg-transparent text-[var(--accent)] text-[0.85rem] font-bold cursor-pointer flex items-center justify-center gap-2 transition-all hover:bg-[var(--accent)] hover:text-white disabled:opacity-70"
            disabled={savePending}
            onClick={async () => {
              if (!user) {
                openLoginPrompt();
                return;
              }

              setSavePending(true);
              setSaveMessage(null);

              try {
                const response = await fetch('/api/library/save', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
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
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1z" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span className="whitespace-nowrap">{savePending ? '저장 중...' : '서고 저장'}</span>
          </button>
          
          <button className="w-full sm:w-auto sm:flex-1 sm:max-w-[160px] p-3.5 rounded-xl border-none bg-[var(--accent)] text-white text-[0.85rem] font-bold cursor-pointer flex items-center justify-center gap-2 transition-all hover:opacity-90" onClick={() => window.open(post.sourceUrl)}>
            <span className="whitespace-nowrap">원문보기</span>
          </button>
        </div>

        {saveMessage ? (
          <div className="mt-4 text-center text-[0.82rem] text-[var(--text-muted)]">{saveMessage}</div>
        ) : null}
      </div>
        </div>
      {showPaywall ? (
        <PaywallModal
          onClose={() => setShowPaywall(false)}
          nextPath={`/?id=${post.id}`}
          title="이 기능은 회원가입해야 이용할 수 있어요."
          description="콘텐츠 열람은 계속 공개됩니다. 링크 생성, PDF 출력, 서고 저장은 회원 기능으로 제공됩니다."
        />
      ) : null}
    </>
  );
};

export default PostModal;
