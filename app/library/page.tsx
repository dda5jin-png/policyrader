'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/components/AuthProvider";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import type { PublicPost } from "@/lib/posts";
import { decodeHTMLEntities } from "@/lib/utils";

interface SavedPostRow {
  post_id: string;
  created_at: string;
}

interface SavedPostView extends PublicPost {
  saved_at: string;
}

export default function LibraryPage() {
  const { user, profile, loading } = useAuth();
  const supabase = useMemo(() => createBrowserSupabaseClient(), []);
  const [savedPosts, setSavedPosts] = useState<SavedPostView[]>([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadSavedPosts = async () => {
      if (!user) {
        setSavedPosts([]);
        setPageLoading(false);
        return;
      }

      setPageLoading(true);
      setErrorMessage(null);

      try {
        const [{ data: savedRows, error: savedError }, postsResponse] = await Promise.all([
          supabase
            .from("saved_posts")
            .select("post_id, created_at")
            .eq("user_id", user.id)
            .order("created_at", { ascending: false }),
          fetch("/api/posts", { credentials: "include" }),
        ]);

        if (savedError) {
          throw new Error(savedError.message);
        }

        const posts = (await postsResponse.json()) as PublicPost[];
        const postsById = new Map(posts.map((post) => [post.id, post]));

        const items = ((savedRows || []) as SavedPostRow[])
          .map((row) => {
            const matchedPost = postsById.get(row.post_id);

            if (!matchedPost) {
              return null;
            }

            return {
              ...matchedPost,
              saved_at: row.created_at,
            };
          })
          .filter((item): item is SavedPostView => Boolean(item));

        if (!cancelled) {
          setSavedPosts(items);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Failed to load library", error);
          setErrorMessage("서고를 불러오는 중 오류가 발생했습니다.");
        }
      } finally {
        if (!cancelled) {
          setPageLoading(false);
        }
      }
    };

    void loadSavedPosts();

    return () => {
      cancelled = true;
    };
  }, [supabase, user]);

  const displayName = profile?.name || user?.email || "회원";

  if (loading || pageLoading) {
    return (
      <main className="mx-auto flex min-h-screen max-w-[900px] items-center justify-center px-5 py-16">
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--card-bg)] px-6 py-5 text-[0.92rem] text-[var(--text-muted)]">
          내 서고를 불러오는 중입니다...
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="mx-auto flex min-h-screen max-w-[900px] items-center justify-center px-5 py-16">
        <div className="w-full max-w-[520px] rounded-[32px] border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-[var(--shadow-lg)]">
          <div className="mb-4 inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[0.72rem] font-bold text-[var(--accent)]">
            내 서고
          </div>
          <h1 className="text-[1.8rem] font-black text-[var(--text-main)]">로그인 후 저장한 자료를 볼 수 있습니다.</h1>
          <p className="mt-3 text-[0.95rem] leading-relaxed text-[var(--text-muted)]">
            콘텐츠는 공개로 열람할 수 있고, 서고는 회원 전용 저장 기능으로 동작합니다.
          </p>
          <div className="mt-6 flex gap-3">
            <Link
              href="/login?next=/library"
              className="rounded-2xl border border-[var(--border)] px-5 py-3 text-[0.92rem] font-bold text-[var(--text-main)] transition hover:border-[var(--accent)] hover:text-[var(--accent)]"
            >
              로그인
            </Link>
            <Link
              href="/signup?next=/library"
              className="rounded-2xl bg-[var(--accent)] px-5 py-3 text-[0.92rem] font-black text-white transition hover:opacity-90"
            >
              회원가입
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-[900px] px-5 py-16">
      <div className="rounded-[32px] border border-[var(--border)] bg-[var(--card-bg)] p-8 shadow-[var(--shadow-lg)]">
        <div className="mb-4 inline-flex rounded-full bg-[var(--accent-soft)] px-3 py-1 text-[0.72rem] font-bold text-[var(--accent)]">
          내 서고
        </div>
        <h1 className="text-[2rem] font-black text-[var(--text-main)]">
          {displayName}님의 보관함
        </h1>
        <p className="mt-3 max-w-[680px] text-[0.95rem] leading-relaxed text-[var(--text-muted)]">
          저장한 보도자료를 이곳에서 다시 열어볼 수 있습니다. 공개 콘텐츠 열람은 누구나 가능하고,
          회원은 원하는 자료를 서고에 담아 다시 찾아볼 수 있게 구성했습니다.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--primary)]/70 p-5">
            <h2 className="text-[1rem] font-bold text-[var(--text-main)]">현재 계정 상태</h2>
            <ul className="mt-4 space-y-2 text-[0.88rem] text-[var(--text-muted)]">
              <li>email: {user.email}</li>
              <li>role: {profile?.role || "user"}</li>
              <li>free_daily_limit: {profile?.free_daily_limit ?? 3}</li>
              <li>paid_plan: {profile?.paid_plan || "없음"}</li>
            </ul>
          </div>
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--primary)]/70 p-5">
            <h2 className="text-[1rem] font-bold text-[var(--text-main)]">저장된 자료 수</h2>
            <p className="mt-4 text-[0.88rem] leading-relaxed text-[var(--text-muted)]">
              현재 서고에 담긴 자료는 {savedPosts.length}건입니다.
            </p>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-[1.1rem] font-bold text-[var(--text-main)]">저장한 자료</h2>
          {errorMessage ? (
            <div className="mt-4 rounded-3xl border border-[var(--border)] bg-[var(--primary)]/70 p-5 text-[0.9rem] text-rose-300">
              {errorMessage}
            </div>
          ) : savedPosts.length === 0 ? (
            <div className="mt-4 rounded-3xl border border-[var(--border)] bg-[var(--primary)]/70 p-5 text-[0.9rem] text-[var(--text-muted)]">
              아직 저장한 자료가 없습니다. 상세 화면에서 `서고 저장` 버튼을 누르면 이곳에 쌓입니다.
            </div>
          ) : (
            <div className="mt-4 grid gap-4">
              {savedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/?id=${post.id}`}
                  className="rounded-3xl border border-[var(--border)] bg-[var(--primary)]/70 p-5 transition hover:border-[var(--accent)]"
                >
                  <div className="text-[0.75rem] text-[var(--text-muted)]">
                    {post.date} · 저장됨 {new Date(post.saved_at).toLocaleDateString("ko-KR")}
                  </div>
                  <div className="mt-2 text-[1rem] font-bold text-[var(--text-main)]">
                    {decodeHTMLEntities(post.headline)}
                  </div>
                  <div className="mt-2 text-[0.88rem] text-[var(--text-muted)]">{post.source}</div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="mt-8">
          <Link
            href="/"
            className="inline-flex rounded-2xl border border-[var(--accent)] px-5 py-3 text-[0.92rem] font-bold text-[var(--accent)] transition hover:bg-[var(--accent)] hover:text-white"
          >
            콘텐츠 보러 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
