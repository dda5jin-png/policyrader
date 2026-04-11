'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';

const Header = () => {
  const { user, profile, loading, signOut } = useAuth();
  const [isLight, setIsLight] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    return window.localStorage.getItem('theme') === 'light';
  });
  const [statusInfo, setStatusInfo] = useState<{
    last_check?: string;
    daily_scans?: number;
    new_posts?: number;
    status?: string;
  }>({});

  useEffect(() => {
    document.documentElement.classList.toggle('light-mode', isLight);
  }, [isLight]);

  useEffect(() => {
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
    void fetchStatus();
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
        <Link href="/" className="flex items-center gap-2 sm:gap-3 font-black text-[1.05rem] sm:text-[1.3rem] text-[var(--text-main)] no-underline tracking-[-0.8px] sm:tracking-[-0.5px]">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-linear-to-br from-[var(--accent)] to-[#e11d48] rounded-lg flex items-center justify-center shadow-[0_0_15px_var(--accent-soft)]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="sm:w-[20px] sm:h-[20px]">
              <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="shrink-0">POLICY RADAR</span>
        </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <div className="hidden items-center gap-3 md:flex">
                <Link
                  href="/library"
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-[0.78rem] font-bold text-[var(--text-main)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  내 서고
                </Link>
                <div className="text-right">
                  <div className="text-[0.75rem] font-bold text-[var(--text-main)]">
                    {profile?.name || user.email}
                  </div>
                  <button
                    onClick={() => void signOut()}
                    className="text-[0.68rem] font-bold text-[var(--accent)] transition hover:opacity-80"
                    disabled={loading}
                  >
                    {loading ? '정리 중...' : '로그아웃'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Link
                  href="/login?next=/"
                  className="rounded-xl border border-[var(--border)] px-3 py-2 text-[0.78rem] font-bold text-[var(--text-main)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
                >
                  로그인
                </Link>
                <Link
                  href="/signup?next=/"
                  className="rounded-xl bg-[var(--accent)] px-3 py-2 text-[0.78rem] font-black text-white transition hover:opacity-90"
                >
                  회원가입
                </Link>
              </div>
            )}
            {!user ? (
              <Link
                href="/login?next=/"
                className="rounded-xl border border-[var(--border)] px-3 py-2 text-[0.72rem] font-bold text-[var(--text-main)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] md:hidden"
              >
                로그인
              </Link>
            ) : (
              <Link
                href="/library"
                className="rounded-xl border border-[var(--border)] px-3 py-2 text-[0.72rem] font-bold text-[var(--text-main)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] md:hidden"
              >
                서고
              </Link>
            )}
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
            <div id="status" className="hidden text-[0.62rem] sm:text-[0.7rem] text-[var(--text-muted)] leading-tight text-right sm:block">
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
