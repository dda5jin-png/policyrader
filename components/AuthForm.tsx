'use client';

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/config";

interface AuthFormProps {
  mode: "login" | "signup";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const supabase = useMemo(() => {
    if (!hasSupabaseEnv()) {
      return null;
    }

    return createBrowserSupabaseClient();
  }, []);
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/";
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callbackUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextPath)}`
      : undefined;

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setError("Supabase 환경 변수가 아직 설정되지 않았습니다.");
      return;
    }

    setPending(true);
    setError(null);

    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: callbackUrl,
      },
    });

    if (oauthError) {
      setError(oauthError.message);
      setPending(false);
    }
  };

  const handleEmailMagicLink = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!supabase) {
      setError("Supabase 환경 변수가 아직 설정되지 않았습니다.");
      return;
    }

    setPending(true);
    setError(null);
    setMessage(null);

    const { error: otpError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: callbackUrl,
        shouldCreateUser: true,
      },
    });

    if (otpError) {
      setError(otpError.message);
      setPending(false);
      return;
    }

    setMessage("이메일 로그인 링크를 보냈습니다. 메일함에서 인증을 완료해 주세요.");
    setPending(false);
  };

  const otherModeHref = mode === "login" ? `/signup?next=${encodeURIComponent(nextPath)}` : `/login?next=${encodeURIComponent(nextPath)}`;

  return (
    <div className="w-full max-w-[460px] rounded-[32px] border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-[var(--shadow-lg)]">
      <div className="mb-6">
        <div className="mb-3 inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[0.72rem] font-bold text-[var(--accent)]">
          {mode === "login" ? "로그인" : "회원가입"}
        </div>
        <h1 className="text-[1.8rem] font-black leading-tight text-[var(--text-main)]">
          {mode === "login" ? "프리미엄 인사이트를 이어서 보세요." : "3초 만에 가입하고 잠금을 해제하세요."}
        </h1>
        <p className="mt-3 text-[0.92rem] leading-relaxed text-[var(--text-muted)]">
          공개 콘텐츠는 그대로 열어두고, 로그인한 사용자에게만 추가 인사이트와 내 서고 구조를 연결합니다.
        </p>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={pending}
        className="flex w-full items-center justify-center gap-3 rounded-2xl bg-white px-5 py-4 text-[0.98rem] font-black text-black transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-70"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-1.95 5.39-7.84 5.39-5.08 0-9.22-4.21-9.22-9.39s4.14-9.39 9.22-9.39c2.89 0 4.83 1.23 5.94 2.29l2.6-2.5c-1.67-1.56-3.84-2.51-8.54-2.51C5.07 0 0 5.07 0 11.39s5.07 11.39 12.39 11.39c7.65 0 12.72-5.39 12.72-12.95 0-.82-.09-1.44-.21-2.07l-12.42.16z" />
        </svg>
        {pending ? "연결 중..." : "Google로 계속하기"}
      </button>

      <div className="my-6 flex items-center gap-3 text-[0.8rem] text-[var(--text-muted)]">
        <div className="h-px flex-1 bg-[var(--border)]" />
        <span>또는 이메일 링크</span>
        <div className="h-px flex-1 bg-[var(--border)]" />
      </div>

      <form onSubmit={handleEmailMagicLink} className="space-y-3">
        <label className="block text-[0.8rem] font-bold text-[var(--text-main)]" htmlFor="email">
          이메일
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-[var(--border)] bg-[var(--primary)] px-4 py-3 text-[0.95rem] text-[var(--text-main)] outline-none transition focus:border-[var(--accent)]"
        />
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded-2xl border border-[var(--accent)] px-5 py-3 text-[0.95rem] font-bold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "전송 중..." : "이메일 링크 받기"}
        </button>
      </form>

      {message ? <p className="mt-4 text-[0.82rem] text-emerald-400">{message}</p> : null}
      {error ? <p className="mt-4 text-[0.82rem] text-rose-400">{error}</p> : null}

      <div className="mt-6 rounded-2xl bg-[var(--accent-soft)]/60 p-4 text-[0.82rem] leading-relaxed text-[var(--text-muted)]">
        로그인하면 링크 생성, PDF 출력, 원문 바로가기, 서고 저장 기능을 사용할 수 있습니다.
      </div>

      {!supabase ? (
        <p className="mt-4 text-[0.82rem] text-amber-300">
          Supabase URL과 anon key를 `.env.local`에 넣기 전까지는 실제 로그인 연결이 비활성화됩니다.
        </p>
      ) : null}

      <p className="mt-6 text-[0.82rem] text-[var(--text-muted)]">
        {mode === "login" ? "아직 계정이 없나요?" : "이미 계정이 있나요?"}{" "}
        <Link href={otherModeHref} className="font-bold text-[var(--accent)] underline-offset-4 hover:underline">
          {mode === "login" ? "회원가입으로 이동" : "로그인으로 이동"}
        </Link>
      </p>
    </div>
  );
}
