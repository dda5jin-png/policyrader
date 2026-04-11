import React from 'react';

interface MarketPulseProps {
  data: {
    last_updated: string;
    market_indices: { name: string; value: string; unit: string; period: string };
    loan_rates: Array<{ name: string; rate: string; date: string }>;
    conforming_rates?: Array<{ name: string; rate: string; date: string }>;
    rent_loan_rates?: Array<{ name: string; rate: string; date: string }>;
    lh_notices: Array<{ title: string; date: string; link: string; status: string }>;
    risk_alerts: Array<{ region: string; count: string; amount: string }>;
    ai_summary?: { pulse_summary: string; checkpoints: string[] };
  } | null;
}

const MarketPulse: React.FC<MarketPulseProps> = ({ data }) => {
  if (!data) return null;

  return (
    <div className="max-w-[900px] mx-auto px-5 mb-10">
      <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl overflow-hidden shadow-sm">
        {/* Header with AI Summary */}
        <div className="p-7.5 bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] border-b border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4">
            <span className="flex h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
            <h2 className="text-[1.1rem] font-bold text-[var(--text-main)]">시장 동향 인사이트 (Market Pulse)</h2>
            <span className="ml-auto text-[0.75rem] text-[var(--text-muted)]">업데이트: {data.last_updated}</span>
          </div>
          
          {data.ai_summary && (
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-5 border border-white/80">
              <p className="text-[1rem] font-bold text-gray-800 mb-3 block">
                &ldquo;{data.ai_summary.pulse_summary}&rdquo;
              </p>
              <div className="flex flex-wrap gap-2">
                {data.ai_summary.checkpoints.map((pt, idx) => (
                  <span key={idx} className="px-3 py-1 bg-[var(--accent-soft)] text-[var(--accent)] text-[0.75rem] font-semibold rounded-lg">
                    # {pt}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Institutional Data Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x border-[var(--border)]">
          {/* REB Index */}
          <div className="p-5 flex flex-col items-center justify-center text-center">
            <span className="text-[0.7rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">매매지수 ({data.market_indices.period})</span>
            <div className="text-[1.5rem] font-black text-[var(--accent)]">
              {data.market_indices.value}{data.market_indices.unit}
            </div>
            <span className="text-[0.75rem] text-gray-400">부동산원 R-ONE</span>
          </div>

          {/* Loan Rates - Enhanced */}
          <div className="p-5 flex flex-col items-center justify-center text-center">
            <span className="text-[0.7rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">대출 금리 현황</span>
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[0.75rem] text-gray-500">보금자리</span>
                <span className="text-[0.95rem] font-bold text-blue-600">{data.loan_rates[0]?.rate || '4.25'}%</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-1">
                <span className="text-[0.75rem] text-gray-500">적격대출</span>
                <span className="text-[0.95rem] font-bold text-indigo-600">{data.conforming_rates?.[0]?.rate || '-'}%</span>
              </div>
              <div className="flex items-center justify-between gap-3 border-t border-gray-100 pt-1">
                <span className="text-[0.75rem] text-gray-500">전세자금</span>
                <span className="text-[0.95rem] font-bold text-cyan-600">{data.rent_loan_rates?.[0]?.rate || '-'}%</span>
              </div>
            </div>
            <span className="text-[0.65rem] text-gray-400 mt-2">주택금융공사 실시간</span>
          </div>

          {/* LH Notice Count */}
          <div className="p-5 flex flex-col items-center justify-center text-center">
            <span className="text-[0.7rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">신규 청약 공고</span>
            <div className="text-[1.5rem] font-black text-green-600">
              {data.lh_notices.length}건
            </div>
            <span className="text-[0.75rem] text-gray-400">LH 청약센터</span>
          </div>

          {/* HUG Risk */}
          <div className="p-5 flex flex-col items-center justify-center text-center">
            <span className="text-[0.7rem] font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">전세 사고 주의보</span>
            <div className="text-[1.5rem] font-black text-rose-500">
              {data.risk_alerts[0]?.count || '0'}건
            </div>
            <span className="text-[0.75rem] text-gray-400">HUG 최근 통계</span>
          </div>
        </div>

        {/* Detailed Footnote (Optional) */}
        <div className="px-7.5 py-4 bg-gray-50/50 flex items-center gap-4 overflow-x-auto whitespace-nowrap scrollbar-hide">
          <span className="text-[0.75rem] font-bold text-gray-500 flex-shrink-0">최신 공고:</span>
          {data.lh_notices.slice(0, 2).map((notice, i) => (
            <div key={i} className="text-[0.75rem] text-gray-600 flex items-center gap-2">
              <span className="w-1 h-1 rounded-full bg-gray-300"></span>
              {notice.title} ({notice.date})
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MarketPulse;
