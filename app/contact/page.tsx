import Header from "@/components/Header";

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-5 py-14">
        <p className="text-[0.78rem] font-bold uppercase text-[var(--accent)]">Contact</p>
        <h1 className="mt-3 text-[2.1rem] font-black text-slate-950">문의</h1>
        <div className="mt-8 space-y-5 border-y border-[var(--border)] py-8 text-[1rem] leading-8 text-slate-700">
          <p>서비스 운영, 자료 정정, 출처 보완, 제휴 문의는 아래 이메일로 접수합니다.</p>
          <p>
            이메일:
            {" "}
            <a href="mailto:contact@policyradar.co.kr" className="font-bold text-[var(--accent)] underline">
              contact@policyradar.co.kr
            </a>
          </p>
          <p>정정 요청 시 정책 제목, 원문 URL, 수정이 필요한 부분, 확인 가능한 근거를 함께 보내면 검토가 빠릅니다.</p>
        </div>
      </main>
    </>
  );
}
