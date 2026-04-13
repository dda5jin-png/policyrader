export default function AboutPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-[2rem] font-black text-[var(--text-main)]">서비스 소개</h1>
      <div className="mt-6 space-y-4 text-[0.98rem] leading-7 text-[var(--text-muted)]">
        <p>
          폴리시레이더는 국토교통부, 기획재정부, 금융위원회 등 정부 기관의 정책 보도자료를
          빠르게 모아 핵심 내용을 정리하는 정책 아카이브입니다.
        </p>
        <p>
          공개 페이지에서는 제목, 출처, 핵심 요약, 일부 근거 문장을 확인할 수 있으며,
          로그인 사용자에게는 추가 분석 기능을 제공합니다.
        </p>
        <p>
          사이트는 이용자가 원문과 함께 정책 변화를 추적할 수 있도록 공식 출처 링크를 함께 제공합니다.
        </p>
      </div>
    </main>
  );
}
