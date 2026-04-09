'use client';

import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Hero, SloganSection } from '../components/HeroSections';
import MarketPulse from '../components/MarketPulse';
import { Filters, PostCard, Post } from '../components/PostComponents';
import PostModal from '../components/PostModal';
import GoogleAd from '../components/AdComponent';
import { copyLink, printPDF } from '../lib/utils';

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<Post[]>([]);
  const [category, setCategory] = useState('all');
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [insightData, setInsightData] = useState<any>(null);
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

        // Fetch Institutional Insights
        try {
          const insightRes = await fetch('/insights.json?v=' + Date.now());
          if (insightRes.ok) {
            const iData = await insightRes.json();
            setInsightData(iData);
          }
        } catch (err) {
          console.warn("인사이트 데이터 로드 실패 (무시됨)");
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
        
        <MarketPulse data={insightData} />
        
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
