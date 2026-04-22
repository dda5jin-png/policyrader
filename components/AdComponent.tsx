'use client';
import React from 'react';

const GoogleAd = ({ className = '' }: { className?: string }) => {
  return null; 

  return (
    <div className={`my-8 p-6 rounded-2xl border border-[var(--border)] bg-white/3 flex flex-col items-center justify-center min-h-[150px] relative overflow-hidden group ${className}`}>
      <div className="absolute top-3 left-3 flex items-center gap-1.5 grayscale opacity-30 group-hover:opacity-60 transition-opacity">
        <div className="w-4 h-4 bg-yellow-400 rounded-sm" />
        <span className="text-[0.6rem] font-bold tracking-widest text-[var(--text-muted)]">SPONSORED</span>
      </div>
      
      <div className="text-center space-y-2">
        <div className="text-[var(--text-muted)] text-[0.8rem] font-medium">Content Notice</div>
        <div className="text-[0.65rem] text-[var(--border)] italic">본문 흐름을 방해하지 않는 안내 영역입니다</div>
      </div>

      {/* Decorative pulse for placeholder effect */}
      <div className="absolute inset-0 bg-linear-to-r from-transparent via-white/5 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
      
      <style jsx>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default GoogleAd;
