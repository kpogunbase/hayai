import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  // Check if we have the required env vars
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Return a mock client for build time / when env vars are missing
    // This prevents crashes during static generation
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOAuth: async () => ({ data: {}, error: null }),
        signOut: async () => ({ error: null }),
      },
      from: () => ({
        select: () => ({
          eq: () => ({
            eq: () => ({
              single: async () => ({ data: null, error: null }),
            }),
            single: async () => ({ data: null, error: null }),
          }),
        }),
        upsert: async () => ({ data: null, error: null }),
        update: () => ({
          eq: async () => ({ data: null, error: null }),
        }),
      }),
    } as unknown as SupabaseClient;
  }

  if (!supabaseClient) {
    supabaseClient = createBrowserClient(url, anonKey);
  }
  return supabaseClient;
}
