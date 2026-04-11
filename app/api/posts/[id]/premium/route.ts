import { NextResponse } from "next/server";

import { getFullPostById, toPremiumPost } from "@/lib/posts";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const post = await getFullPostById(id);

  if (!post) {
    return NextResponse.json({ error: "Post not found." }, { status: 404 });
  }

  return NextResponse.json(toPremiumPost(post), {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
