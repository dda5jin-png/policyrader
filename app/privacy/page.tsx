export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-[2rem] font-black text-[var(--text-main)]">개인정보처리방침</h1>
      <div className="mt-6 space-y-4 text-[0.98rem] leading-7 text-[var(--text-muted)]">
        <p>폴리시레이더는 회원가입, 로그인, 서고 저장 기능 제공을 위해 최소한의 개인정보를 처리합니다.</p>
        <p>수집 항목에는 이메일 주소, 인증 공급자 식별 정보, 서비스 이용 기록이 포함될 수 있습니다.</p>
        <p>수집한 정보는 인증 처리, 계정 관리, 저장 기능 제공, 서비스 운영 안정화 목적에 한해 사용합니다.</p>
        <p>법령에 따른 보관 의무가 없는 한, 계정 삭제 요청 시 관련 정보는 지체 없이 파기합니다.</p>
        <p>개인정보 관련 문의는 contact@policyradar.co.kr 로 접수할 수 있습니다.</p>
      </div>
    </main>
  );
}
