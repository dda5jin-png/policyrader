'use client';
import React from 'react';
import { authClient } from '@/lib/auth-client';

interface PaywallModalProps {
  onClose: () => void;
}

const PaywallModal: React.FC<PaywallModalProps> = ({ onClose }) => {
  const handleLogin = async () => {
    await authClient.signIn.social({
      provider: 'google',
      callbackURL: window.location.href
    });
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-[4px] z-[3000] flex items-center justify-center p-5 animate-[modalFade_0.3s_cubic-bezier(0.16,1,0.3,1)]">
      <div className="w-full max-w-[400px] bg-[#0f172a] border border-[var(--border)] rounded-[32px] p-10 text-center relative shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]">
        <div className="absolute top-6 right-6 w-10 h-10 bg-white/5 rounded-full flex items-center justify-center cursor-pointer text-white hover:bg-white/10 transition-colors" onClick={onClose}>✕</div>
        
        <div className="w-16 h-16 bg-linear-to-br from-[var(--accent)] to-[#e11d48] rounded-[22px] flex items-center justify-center mx-auto mb-8 shadow-[0_8px_30px_var(--accent-soft)]">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2 className="text-[1.4rem] font-bold text-white mb-4 leading-[1.35] tracking-tight">
          가입하고 전문가 인사이트와<br/>프리미엄 기능을 모두 누려보세요!
        </h2>
        
        <p className="text-[var(--text-muted)] text-[0.9rem] mb-10 leading-relaxed font-medium">
          로그인하시면 모든 분석 리포트와<br/>PDF 출력, 링크 공유 기능을 즉시 사용할 수 있습니다.
        </p>

        <button 
          onClick={handleLogin}
          className="w-full py-4.5 bg-white text-black text-[1rem] font-black rounded-2xl cursor-pointer hover:bg-slate-100 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-[0_10px_20px_rgba(255,255,255,0.1)]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.48 10.92v3.28h7.84c-.24 1.84-1.95 5.39-7.84 5.39-5.08 0-9.22-4.21-9.22-9.39s4.14-9.39 9.22-9.39c2.89 0 4.83 1.23 5.94 2.29l2.6-2.5c-1.67-1.56-3.84-2.51-8.54-2.51C5.07 0 0 5.07 0 11.39s5.07 11.39 12.39 11.39c7.65 0 12.72-5.39 12.72-12.95 0-.82-.09-1.44-.21-2.07l-12.42.16z"/>
          </svg>
          구글로 3초 만에 시작하기
        </button>

        <button 
          onClick={onClose}
          className="mt-6 text-[0.8rem] border-b border-transparent text-[var(--text-muted)] hover:text-white hover:border-white transition-all cursor-pointer font-bold"
        >
          나중에 할게요
        </button>
      </div>
    </div>
  );
};

export default PaywallModal;
