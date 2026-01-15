/**
 * Tokenization Logic
 *
 * Converts raw text into an array of tokens for RSVP display.
 * - Splits on whitespace
 * - Removes empty tokens
 * - Preserves punctuation attached to words
 */

/**
 * Tokenize text into an array of words/tokens.
 *
 * @param text - Raw text to tokenize
 * @returns Array of non-empty tokens
 */
export function tokenize(text: string): string[] {
  // Split on any whitespace (spaces, tabs, newlines)
  // Filter out empty strings that result from multiple consecutive whitespace
  return text.split(/\s+/).filter((token) => token.length > 0);
}
