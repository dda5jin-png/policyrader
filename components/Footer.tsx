import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-slate-50 px-5 py-10">
      <div className="mx-auto flex max-w-[1100px] flex-col gap-6 text-[0.88rem] text-[var(--text-muted)] lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="font-bold text-[var(--text-main)]">Policy Radar</p>
          <p className="mt-1 max-w-xl leading-6">
            정부·공공기관 정책 원문과 공개 지표를 함께 읽는 정책 정보 아카이브입니다.
            해설은 참고용이며 최종 판단 전 원문과 담당 기관 안내를 확인해야 합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          <Link href="/about" className="underline underline-offset-4">
            소개
          </Link>
          <Link href="/usage-guide" className="underline underline-offset-4">
            이용 가이드
          </Link>
          <Link href="/data-sources" className="underline underline-offset-4">
            데이터 출처
          </Link>
          <Link href="/columns" className="underline underline-offset-4">
            정책 해설 칼럼
          </Link>
          <Link href="/guides" className="underline underline-offset-4">
            정책 레퍼런스
          </Link>
          <Link href="/contact" className="underline underline-offset-4">
            문의
          </Link>
          <Link href="/privacy" className="underline underline-offset-4">
            개인정보처리방침
          </Link>
          <Link href="/terms" className="underline underline-offset-4">
            면책고지
          </Link>
        </div>
      </div>
    </footer>
  );
}
