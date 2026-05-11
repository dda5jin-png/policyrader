'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useAuth } from '@/components/AuthProvider';

const navItems = [
  { href: '/', label: '정책자료' },
  { href: '/columns', label: '해설 칼럼' },
  { href: '/usage-guide', label: '이용 가이드' },
  { href: '/data-sources', label: '데이터 출처' },
  { href: '/about', label: '소개' },
  { href: '/contact', label: '문의' },
];

export default function Header() {
  const { user, profile, loading, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-[1000] border-b border-[var(--border)] bg-white/95 px-5 py-3 backdrop-blur">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 text-slate-950">
          <span className="flex h-9 w-9 items-center justify-center bg-slate-950 text-[0.78rem] font-black text-white">
            PR
          </span>
          <span className="text-[1.05rem] font-black">Policy Radar</span>
        </Link>

        <nav className="hidden items-center gap-5 md:flex" aria-label="주요 메뉴">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="text-[0.9rem] font-bold text-slate-600 transition hover:text-slate-950">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileOpen((current) => !current)}
            className="inline-flex h-10 min-w-10 items-center justify-center border border-slate-300 text-[0.82rem] font-bold text-slate-800 md:hidden"
            aria-expanded={mobileOpen}
            aria-controls="mobile-navigation"
          >
            메뉴
          </button>
          {user ? (
            <>
              <Link href="/library" className="hidden border border-slate-300 px-3 py-2 text-[0.82rem] font-bold text-slate-800 sm:inline-flex">
                내 서고
              </Link>
              <button
                type="button"
                onClick={() => void signOut()}
                disabled={loading}
                className="border border-slate-300 px-3 py-2 text-[0.82rem] font-bold text-slate-800"
                title={profile?.name || user.email || '계정'}
              >
                {loading ? '처리 중' : '로그아웃'}
              </button>
            </>
          ) : (
            <>
              <Link href="/login?next=/" className="border border-slate-300 px-3 py-2 text-[0.82rem] font-bold text-slate-800">
                로그인
              </Link>
              <Link href="/signup?next=/" className="hidden bg-slate-950 px-3 py-2 text-[0.82rem] font-bold text-white sm:inline-flex">
                회원가입
              </Link>
            </>
          )}
        </div>
      </div>
      {mobileOpen ? (
        <nav id="mobile-navigation" className="mx-auto mt-3 grid max-w-[1440px] gap-2 border-t border-[var(--border)] pt-3 md:hidden" aria-label="모바일 메뉴">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="border-y border-[var(--border)] bg-white py-3 text-[0.95rem] font-bold text-slate-700"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/guides"
            onClick={() => setMobileOpen(false)}
            className="border-y border-[var(--border)] bg-white py-3 text-[0.95rem] font-bold text-slate-700"
          >
            정책 레퍼런스
          </Link>
        </nav>
      ) : null}
    </header>
  );
}
