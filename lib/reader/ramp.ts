/**
 * Challenge Mode Ramp Functions
 *
 * Implements smooth WPM ramping from start to end speed
 * over a configurable duration.
 */

export interface ChallengeConfig {
  startWpm: number;
  endWpm: number;
  durationMs: number;
}

// Preset durations
export const CHALLENGE_DURATIONS = {
  "2min": 2 * 60 * 1000,
  "3min": 3 * 60 * 1000,
  "5min": 5 * 60 * 1000,
} as const;

export type ChallengeDuration = keyof typeof CHALLENGE_DURATIONS;

// Default challenge config
export const DEFAULT_CHALLENGE_CONFIG: ChallengeConfig = {
  startWpm: 300,
  endWpm: 900,
  durationMs: CHALLENGE_DURATIONS["3min"],
};

/**
 * Ease-in-out function using cosine interpolation.
 * Returns 0 at x=0, 1 at x=1, with smooth acceleration/deceleration.
 */
function easeInOut(x: number): number {
  // Clamp x between 0 and 1
  const clamped = Math.max(0, Math.min(1, x));
  // Cosine interpolation: 0.5 * (1 - cos(PI * x))
  return 0.5 * (1 - Math.cos(Math.PI * clamped));
}

/**
 * Calculate the current WPM for Challenge Mode based on elapsed time.
 *
 * Uses smooth ease-in-out interpolation from startWpm to endWpm
 * over the configured duration.
 *
 * @param elapsedMs - Milliseconds since challenge started
 * @param config - Challenge configuration
 * @returns Current WPM (clamped to start/end range)
 */
export function getChallengeWpm(
  elapsedMs: number,
  config: ChallengeConfig = DEFAULT_CHALLENGE_CONFIG
): number {
  const { startWpm, endWpm, durationMs } = config;

  // Calculate progress (0 to 1)
  const progress = elapsedMs / durationMs;

  // Apply ease-in-out curve
  const eased = easeInOut(progress);

  // Interpolate between start and end WPM
  const wpm = startWpm + (endWpm - startWpm) * eased;

  // Round to nearest integer for display
  return Math.round(wpm);
}

/**
 * Check if the challenge ramp is complete.
 */
export function isChallengeComplete(
  elapsedMs: number,
  config: ChallengeConfig = DEFAULT_CHALLENGE_CONFIG
): boolean {
  return elapsedMs >= config.durationMs;
}
