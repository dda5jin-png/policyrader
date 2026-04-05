'use client';

import React, { useState } from 'react';
import { authClient } from '@/lib/auth-client';

const Header = () => {
  const { data: session, isPending } = authClient.useSession();
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError(null);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/'
      });
    } catch (err) {
      console.error('로그인 오류:', err);
      setLoginError('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');
      setLoginLoading(false);
    }
  };

  const handleLogout = async () => {
    await authClient.signOut();
  };

  return (
    <header className="sticky top-0 z-[1000] bg-[var(--glass)] backdrop-blur-[16px] border-b border-[var(--border)] px-5 py-4 pt-[max(16px,env(safe-area-inset-top))]">
      <div className="max-w-[900px] mx-auto flex justify-between items-center">
        <a href="#" className="flex items-center gap-3 font-black text-[1.3rem] text-[var(--text-main)] no-underline tracking-[-0.5px]">
          <div className="w-8 h-8 bg-linear-to-br from-[var(--accent)] to-[#e11d48] rounded-lg flex items-center justify-center shadow-[0_0_15px_var(--accent-soft)]">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round"/>
            </svg>
          </div>
          POLICY RADAR
        </a>
        <div className="flex items-center gap-4 text-right">
          {loginError && (
            <span className="text-[0.65rem] text-red-400 max-w-[120px] leading-tight">{loginError}</span>
          )}
          {!isPending && (
            <>
              {session ? (
                <div className="flex items-center gap-3">
                  <div className="flex flex-col">
                    <span className="text-[0.75rem] font-bold text-white">{session.user.name}</span>
                    <button
                      onClick={handleLogout}
                      className="text-[0.65rem] text-[var(--accent)] hover:underline cursor-pointer"
                    >
                      로그아웃
                    </button>
                  </div>
                  {session.user.image && (
                    <img src={session.user.image} alt="User profile" className="w-8 h-8 rounded-full border border-white/10" />
                  )}
                </div>
              ) : (
                <button
                  onClick={handleLogin}
                  disabled={loginLoading}
                  className="px-4 py-1.5 bg-white text-black text-[0.8rem] font-bold rounded-lg cursor-pointer hover:bg-slate-200 transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loginLoading ? (
                    <svg className="animate-spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12.48 10.92v3.28h7.84c-.24 1.84-1.95 5.39-7.84 5.39-5.08 0-9.22-4.21-9.22-9.39s4.14-9.39 9.22-9.39c2.89 0 4.83 1.23 5.94 2.29l2.6-2.5c-1.67-1.56-3.84-2.51-8.54-2.51C5.07 0 0 5.07 0 11.39s5.07 11.39 12.39 11.39c7.65 0 12.72-5.39 12.72-12.95 0-.82-.09-1.44-.21-2.07l-12.42.16z"/>
                    </svg>
                  )}
                  {loginLoading ? '로그인 중...' : '로그인'}
                </button>
              )}
            </>
          )}
          <div id="status" className="text-[0.7rem] text-[var(--text-muted)] leading-tight hidden sm:block">
            AI Intelligence<br/>Pipeline Ready
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
