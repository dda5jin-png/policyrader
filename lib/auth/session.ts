import { redirect } from "next/navigation";

import { getProfileByUserId, syncProfileFromUser } from "@/lib/auth/profile";
import type { AuthState, Profile } from "@/lib/auth/types";
import { hasSupabaseEnv } from "@/lib/supabase/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function getAuthState(): Promise<AuthState> {
  if (!hasSupabaseEnv()) {
    return { user: null, profile: null };
  }

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { user: null, profile: null };
  }

  const existingProfile = await getProfileByUserId(supabase, user.id);
  const profile = existingProfile ?? (await syncProfileFromUser(supabase, user));

  return { user, profile };
}

export async function requireAuthenticatedProfile(nextPath = "/library"): Promise<{
  user: NonNullable<AuthState["user"]>;
  profile: Profile | null;
}> {
  if (!hasSupabaseEnv()) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  const authState = await getAuthState();

  if (!authState.user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  if (authState.profile && !authState.profile.is_active) {
    redirect("/login?inactive=1");
  }

  return {
    user: authState.user,
    profile: authState.profile,
  };
}
