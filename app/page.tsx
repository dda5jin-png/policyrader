import HomeClient from "@/components/HomeClient";
import { getPublicPosts } from "@/lib/posts";

export default async function HomePage() {
  const posts = await getPublicPosts();

  return <HomeClient initialPosts={posts} />;
}
