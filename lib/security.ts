/**
 * Security utilities for Hayai
 */

// Allowed redirect domains
// SECURITY: Only allow redirects to trusted domains
const ALLOWED_REDIRECT_DOMAINS = [
  // Stripe payment domains
  "checkout.stripe.com",
  "billing.stripe.com",
  // Production domains
  "readhayai.com",
  "www.readhayai.com",
  "hayai.vercel.app",
  "makeamericareadagain.ai",
  "www.makeamericareadagain.ai",
  // Development
  "localhost",
];

/**
 * Validates that a URL is safe to redirect to
 * Only allows Stripe checkout/billing URLs and our own domain
 */
export function isValidRedirectUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // Check if the hostname matches any allowed domain
    return ALLOWED_REDIRECT_DOMAINS.some(domain =>
      parsed.hostname === domain || parsed.hostname.endsWith(`.${domain}`)
    );
  } catch {
    // Invalid URL
    return false;
  }
}

/**
 * Sanitizes user input for display (prevents XSS in edge cases)
 */
export function sanitizeForDisplay(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/**
 * Validates username format (alphanumeric + underscore, 3-20 chars)
 */
export function isValidUsername(username: string): boolean {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username);
}

/**
 * Validates email format
 */
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Rate limiting helper - checks if action should be allowed
 * Uses localStorage for client-side rate limiting
 */
export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number
): { allowed: boolean; remainingAttempts: number; resetIn: number } {
  if (typeof window === "undefined") {
    return { allowed: true, remainingAttempts: maxAttempts, resetIn: 0 };
  }

  const storageKey = `rate_limit_${key}`;
  const now = Date.now();

  const stored = localStorage.getItem(storageKey);
  let data = stored ? JSON.parse(stored) : { attempts: 0, windowStart: now };

  // Reset if window has passed
  if (now - data.windowStart > windowMs) {
    data = { attempts: 0, windowStart: now };
  }

  const allowed = data.attempts < maxAttempts;
  const remainingAttempts = Math.max(0, maxAttempts - data.attempts);
  const resetIn = Math.max(0, windowMs - (now - data.windowStart));

  if (allowed) {
    data.attempts++;
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  return { allowed, remainingAttempts, resetIn };
}
