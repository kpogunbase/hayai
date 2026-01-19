import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

let supabaseClient: SupabaseClient | null = null;

// Track if we're using the mock client (for debugging)
let usingMockClient = false;

export function isUsingMockClient(): boolean {
  return usingMockClient;
}

export function createClient(): SupabaseClient {
  // Check if we have the required env vars
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Return a mock client for build time / when env vars are missing
    // This prevents crashes during static generation
    usingMockClient = true;
    console.warn(
      "[Supabase] Missing environment variables. Auth will not work.",
      { hasUrl: !!url, hasAnonKey: !!anonKey }
    );
    return {
      auth: {
        getSession: async () => ({ data: { session: null }, error: null }),
        getUser: async () => ({ data: { user: null }, error: null }),
        onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
        signInWithOAuth: async () => ({
          data: { url: null, provider: null },
          error: { message: "Supabase not configured. Missing environment variables.", name: "ConfigError" }
        }),
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
        insert: async () => ({ data: null, error: { message: "Supabase not configured. Missing environment variables.", code: "CONFIG_ERROR" } }),
        upsert: async () => ({ data: null, error: null }),
        update: () => ({
          eq: async () => ({ data: null, error: null }),
        }),
      }),
    } as unknown as SupabaseClient;
  }

  usingMockClient = false;
  if (!supabaseClient) {
    supabaseClient = createBrowserClient(url, anonKey);
  }
  return supabaseClient;
}
