export default function ContactPage() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-14">
      <h1 className="text-[2rem] font-black text-[var(--text-main)]">문의</h1>
      <div className="mt-6 space-y-4 text-[0.98rem] leading-7 text-[var(--text-muted)]">
        <p>서비스 운영 및 콘텐츠 관련 문의는 아래 이메일로 보내주세요.</p>
        <p>
          이메일:
          {" "}
          <a
            href="mailto:contact@policyradar.co.kr"
            className="font-bold text-[var(--accent)] underline underline-offset-4"
          >
            contact@policyradar.co.kr
          </a>
        </p>
        <p>광고, 제휴, 정정 요청도 같은 메일로 접수합니다.</p>
      </div>
    </main>
  );
}
