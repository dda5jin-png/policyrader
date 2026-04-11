import type { Profile, AccessLevel } from "@/lib/auth/types";

export function isAdmin(profile: Profile | null | undefined): boolean {
  return profile?.role === "admin";
}

export function isWhitelisted(profile: Profile | null | undefined): boolean {
  return Boolean(profile?.is_free_whitelist);
}

export function canViewPremiumInsight(profile: Profile | null | undefined): boolean {
  if (!profile || !profile.is_active) {
    return false;
  }

  return isAdmin(profile) || profile.role === "user";
}

export function canViewIndicators(profile: Profile | null | undefined): boolean {
  if (!profile || !profile.is_active) {
    return false;
  }

  return isAdmin(profile) || isWhitelisted(profile) || Boolean(profile.paid_plan) || profile.role === "user";
}

export function canDownloadPdf(profile: Profile | null | undefined): boolean {
  if (!profile || !profile.is_active) {
    return false;
  }

  return isAdmin(profile) || isWhitelisted(profile) || Boolean(profile.paid_plan);
}

export function canUseCredits(profile: Profile | null | undefined): boolean {
  if (!profile || !profile.is_active) {
    return false;
  }

  return isAdmin(profile) || isWhitelisted(profile) || Boolean(profile.paid_plan) || profile.credits > 0;
}

export function getEffectiveAccessLevel(profile: Profile | null | undefined): AccessLevel {
  if (!profile || !profile.is_active) {
    return "public";
  }

  if (isAdmin(profile)) {
    return "admin";
  }

  if (isWhitelisted(profile) || Boolean(profile.paid_plan) || profile.credits > 0) {
    return "premium";
  }

  return "authenticated";
}
