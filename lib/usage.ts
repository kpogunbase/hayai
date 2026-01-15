import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "hayai_usage_count";
const FREE_LIMIT = 3;

/**
 * Get usage count from localStorage (for anonymous users)
 */
export function getLocalUsage(): number {
  if (typeof window === "undefined") return 0;
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? parseInt(stored, 10) : 0;
}

/**
 * Increment usage count in localStorage
 */
export function incrementLocalUsage(): number {
  const current = getLocalUsage();
  const newCount = current + 1;
  localStorage.setItem(STORAGE_KEY, String(newCount));
  return newCount;
}

/**
 * Check if anonymous user has exceeded free limit
 */
export function hasExceededLocalLimit(): boolean {
  return getLocalUsage() >= FREE_LIMIT;
}

/**
 * Get usage count from database (for authenticated users)
 */
export async function getDbUsage(userId: string): Promise<number> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("usage")
    .select("upload_count")
    .eq("user_id", userId)
    .single();

  if (error || !data) return 0;
  return data.upload_count;
}

/**
 * Increment usage count in database
 */
export async function incrementDbUsage(userId: string): Promise<number> {
  const supabase = createClient();

  // Try to update existing record
  const { data: existing } = await supabase
    .from("usage")
    .select("upload_count")
    .eq("user_id", userId)
    .single();

  if (existing) {
    const newCount = existing.upload_count + 1;
    await supabase
      .from("usage")
      .update({ upload_count: newCount, updated_at: new Date().toISOString() })
      .eq("user_id", userId);
    return newCount;
  }

  // Create new record
  await supabase.from("usage").insert({
    user_id: userId,
    upload_count: 1,
  });
  return 1;
}

/**
 * Check if authenticated user has exceeded free limit
 */
export async function hasExceededDbLimit(userId: string): Promise<boolean> {
  const usage = await getDbUsage(userId);
  return usage >= FREE_LIMIT;
}

export const FREE_UPLOAD_LIMIT = FREE_LIMIT;
