import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://policyradar.co.kr';

export const metadata: Metadata = {
  title: "Policy Radar - 데이터 기반 부동산·금융 정책 실시간 분석 서비스",
  description: "복잡한 부동산 정책과 금융 뉴스, 실시간 전문 리서치를 통해 핵심 정보와 전문가 통찰을 제공합니다. LTV, 세금, 분양 정보를 한눈에 확인하세요.",
  keywords: ["부동산정책", "금융정책", "부동산분석", "LTV", "DSR", "국토교통부", "금융위원회", "정책레이더"],
  authors: [{ name: "Policy Radar Team" }],
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Policy Radar | 실시간 부동산·금융 정책 리서치",
    description: "가장 빠른 부동산 정책 분석 서비스. 전문가의 통찰과 심층 요약 리포트를 통해 성공적인 부동산 의사결정을 도와드립니다.",
    url: SITE_URL,
    siteName: "Policy Radar",
    images: [
      {
        url: "/logo.svg",
        width: 1200,
        height: 630,
        alt: "Policy Radar Logo",
      },
    ],
    locale: "ko_KR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Policy Radar | 실시간 부동산·금융 정책 리서치",
    description: "복잡한 정책 흐름, 실시간으로 정리해 드립니다.",
    images: ["/logo.svg"],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  manifest: "/manifest.json",
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
