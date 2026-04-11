import { NextResponse } from "next/server";

import { getPublicPosts } from "@/lib/posts";

export async function GET() {
  const posts = await getPublicPosts();

  return NextResponse.json(posts, {
    headers: {
      "Cache-Control": "s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
