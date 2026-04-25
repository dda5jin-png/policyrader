import { notFound } from "next/navigation";
import PostDetail from "@/components/PostDetail";
import { getFullPostById, loadFullPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";
import { decodeHTMLEntities } from "@/lib/utils";
import type { Metadata } from "next";

export async function generateStaticParams() {
  const posts = await loadFullPosts();
  return posts.map((post) => ({
    post_type: post.post_type || "insight",
    id: post.id,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ post_type: string; id: string }> }): Promise<Metadata> {
  const { post_type, id } = await params;
  
  if (!["insight", "analysis", "opinion"].includes(post_type)) {
    return { title: "정책을 찾을 수 없습니다 | 폴리시레이더" };
  }

  const post = await getFullPostById(id);

  if (!post) {
    return { title: "정책을 찾을 수 없습니다 | 폴리시레이더" };
  }

  const title = `${decodeHTMLEntities(post.headline)} | 폴리시레이더`;
  const description = decodeHTMLEntities(
    post.content_sections?.summary.slice(0, 160) || post.summary?.join(" ").slice(0, 160) || post.evidenceText || ""
  );
  const url = `${SITE_URL}/${post_type}/${post.id}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url, type: "article", locale: "ko_KR" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function PostTypePage({ params }: { params: Promise<{ post_type: string; id: string }> }) {
  const { post_type, id } = await params;

  if (!["insight", "analysis", "opinion"].includes(post_type)) {
    notFound();
  }

  const post = await getFullPostById(id);
  
  // URL matching constraint: if a post has a post_type, the URL must match it.
  // Legacy posts (no post_type) are mapped to "insight" implicitly as per generateStaticParams
  const expectedPostType = post?.post_type || "insight";

  if (!post || expectedPostType !== post_type) {
    notFound();
  }

  return <PostDetail post={post} />;
}
