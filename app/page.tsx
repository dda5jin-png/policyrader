'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Hero, SloganSection } from '../components/HeroSections';
import { Filters, PostCard, Post } from '../components/PostComponents';
import PostModal from '../components/PostModal';
import { copyLink, printPDF } from '../lib/utils';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState('all');
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/posts.json?v=' + Date.now());
        const data = await res.json();
        setPosts(data);
        setFilteredPosts(data);
        
        // Deep Link check
        const urlParams = new URLSearchParams(window.location.search);
        const postId = urlParams.get('id');
        if (postId) {
          const post = data.find((p: Post) => p.id === postId);
          if (post) setCurrentPost(post);
        }
      } catch (e) {
        console.error("데이터 로드 실패:", e);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);

  useEffect(() => {
    if (category === 'all') {
      setFilteredPosts(posts);
    } else {
      setFilteredPosts(posts.filter(p => p.cat === category));
    }
  }, [category, posts]);

  const handlePostClick = (id: string) => {
    const post = posts.find(p => p.id === id);
    if (post) {
      setCurrentPost(post);
      window.history.replaceState({}, '', `?id=${id}`);
    }
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
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onClick={handlePostClick} 
                  index={index} 
                />
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
