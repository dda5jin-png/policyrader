import Header from "@/components/Header";

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-14">
        <p className="text-[0.78rem] font-bold uppercase text-[var(--accent)]">Terms of Service</p>
        <h1 className="mt-3 text-[2.1rem] font-black text-slate-950">이용약관</h1>
        <div className="mt-8 space-y-5 border-y border-[var(--border)] py-8 text-[1rem] leading-8 text-slate-700">
          <p>폴리시레이더는 공개된 정책자료와 통계 정보를 바탕으로 부동산 정책 이해를 돕는 정보 서비스를 제공합니다.</p>
          <p>서비스 내 요약, 지표 정리, 해석 문단은 참고 자료이며, 법률·세무·투자 자문으로 해석되지 않습니다.</p>
          <p>이용자는 정책 판단, 거래, 신고, 대출 신청 전 반드시 원문 공고와 담당 기관의 최신 안내를 확인해야 합니다.</p>
          <p>무단 대량 수집, 비정상적 트래픽 유발, 서비스 운영 방해 행위는 제한될 수 있습니다.</p>
          <p>외부 기관의 원문 수정, 링크 변경, 통계 기준 변경에 따라 서비스 내용은 업데이트될 수 있습니다.</p>
        </div>
      </main>
    </>
  );
}
