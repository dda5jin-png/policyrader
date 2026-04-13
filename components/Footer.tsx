import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-black/20 px-5 py-10">
      <div className="mx-auto flex max-w-[900px] flex-col gap-4 text-[0.88rem] text-[var(--text-muted)] sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-bold text-[var(--text-main)]">Policy Radar</p>
          <p className="mt-1 leading-6">
            정부 부동산 정책 원문과 핵심 요약을 공개 콘텐츠로 제공하는 아카이브입니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/about" className="underline underline-offset-4">
            서비스 소개
          </Link>
          <Link href="/contact" className="underline underline-offset-4">
            문의
          </Link>
          <Link href="/privacy" className="underline underline-offset-4">
            개인정보처리방침
          </Link>
          <Link href="/terms" className="underline underline-offset-4">
            이용약관
          </Link>
        </div>
      </div>
    </footer>
  );
}
