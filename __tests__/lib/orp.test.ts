import { orpIndex, splitAtOrp } from "@/lib/reader/orp";

describe("ORP (Optimal Recognition Point) Utilities", () => {
  describe("orpIndex", () => {
    it("should return index 0 for 1-2 character tokens", () => {
      expect(orpIndex("a")).toBe(0);
      expect(orpIndex("it")).toBe(0);
    });

    it("should return index 1 for 3-5 character tokens", () => {
      expect(orpIndex("the")).toBe(1);
      expect(orpIndex("word")).toBe(1);
      expect(orpIndex("hello")).toBe(1);
    });

    it("should return index 2 for 6-9 character tokens", () => {
      expect(orpIndex("yellow")).toBe(2);
      expect(orpIndex("reading")).toBe(2);
      expect(orpIndex("beautiful")).toBe(2);
    });

    it("should return index 3 for 10-13 character tokens", () => {
      expect(orpIndex("understand")).toBe(3);
      expect(orpIndex("programming")).toBe(3);
      expect(orpIndex("international")).toBe(3);
    });

    it("should return index 4 for 14+ character tokens", () => {
      expect(orpIndex("extraordinarily")).toBe(4);
      expect(orpIndex("internationalization")).toBe(4);
    });
  });

  describe("splitAtOrp", () => {
    it("should handle empty string", () => {
      expect(splitAtOrp("")).toEqual({ left: "", orp: "", right: "" });
    });

    it("should split single character correctly", () => {
      expect(splitAtOrp("a")).toEqual({ left: "", orp: "a", right: "" });
    });

    it("should split short words correctly", () => {
      // "the" - ORP at index 1
      expect(splitAtOrp("the")).toEqual({ left: "t", orp: "h", right: "e" });
    });

    it("should split medium words correctly", () => {
      // "hello" - ORP at index 1
      expect(splitAtOrp("hello")).toEqual({ left: "h", orp: "e", right: "llo" });
    });

    it("should split longer words correctly", () => {
      // "reading" - ORP at index 2
      expect(splitAtOrp("reading")).toEqual({ left: "re", orp: "a", right: "ding" });
    });

    it("should split very long words correctly", () => {
      // "extraordinary" - ORP at index 3 (13 chars)
      expect(splitAtOrp("extraordinary")).toEqual({
        left: "ext",
        orp: "r",
        right: "aordinary",
      });
    });

    it("should handle words with punctuation", () => {
      // "hello!" - 6 chars, ORP at index 2
      expect(splitAtOrp("hello!")).toEqual({ left: "he", orp: "l", right: "lo!" });
    });

    it("should preserve all characters in output", () => {
      const testCases = ["a", "it", "the", "word", "hello", "reading", "extraordinary"];

      testCases.forEach((word) => {
        const { left, orp, right } = splitAtOrp(word);
        expect(left + orp + right).toBe(word);
      });
    });
  });
});
