import type { Metadata } from "next";

import HomeClient from "@/components/HomeClient";
import { loadFullPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "정책 원문과 관련 지표 해설 | PolicyRadar",
  description:
    "정부·공공기관 정책 원문을 바탕으로 핵심 내용, 관련 통계, 기대효과, 체크리스트를 정리하는 정책 정보 아카이브입니다.",
  alternates: { canonical: SITE_URL },
  openGraph: {
    title: "정책 원문과 관련 지표 해설 | PolicyRadar",
    description: "정책 원문을 읽고 관련 지표로 흐름을 해석합니다.",
    url: SITE_URL,
    type: "website",
    locale: "ko_KR",
  },
};

export default async function HomePage() {
  const posts = await loadFullPosts();

  return <HomeClient initialPosts={posts} />;
}
