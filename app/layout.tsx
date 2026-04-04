import type { Metadata, Viewport } from "next";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://policyrader.com';

export const metadata: Metadata = {
  title: "Policy Radar | AI Intelligence Pipeline",
  description: "복잡한 부동산 정책 흐름, 가장 빠르고 정확하게 분석합니다.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "Policy Radar | AI Intelligence Pipeline",
    description: "복잡한 부동산 정책 흐름, 가장 빠르고 정확하게 분석합니다.",
    url: SITE_URL,
    siteName: "Policy Radar",
    locale: "ko_KR",
    type: "website",
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
