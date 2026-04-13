'use client';

import React, { useEffect, useState } from 'react';

import Header from '@/components/Header';
import { Hero, SloganSection } from '@/components/HeroSections';
import { Filters, PostCard } from '@/components/PostComponents';
import PostModal from '@/components/PostModal';
import GoogleAd from '@/components/AdComponent';
import type { PublicPost } from '@/lib/posts';
import { copyLink, printPDF } from '@/lib/utils';

export default function HomeClient({
  initialPosts,
}: {
  initialPosts: PublicPost[];
}) {
  const [posts, setPosts] = useState<PublicPost[]>(initialPosts);
  const [filteredPosts, setFilteredPosts] = useState<PublicPost[]>(initialPosts);
  const [category, setCategory] = useState('all');
  const [currentPost, setCurrentPost] = useState<PublicPost | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function refreshPosts() {
      try {
        const res = await fetch('/api/posts');
        if (!res.ok) {
          return;
        }

        const data = (await res.json()) as PublicPost[];
        setPosts(data);
      } catch (e) {
        console.error("데이터 로드 실패:", e);
      }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');
    if (postId) {
      const post = initialPosts.find((p) => p.id === postId);
      if (post) {
        setCurrentPost(post);
      }
    }

    void refreshPosts();
  }, [initialPosts]);

  useEffect(() => {
    if (category === 'all') {
      setFilteredPosts(posts);
      return;
    }

    setFilteredPosts(posts.filter((post) => post.cat === category));
  }, [category, posts]);

  const handlePostClick = (id: string) => {
    const post = posts.find((item) => item.id === id);
    if (!post) {
      return;
    }

    setCurrentPost(post);
    window.history.replaceState({}, '', `?id=${id}`);
  };

  const handleCloseModal = () => {
    setCurrentPost(null);
    window.history.replaceState({}, '', window.location.pathname);
  };

  return (
    <div className="min-h-screen">
      <Header />

      <main className="pb-32">
        <Hero />
        <SloganSection />
        <Filters currentCat={category} setCat={setCategory} />

        <div className="max-w-[900px] mx-auto px-5">
          {loading ? (
            <div className="text-center py-24 text-gray-500">데이터 로딩 중...</div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-24 text-gray-500">해당 카테고리에 데이터가 아직 없습니다.</div>
          ) : (
            <div className="grid gap-5">
              {filteredPosts.map((post, index) => (
                <React.Fragment key={post.id}>
                  <PostCard
                    post={post}
                    onClick={handlePostClick}
                    index={index}
                  />
                  {(index + 1) % 4 === 0 && <GoogleAd />}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </main>

      <PostModal
        post={currentPost}
        onClose={handleCloseModal}
        onCopyLink={copyLink}
        onPrintPDF={printPDF}
      />
    </div>
  );
}
