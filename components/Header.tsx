'use client';

import React, { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';

const Header = () => {
  const { data: session, isPending } = authClient.useSession();
  const [loginLoading, setLoginLoading] = useState(false);
  const [isLight, setIsLight] = useState(false);
  const [statusInfo, setStatusInfo] = useState<{
    last_check?: string;
    daily_scans?: number;
    new_posts?: number;
    status?: string;
  }>({});

  useEffect(() => {
    // 테마 설정
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsLight(true);
      document.documentElement.classList.add('light-mode');
    }

    // 상태 정보 페칭
    const fetchStatus = async () => {
      try {
        const res = await fetch('/insights.json');
        if (res.ok) {
          const data = await res.json();
          if (data.system_status) {
            setStatusInfo(data.system_status);
          }
        }
      } catch (err) {
        console.error('Failed to fetch status:', err);
      }
    };
    fetchStatus();
  }, []);

  const toggleTheme = () => {
    const newIsLight = !isLight;
    setIsLight(newIsLight);
    if (newIsLight) {
      document.documentElement.classList.add('light-mode');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light-mode');
      localStorage.setItem('theme', 'dark');
    }
  };

  return (
    <header className="sticky top-0 z-[1000] bg-[var(--glass)] backdrop-blur-[16px] border-b border-[var(--border)] px-5 py-4 pt-[max(16px,env(safe-area-inset-top))]">
      <div className="max-w-[900px] mx-auto flex justify-between items-center">
        <a href="#" className="flex items-center gap-2 sm:gap-3 font-black text-[1.05rem] sm:text-[1.3rem] text-[var(--text-main)] no-underline tracking-[-0.8px] sm:tracking-[-0.5px]">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-linear-to-br from-[var(--accent)] to-[#e11d48] rounded-lg flex items-center justify-center shadow-[0_0_15px_var(--accent-soft)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="sm:w-[20px] sm:h-[20px]">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="shrink-0">POLICY RADAR</span>
        </a>
          {/* 
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
          */}
          <div className="flex items-center gap-3">
            <button 
              onClick={toggleTheme}
              className="w-10 h-10 rounded-full bg-white/5 border border-[var(--border)] flex items-center justify-center cursor-pointer hover:bg-white/10 transition-all text-[var(--text-main)]"
              title={isLight ? "다크 모드로 전환" : "라이트 모드로 전환"}
            >
              {isLight ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.07" x2="5.64" y2="17.66" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="7.07" />
                </svg>
              )}
            </button>
            <div id="status" className="text-[0.62rem] sm:text-[0.7rem] text-[var(--text-muted)] leading-tight text-right">
              {statusInfo.last_check ? (
                <>
                  <div className="flex items-center justify-end gap-1 mb-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="font-bold text-[var(--text-main)]">{statusInfo.status || 'Active'}</span>
                  </div>
                  <div>Checked: {statusInfo.last_check.split(' ')[1]}</div>
                  <div className="opacity-70">Today: {statusInfo.daily_scans} scans / {statusInfo.new_posts} novel</div>
                </>
              ) : (
                <>
                  Real-time Data<br/>Pipeline Ready
                </>
              )}
            </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
