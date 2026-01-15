/**
 * RSVP Timing Logic
 *
 * This module calculates display intervals for tokens.
 * Uses setTimeout scheduling (never setInterval) to avoid drift.
 */

// Timing multiplier constants (easily adjustable)
const LONG_WORD_LENGTH = 8;
const LONG_WORD_MULTIPLIER = 1.25;
const LIGHT_PUNCT_MULTIPLIER = 1.6; // , ; :
const HEAVY_PUNCT_MULTIPLIER = 2.2; // . ! ?

// Punctuation patterns
const HEAVY_PUNCT_REGEX = /[.!?]$/;
const LIGHT_PUNCT_REGEX = /[,;:]$/;

/**
 * Calculate the base interval in milliseconds for a given WPM.
 * @param wpm - Words per minute (300-900)
 * @returns Interval in milliseconds
 */
export function baseIntervalMs(wpm: number): number {
  return 60000 / wpm;
}

/**
 * Strip non-letter/number characters for length measurement.
 * Keeps apostrophes for contractions (don't, it's).
 */
function stripForLength(token: string): string {
  return token.replace(/[^a-zA-Z0-9']/g, "");
}

/**
 * Calculate the display interval for a specific token.
 * Applies multipliers for:
 * - Long words (8+ characters): 1.25x
 * - Light punctuation (, ; :): 1.6x
 * - Heavy punctuation (. ! ?): 2.2x
 *
 * @param token - The token to display
 * @param wpm - Current words per minute
 * @returns Interval in milliseconds for this token
 */
export function intervalForToken(token: string, wpm: number): number {
  let interval = baseIntervalMs(wpm);

  // Apply long word multiplier
  const stripped = stripForLength(token);
  if (stripped.length >= LONG_WORD_LENGTH) {
    interval *= LONG_WORD_MULTIPLIER;
  }

  // Apply punctuation multiplier (heavy takes precedence)
  if (HEAVY_PUNCT_REGEX.test(token)) {
    interval *= HEAVY_PUNCT_MULTIPLIER;
  } else if (LIGHT_PUNCT_REGEX.test(token)) {
    interval *= LIGHT_PUNCT_MULTIPLIER;
  }

  return interval;
}
