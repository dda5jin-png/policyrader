import { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://policyrader.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // posts.json 읽어서 각 게시물 URL 생성
  let postEntries: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(`${BASE_URL}/posts.json`);
    const posts = await res.json();
    postEntries = posts.map((post: { id: string; date: string }) => ({
      url: `${BASE_URL}/?id=${post.id}`,
      lastModified: new Date(post.date),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    }));
  } catch {
    // posts.json 로드 실패 시 메인 페이지만 포함
  }

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...postEntries,
  ];
}
