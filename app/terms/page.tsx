export default function TermsPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-[2rem] font-black text-[var(--text-main)]">이용약관</h1>
      <div className="mt-6 space-y-4 text-[0.98rem] leading-7 text-[var(--text-muted)]">
        <p>폴리시레이더는 공개된 정책 자료를 바탕으로 정보 탐색을 돕는 서비스입니다.</p>
        <p>서비스 내 요약 및 분석 정보는 참고용이며, 최종 판단은 반드시 원문과 공식 공고를 확인한 뒤 진행해야 합니다.</p>
        <p>운영자는 서비스 안정성과 정확성을 높이기 위해 노력하지만, 자료 지연이나 외부 원문 변경에 따른 차이에 대해 책임을 보증하지 않습니다.</p>
        <p>비정상적 트래픽 유발, 무단 수집, 서비스 운영 방해 행위는 제한될 수 있습니다.</p>
      </div>
    </main>
  );
}
