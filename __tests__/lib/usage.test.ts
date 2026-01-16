import { LIMITS, getUploadLimit, needsPeriodReset } from "@/lib/usage";

describe("Usage Utilities", () => {
  describe("LIMITS", () => {
    it("should have correct anonymous limit", () => {
      expect(LIMITS.anonymous).toBe(3);
    });

    it("should have correct free limit", () => {
      expect(LIMITS.free).toBe(10);
    });

    it("should have correct monthly limit", () => {
      expect(LIMITS.monthly).toBe(50);
    });

    it("should have unlimited yearly", () => {
      expect(LIMITS.yearly).toBe(Infinity);
    });
  });

  describe("getUploadLimit", () => {
    it("should return correct limit for yearly plan", () => {
      expect(getUploadLimit("yearly")).toBe(Infinity);
    });

    it("should return correct limit for monthly plan", () => {
      expect(getUploadLimit("monthly")).toBe(50);
    });

    it("should return free limit for null plan", () => {
      expect(getUploadLimit(null)).toBe(10);
    });
  });

  describe("needsPeriodReset", () => {
    it("should return false when periodStart is null", () => {
      expect(needsPeriodReset(null, "2025-02-01T00:00:00Z")).toBe(false);
    });

    it("should return false when currentPeriodEnd is null", () => {
      expect(needsPeriodReset("2025-01-01T00:00:00Z", null)).toBe(false);
    });

    it("should return false when both are null", () => {
      expect(needsPeriodReset(null, null)).toBe(false);
    });

    it("should return true when period has ended", () => {
      const periodStart = "2025-01-01T00:00:00Z";
      const currentPeriodEnd = "2025-01-10T00:00:00Z"; // In the past

      // Mock Date.now to be after the period end
      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-01-15T00:00:00Z"));

      expect(needsPeriodReset(periodStart, currentPeriodEnd)).toBe(true);

      jest.useRealTimers();
    });

    it("should return false when period has not ended", () => {
      const periodStart = "2025-01-01T00:00:00Z";
      const currentPeriodEnd = "2025-02-01T00:00:00Z"; // In the future

      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-01-15T00:00:00Z"));

      expect(needsPeriodReset(periodStart, currentPeriodEnd)).toBe(false);

      jest.useRealTimers();
    });

    it("should return false when period end is before period start", () => {
      const periodStart = "2025-01-15T00:00:00Z";
      const currentPeriodEnd = "2025-01-10T00:00:00Z"; // Before start

      jest.useFakeTimers();
      jest.setSystemTime(new Date("2025-01-20T00:00:00Z"));

      expect(needsPeriodReset(periodStart, currentPeriodEnd)).toBe(false);

      jest.useRealTimers();
    });
  });
});
