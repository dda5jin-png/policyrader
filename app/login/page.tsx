import { redirect } from "next/navigation";

import AuthForm from "@/components/AuthForm";
import { getAuthState } from "@/lib/auth/session";

interface LoginPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [{ user }, params] = await Promise.all([getAuthState(), searchParams]);

  if (user) {
    redirect(params.next || "/");
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-[900px] items-center justify-center px-5 py-16">
      <AuthForm mode="login" />
    </main>
  );
}
