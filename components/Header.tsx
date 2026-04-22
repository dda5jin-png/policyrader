'use client';

import Link from 'next/link';

import { useAuth } from '@/components/AuthProvider';

const navItems = [
  { href: '/', label: '정책자료' },
  { href: '/guides', label: '레퍼런스' },
  { href: '/about', label: '소개' },
  { href: '/contact', label: '문의' },
];

export default function Header() {
  const { user, profile, loading, signOut } = useAuth();

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
    </header>
  );
}
