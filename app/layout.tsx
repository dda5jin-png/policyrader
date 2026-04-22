import type { Metadata, Viewport } from "next";
import "./globals.css";

import { AuthProvider } from "@/components/AuthProvider";
import Footer from "@/components/Footer";
import { getAuthState } from "@/lib/auth/session";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "폴리시레이더 | 부동산 정책 분석·데이터 레퍼런스",
  description: "국토교통부, 금융위원회, 한국은행 등 공공기관 자료와 통계 지표를 연결해 부동산 정책의 근거, 영향, 확인 항목을 정리합니다.",
  keywords: ["부동산정책", "국토부보도자료", "정부부동산정책", "금융정책", "부동산분석", "LTV", "DSR", "국토교통부", "금융위원회", "정책레이더", "청약정책", "임대차법령"],
  authors: [{ name: "Policy Radar Team" }],
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    title: "폴리시레이더 | 부동산 정책 분석·데이터 레퍼런스",
    description: "공공기관 정책자료와 관련 지표를 문서형 구조로 정리하는 부동산 정책 리서치 플랫폼입니다.",
    url: SITE_URL,
    siteName: "폴리시레이더",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "폴리시레이더 - 정부 부동산 정책 원문 서비스",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "폴리시레이더 | 부동산 정책 분석·데이터 레퍼런스",
    description: "공공기관 정책자료와 관련 지표를 문서형 구조로 정리하는 부동산 정책 리서치 플랫폼입니다.",
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
  maximumScale: 1,
  userScalable: false,
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
