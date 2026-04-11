export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function hasSupabaseEnv(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

export function assertSupabaseEnv(): void {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase environment variables are not configured.");
  }
}
