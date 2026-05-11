import type { Metadata, Viewport } from "next";
import "./globals.css";

import { AuthProvider } from "@/components/AuthProvider";
import Footer from "@/components/Footer";
import { getAuthState } from "@/lib/auth/session";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "PolicyRadar | 정책 원문·지표 기반 해설 아카이브",
  description: "정부·공공기관 정책 원문과 공개 통계를 연결해 정책의 핵심 내용, 관련 지표, 체크리스트, 확인해야 할 쟁점을 정리합니다.",
  keywords: ["부동산정책", "국토부보도자료", "정부부동산정책", "금융정책", "부동산분석", "LTV", "DSR", "국토교통부", "금융위원회", "정책레이더", "청약정책", "임대차법령"],
  authors: [{ name: "Policy Radar Team" }],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "PolicyRadar | 정책 원문·지표 기반 해설 아카이브",
    description: "공공기관 정책자료와 관련 지표를 문서형 구조로 정리하는 정책 정보 아카이브입니다.",
    url: SITE_URL,
    siteName: "폴리시레이더",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "PolicyRadar - 정책 원문과 지표 기반 해설 아카이브",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PolicyRadar | 정책 원문·지표 기반 해설 아카이브",
    description: "공공기관 정책자료와 관련 지표를 문서형 구조로 정리하는 정책 정보 아카이브입니다.",
    images: ["/logo.svg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  manifest: "/manifest.json",
  other: {
    "naver-site-verification": "269c67cdfcae29d8532808c79f279dd9ea2e507a",
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const authStatePromise = getAuthState();

  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5425413650163755"
             crossOrigin="anonymous"></script>
      </head>
      <body>
        <AuthLayout authStatePromise={authStatePromise}>{children}</AuthLayout>
      </body>
    </html>
  );
}

async function AuthLayout({
  children,
  authStatePromise,
}: Readonly<{
  children: React.ReactNode;
  authStatePromise: ReturnType<typeof getAuthState>;
}>) {
  const authState = await authStatePromise;

  return (
    <AuthProvider initialUser={authState.user} initialProfile={authState.profile}>
      {children}
      <Footer />
    </AuthProvider>
  );
}
