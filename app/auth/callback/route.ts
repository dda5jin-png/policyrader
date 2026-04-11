import { type EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

import { syncProfileFromUser } from "@/lib/auth/profile";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const otpType = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const nextPath = requestUrl.searchParams.get("next") || "/";
  const supabase = await createServerSupabaseClient();

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  } else if (tokenHash && otpType) {
    await supabase.auth.verifyOtp({
      type: otpType,
      token_hash: tokenHash,
    });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    await syncProfileFromUser(supabase, user);
  }

  return NextResponse.redirect(new URL(nextPath, requestUrl.origin));
}
