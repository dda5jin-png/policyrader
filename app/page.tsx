import HomeClient from "@/components/HomeClient";
import { loadFullPosts } from "@/lib/posts";

export default async function HomePage() {
  const posts = await loadFullPosts();

  return <HomeClient initialPosts={posts} />;
}
