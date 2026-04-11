import type { User } from "@supabase/supabase-js";

export type AppRole = "user" | "admin";

export type AccessLevel = "public" | "authenticated" | "premium" | "admin";

export interface Profile {
  id: string;
  email: string;
  name: string | null;
  role: AppRole;
  is_free_whitelist: boolean;
  free_daily_limit: number;
  paid_plan: string | null;
  credits: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  profile: Profile | null;
}
