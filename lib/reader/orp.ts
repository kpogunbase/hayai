/**
 * ORP (Optimal Recognition Point) Logic
 *
 * The ORP is the character position where the eye naturally focuses
 * when reading a word. Highlighting this point helps readers process
 * words faster during RSVP reading.
 */

/**
 * Calculate the ORP index for a token based on its length.
 *
 * Heuristic:
 * - 1-2 chars  → index 0
 * - 3-5 chars  → index 1
 * - 6-9 chars  → index 2
 * - 10-13 chars → index 3
 * - 14+ chars  → index 4
 *
 * @param token - The token to calculate ORP for
 * @returns The index of the ORP character (0-based)
 */
export function orpIndex(token: string): number {
  const len = token.length;

  if (len <= 2) return 0;
  if (len <= 5) return 1;
  if (len <= 9) return 2;
  if (len <= 13) return 3;
  return 4;
}

/**
 * Split a token into three parts: left of ORP, ORP character, right of ORP.
 *
 * @param token - The token to split
 * @returns Object with left, orp, and right strings
 */
export function splitAtOrp(token: string): {
  left: string;
  orp: string;
  right: string;
} {
  const idx = orpIndex(token);

  // Handle edge case of empty token
  if (token.length === 0) {
    return { left: "", orp: "", right: "" };
  }

  // Ensure index is within bounds
  const safeIdx = Math.min(idx, token.length - 1);

  return {
    left: token.slice(0, safeIdx),
    orp: token[safeIdx],
    right: token.slice(safeIdx + 1),
  };
}
