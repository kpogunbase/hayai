import { createClient } from "@/lib/supabase/client";

const STORAGE_KEY = "hayai_usage_count";

// Usage limits by tier
export const LIMITS = {
  anonymous: 3,        // 3 uploads for visitors (localStorage)
  free: 10,            // 10 uploads for free accounts
  monthly: 50,         // 50 uploads per month for monthly subscribers
  yearly: Infinity,    // Unlimited for annual subscribers
} as const;

export type SubscriptionPlan = "monthly" | "yearly" | null;

interface UsageData {
  upload_count: number;
  period_start: string | null;
  updated_at: string;
}

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
  return getLocalUsage() >= LIMITS.anonymous;
}

/**
 * Get remaining uploads for anonymous user
 */
export function getLocalRemaining(): number {
  return Math.max(0, LIMITS.anonymous - getLocalUsage());
}

/**
 * Get usage data from database (for authenticated users)
 */
export async function getDbUsageData(userId: string): Promise<UsageData | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("usage")
    .select("upload_count, period_start, updated_at")
    .eq("user_id", userId)
    .single();

  if (error || !data) return null;
  return data;
}

/**
 * Get usage count from database
 */
export async function getDbUsage(userId: string): Promise<number> {
  const data = await getDbUsageData(userId);
  return data?.upload_count ?? 0;
}

/**
 * Reset usage count for a new billing period
 */
export async function resetDbUsage(userId: string, periodStart: string): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("usage")
    .upsert({
      user_id: userId,
      upload_count: 0,
      period_start: periodStart,
      updated_at: new Date().toISOString(),
    }, {
      onConflict: "user_id",
    });
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
    period_start: new Date().toISOString(),
  });
  return 1;
}

/**
 * Get the upload limit for a user based on their subscription
 */
export function getUploadLimit(plan: SubscriptionPlan): number {
  if (plan === "yearly") return LIMITS.yearly;
  if (plan === "monthly") return LIMITS.monthly;
  return LIMITS.free;
}

/**
 * Check if user needs a period reset (for monthly subscribers)
 * Returns true if the current period has ended
 */
export function needsPeriodReset(
  periodStart: string | null,
  currentPeriodEnd: string | null
): boolean {
  if (!periodStart || !currentPeriodEnd) return false;

  const now = new Date();
  const periodEndDate = new Date(currentPeriodEnd);
  const usagePeriodStart = new Date(periodStart);

  // If current period end is after the usage period start and we're past the period end,
  // we need to reset
  if (periodEndDate > usagePeriodStart && now > periodEndDate) {
    return true;
  }

  return false;
}

/**
 * Check if authenticated user has exceeded their limit
 * Takes into account subscription status and period resets
 */
export async function hasExceededDbLimit(
  userId: string,
  plan: SubscriptionPlan,
  currentPeriodEnd: string | null
): Promise<boolean> {
  // Annual subscribers have unlimited uploads
  if (plan === "yearly") return false;

  const usageData = await getDbUsageData(userId);
  const usage = usageData?.upload_count ?? 0;
  const limit = getUploadLimit(plan);

  // For monthly subscribers, check if we need to reset the period
  if (plan === "monthly" && usageData?.period_start && currentPeriodEnd) {
    if (needsPeriodReset(usageData.period_start, currentPeriodEnd)) {
      // Reset usage for the new period
      await resetDbUsage(userId, new Date().toISOString());
      return false; // Fresh period, not exceeded
    }
  }

  return usage >= limit;
}

/**
 * Get remaining uploads for authenticated user
 */
export async function getDbRemaining(
  userId: string,
  plan: SubscriptionPlan,
  currentPeriodEnd: string | null
): Promise<number> {
  if (plan === "yearly") return Infinity;

  const usageData = await getDbUsageData(userId);
  let usage = usageData?.upload_count ?? 0;
  const limit = getUploadLimit(plan);

  // Check for period reset
  if (plan === "monthly" && usageData?.period_start && currentPeriodEnd) {
    if (needsPeriodReset(usageData.period_start, currentPeriodEnd)) {
      usage = 0; // Will be reset
    }
  }

  return Math.max(0, limit - usage);
}

// Export for backwards compatibility
export const FREE_UPLOAD_LIMIT = LIMITS.anonymous;
