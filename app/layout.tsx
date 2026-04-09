import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://policyradar.co.kr';

export const metadata: Metadata = {
  title: "폴리시레이더 | 정부 부동산 정책 원문 · 매일 업데이트",
  description: "국토부·기재부 부동산 정책 보도자료를 원문 그대로 확인하세요. 핵심 지표 분석, 체크리스트, PDF 출력, 원문 바로가기까지 한 곳에서 제공합니다.",
  keywords: ["부동산정책", "국토부보도자료", "정부부동산정책", "금융정책", "부동산분석", "LTV", "DSR", "국토교통부", "금융위원회", "정책레이더", "청약정책", "임대차법령"],
  authors: [{ name: "Policy Radar Team" }],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "오늘 발표된 부동산 정책 원문 — 분석·체크리스트·PDF까지",
    description: "국토부·기재부 보도자료를 원문 그대로. 핵심 지표 분석·체크리스트·PDF 출력까지 한 곳에서.",
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
    title: "오늘 발표된 부동산 정책 원문 — 분석·체크리스트·PDF까지",
    description: "국토부·기재부 보도자료를 원문 그대로. 핵심 지표 분석·체크리스트·PDF 출력까지 한 곳에서.",
    images: ["/logo.svg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  manifest: "/manifest.json",
  other: {
    "naver-site-verification": "",
  },
};

export const viewport: Viewport = {
  themeColor: "#030712",
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
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.css" />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
