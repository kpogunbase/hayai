import { baseIntervalMs, intervalForToken } from "@/lib/reader/timing";

describe("Timing Utilities", () => {
  describe("baseIntervalMs", () => {
    it("should calculate correct interval for 300 WPM", () => {
      expect(baseIntervalMs(300)).toBe(200); // 60000 / 300 = 200ms
    });

    it("should calculate correct interval for 600 WPM", () => {
      expect(baseIntervalMs(600)).toBe(100); // 60000 / 600 = 100ms
    });

    it("should calculate correct interval for 900 WPM", () => {
      expect(baseIntervalMs(900)).toBeCloseTo(66.67, 1); // 60000 / 900 ≈ 66.67ms
    });
  });

  describe("intervalForToken", () => {
    const wpm = 300; // 200ms base interval

    it("should return base interval for short words", () => {
      expect(intervalForToken("the", wpm)).toBe(200);
      expect(intervalForToken("cat", wpm)).toBe(200);
    });

    it("should apply long word multiplier for 8+ character words", () => {
      // 8+ chars = 1.25x multiplier
      expect(intervalForToken("beautiful", wpm)).toBe(200 * 1.25);
      expect(intervalForToken("extraordinary", wpm)).toBe(200 * 1.25);
    });

    it("should apply light punctuation multiplier", () => {
      // Light punct (, ; :) = 1.6x multiplier
      expect(intervalForToken("hello,", wpm)).toBe(200 * 1.6);
      expect(intervalForToken("word;", wpm)).toBe(200 * 1.6);
      expect(intervalForToken("item:", wpm)).toBe(200 * 1.6);
    });

    it("should apply heavy punctuation multiplier", () => {
      // Heavy punct (. ! ?) = 2.2x multiplier
      expect(intervalForToken("done.", wpm)).toBe(200 * 2.2);
      expect(intervalForToken("wow!", wpm)).toBe(200 * 2.2);
      expect(intervalForToken("really?", wpm)).toBe(200 * 2.2);
    });

    it("should stack long word and punctuation multipliers", () => {
      // Long word (1.25x) + heavy punct (2.2x)
      const longWordWithPunct = "incredible!";
      expect(intervalForToken(longWordWithPunct, wpm)).toBe(200 * 1.25 * 2.2);
    });

    it("should use heavy punctuation over light when both could apply", () => {
      // Only heavy punct is applied at end of word
      expect(intervalForToken("end.", wpm)).toBe(200 * 2.2);
    });

    it("should handle contractions correctly", () => {
      // "don't" has 5 letters when stripped, so not a long word
      expect(intervalForToken("don't", wpm)).toBe(200);
    });

    it("should handle words with special characters", () => {
      // Special characters are stripped for length calculation
      expect(intervalForToken("hello!", wpm)).toBe(200 * 2.2); // 5 letters, heavy punct
    });
  });
});
