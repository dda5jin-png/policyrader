import type { SupabaseClient, User } from "@supabase/supabase-js";

import type { Profile } from "@/lib/auth/types";

type ProfileInsert = Omit<Profile, "created_at" | "updated_at">;

function buildProfilePayload(user: User): ProfileInsert {
  const metadataName =
    typeof user.user_metadata?.name === "string"
      ? user.user_metadata.name
      : typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : typeof user.user_metadata?.user_name === "string"
          ? user.user_metadata.user_name
          : null;

  return {
    id: user.id,
    email: user.email ?? "",
    name: metadataName,
    role: "user",
    is_free_whitelist: false,
    free_daily_limit: 3,
    paid_plan: null,
    credits: 0,
    is_active: true,
  };
}

export async function syncProfileFromUser(
  supabase: SupabaseClient,
  user: User,
): Promise<Profile | null> {
  const payload = buildProfilePayload(user);
  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "id" })
    .select("*")
    .single();

  if (error) {
    console.warn("Failed to sync profile", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
    });
    return null;
  }

  return data as Profile;
}

export async function getProfileByUserId(
  supabase: SupabaseClient,
  userId: string,
): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    return null;
  }

  return data as Profile;
}
