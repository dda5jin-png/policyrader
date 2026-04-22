import Header from "@/components/Header";

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-14">
        <p className="text-[0.78rem] font-bold uppercase text-[var(--accent)]">About</p>
        <h1 className="mt-3 text-[2.1rem] font-black leading-tight text-slate-950">서비스 소개</h1>
        <div className="mt-8 space-y-6 border-y border-[var(--border)] py-8 text-[1rem] leading-8 text-slate-700">
          <p>
            폴리시레이더는 부동산 정책자료 원문, 공공기관 API, 공개 통계 자료를 연결해 정책의 배경과 영향을
            읽을 수 있도록 정리하는 리서치 아카이브입니다.
          </p>
          <p>
            주요 출처는 국토교통부, 금융위원회, 기획재정부, 한국은행, 통계청, 법제처 등 공공기관 자료입니다.
            각 정책 콘텐츠에는 발표 기관, 발표일, 업데이트 기준, 원문 링크를 함께 표시합니다.
          </p>
          <p>
            운영 방향은 단순 요약보다 근거 확인과 비교 가능한 구조에 있습니다. 정책 개요, 핵심 내용, 관련 지표,
            시장 영향, 확인 항목, 원문 출처를 같은 순서로 제공해 이용자가 자료를 독립적으로 검토할 수 있게 합니다.
          </p>
        </div>
      </main>
    </>
  );
}
