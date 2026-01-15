"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

interface Subscription {
  status: "active" | "canceled" | "past_due" | "trialing" | null;
  plan: "monthly" | "yearly" | null;
  currentPeriodEnd: string | null;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  subscription: Subscription | null;
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshSubscription: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  const fetchSubscription = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("subscriptions")
      .select("status, plan, current_period_end")
      .eq("user_id", userId)
      .eq("status", "active")
      .single();

    if (error || !data) {
      setSubscription({ status: null, plan: null, currentPeriodEnd: null });
      return;
    }

    setSubscription({
      status: data.status,
      plan: data.plan,
      currentPeriodEnd: data.current_period_end,
    });
  }, [supabase]);

  const refreshSubscription = useCallback(async () => {
    if (user) {
      await fetchSubscription(user.id);
    }
  }, [user, fetchSubscription]);

  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      const { data } = await supabase.auth.getSession();
      const currentSession = data?.session ?? null;
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        fetchSubscription(currentSession.user.id);
      }
      setIsLoading(false);
    };
    initSession();

    // Listen for auth changes
    const { data: authData } = supabase.auth.onAuthStateChange(
      async (_event: string, session: Session | null) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          await fetchSubscription(session.user.id);
        } else {
          setSubscription(null);
        }
      }
    );

    return () => {
      authData?.subscription?.unsubscribe();
    };
  }, [supabase, fetchSubscription]);

  const signInWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error("Error signing in:", error.message);
    }
  }, [supabase]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setSubscription(null);
  }, [supabase]);

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        subscription,
        isLoading,
        signInWithGoogle,
        signOut,
        refreshSubscription,
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
