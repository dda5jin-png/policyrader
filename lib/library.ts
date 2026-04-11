import type { SupabaseClient } from "@supabase/supabase-js";

import { getFullPostById, toPublicPost, type PublicPost } from "@/lib/posts";

export interface SavedPostRecord {
  user_id: string;
  post_id: string;
  created_at: string;
}

export interface SavedPostItem extends PublicPost {
  saved_at: string;
}

export async function listSavedPostIds(
  supabase: SupabaseClient,
  userId: string,
): Promise<SavedPostRecord[]> {
  const { data, error } = await supabase
    .from("saved_posts")
    .select("user_id, post_id, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error || !data) {
    console.error("Failed to load saved posts", error);
    return [];
  }

  return data as SavedPostRecord[];
}

export async function getSavedPostsForUser(
  supabase: SupabaseClient,
  userId: string,
): Promise<SavedPostItem[]> {
  const savedRecords = await listSavedPostIds(supabase, userId);
  const items = await Promise.all(
    savedRecords.map(async (record) => {
      const post = await getFullPostById(record.post_id);

      if (!post) {
        return null;
      }

      return {
        ...toPublicPost(post),
        saved_at: record.created_at,
      };
    }),
  );

  return items.filter((item): item is SavedPostItem => Boolean(item));
}
