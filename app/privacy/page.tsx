import type { Metadata } from "next";

import Header from "@/components/Header";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "개인정보처리방침 | PolicyRadar",
  description: "PolicyRadar 이용 중 수집되는 정보, 쿠키와 로그, 광고 관련 안내, 문의 이메일 처리 방식과 보관 기간을 안내합니다.",
  alternates: { canonical: `${SITE_URL}/privacy` },
  openGraph: {
    title: "개인정보처리방침 | PolicyRadar",
    description: "PolicyRadar 개인정보 처리 기준과 문의 안내입니다.",
    url: `${SITE_URL}/privacy`,
    type: "article",
    locale: "ko_KR",
  },
};

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
          <p>사이트 이용 과정에서 접속 로그, 브라우저 정보, 쿠키, 기기 정보가 보안 점검과 서비스 품질 개선 목적으로 처리될 수 있습니다.</p>
          <p>Google AdSense 등 광고 서비스가 적용되는 경우 광고 제공자는 쿠키 또는 유사 기술을 이용해 광고 노출과 부정 클릭 방지에 필요한 정보를 처리할 수 있습니다.</p>
          <p>문의 이메일을 보낸 경우 회신과 오류 검토를 위해 이메일 주소와 문의 내용을 처리하며, 처리 목적 달성 후 불필요한 내용은 지체 없이 삭제합니다.</p>
          <p>법령상 보관 의무가 있는 경우를 제외하고, 계정 삭제 또는 처리 목적 달성 후 지체 없이 파기합니다.</p>
          <p>폴리시레이더는 법령에 근거하거나 이용자 동의가 있는 경우를 제외하고 개인정보를 제3자에게 제공하지 않습니다.</p>
          <p>개인정보 관련 문의와 삭제 요청은 kiap.center@gmail.com 로 접수할 수 있습니다.</p>
        </div>
      </main>
    </>
  );
}
