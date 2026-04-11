'use client';

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import type { User } from "@supabase/supabase-js";

import type { Profile } from "@/lib/auth/types";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";
import { hasSupabaseEnv } from "@/lib/supabase/config";

interface AuthContextValue {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  refreshAuth: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

interface AuthProviderProps extends PropsWithChildren {
  initialUser: User | null;
  initialProfile: Profile | null;
}

export function AuthProvider({
  children,
  initialUser,
  initialProfile,
}: AuthProviderProps) {
  const clientRef = useRef<ReturnType<typeof createBrowserSupabaseClient> | null>(null);
  const [user, setUser] = useState<User | null>(initialUser);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [loading, setLoading] = useState(false);

  if (typeof window !== "undefined" && hasSupabaseEnv() && !clientRef.current) {
    clientRef.current = createBrowserSupabaseClient();
  }

  const refreshAuth = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/session", {
        credentials: "include",
      });

      if (!response.ok) {
        setUser(null);
        setProfile(null);
        return;
      }

      const payload = (await response.json()) as {
        user: User | null;
        profile: Profile | null;
      };

      setUser(payload.user);
      setProfile(payload.profile);
    } catch (error) {
      console.error("Failed to refresh auth state", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!clientRef.current) {
      return;
    }

    void refreshAuth();

    const {
      data: { subscription },
    } = clientRef.current.auth.onAuthStateChange(() => {
      void refreshAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    setLoading(true);

    try {
      if (clientRef.current) {
        await clientRef.current.auth.signOut();
      }
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
      window.location.assign("/");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        refreshAuth,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
