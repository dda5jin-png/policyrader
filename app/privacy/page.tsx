import Header from "@/components/Header";

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-14">
        <p className="text-[0.78rem] font-bold uppercase text-[var(--accent)]">Privacy Policy</p>
        <h1 className="mt-3 text-[2.1rem] font-black text-slate-950">개인정보처리방침</h1>
        <div className="mt-8 space-y-5 border-y border-[var(--border)] py-8 text-[1rem] leading-8 text-slate-700">
          <p>폴리시레이더는 서비스 제공에 필요한 최소한의 개인정보를 처리합니다.</p>
          <p>처리 항목은 이메일 주소, 인증 공급자 식별 정보, 접속 및 이용 기록, 저장한 자료 식별값 등이 포함될 수 있습니다.</p>
          <p>개인정보는 인증, 계정 관리, 자료 저장, 보안 점검, 서비스 품질 개선 목적에 한해 사용합니다.</p>
          <p>법령상 보관 의무가 있는 경우를 제외하고, 계정 삭제 또는 처리 목적 달성 후 지체 없이 파기합니다.</p>
          <p>개인정보 관련 문의와 삭제 요청은 kiap.center@gmail.com 로 접수할 수 있습니다.</p>
        </div>
      </main>
    </>
  );
}
