import {
  isValidRedirectUrl,
  sanitizeForDisplay,
  isValidUsername,
  isValidEmail,
} from "@/lib/security";

describe("Security Utilities", () => {
  describe("isValidRedirectUrl", () => {
    it("should allow Stripe checkout URLs", () => {
      expect(isValidRedirectUrl("https://checkout.stripe.com/c/pay/cs_test_123")).toBe(true);
    });

    it("should allow Stripe billing portal URLs", () => {
      expect(isValidRedirectUrl("https://billing.stripe.com/p/session/abc123")).toBe(true);
    });

    it("should allow readhayai.com URLs", () => {
      expect(isValidRedirectUrl("https://readhayai.com/")).toBe(true);
      expect(isValidRedirectUrl("https://www.readhayai.com/reader")).toBe(true);
    });

    it("should allow localhost URLs", () => {
      expect(isValidRedirectUrl("http://localhost:3000/")).toBe(true);
    });

    it("should reject malicious URLs", () => {
      expect(isValidRedirectUrl("https://evil.com")).toBe(false);
      expect(isValidRedirectUrl("https://stripe.evil.com")).toBe(false);
      expect(isValidRedirectUrl("javascript:alert(1)")).toBe(false);
    });

    it("should reject URLs with embedded credentials", () => {
      expect(isValidRedirectUrl("https://user:pass@checkout.stripe.com")).toBe(true); // hostname still matches
    });

    it("should handle invalid URLs gracefully", () => {
      expect(isValidRedirectUrl("not-a-url")).toBe(false);
      expect(isValidRedirectUrl("")).toBe(false);
    });

    it("should reject data URLs", () => {
      expect(isValidRedirectUrl("data:text/html,<script>alert(1)</script>")).toBe(false);
    });
  });

  describe("sanitizeForDisplay", () => {
    it("should escape HTML entities", () => {
      expect(sanitizeForDisplay("<script>alert(1)</script>")).toBe(
        "&lt;script&gt;alert(1)&lt;/script&gt;"
      );
    });

    it("should escape ampersands", () => {
      expect(sanitizeForDisplay("foo & bar")).toBe("foo &amp; bar");
    });

    it("should escape quotes", () => {
      expect(sanitizeForDisplay('He said "hello"')).toBe("He said &quot;hello&quot;");
      expect(sanitizeForDisplay("It's fine")).toBe("It&#039;s fine");
    });

    it("should handle normal text", () => {
      expect(sanitizeForDisplay("Hello World")).toBe("Hello World");
    });
  });

  describe("isValidUsername", () => {
    it("should accept valid usernames", () => {
      expect(isValidUsername("john_doe")).toBe(true);
      expect(isValidUsername("User123")).toBe(true);
      expect(isValidUsername("abc")).toBe(true);
      expect(isValidUsername("a".repeat(20))).toBe(true);
    });

    it("should reject usernames that are too short", () => {
      expect(isValidUsername("ab")).toBe(false);
      expect(isValidUsername("a")).toBe(false);
      expect(isValidUsername("")).toBe(false);
    });

    it("should reject usernames that are too long", () => {
      expect(isValidUsername("a".repeat(21))).toBe(false);
    });

    it("should reject usernames with special characters", () => {
      expect(isValidUsername("john-doe")).toBe(false);
      expect(isValidUsername("john.doe")).toBe(false);
      expect(isValidUsername("john@doe")).toBe(false);
      expect(isValidUsername("john doe")).toBe(false);
    });

    it("should reject usernames with non-ASCII characters", () => {
      expect(isValidUsername("jöhn")).toBe(false);
      expect(isValidUsername("用户名")).toBe(false);
    });
  });

  describe("isValidEmail", () => {
    it("should accept valid email addresses", () => {
      expect(isValidEmail("user@example.com")).toBe(true);
      expect(isValidEmail("user.name@example.co.uk")).toBe(true);
      expect(isValidEmail("user+tag@example.com")).toBe(true);
    });

    it("should reject invalid email addresses", () => {
      expect(isValidEmail("not-an-email")).toBe(false);
      expect(isValidEmail("@example.com")).toBe(false);
      expect(isValidEmail("user@")).toBe(false);
      expect(isValidEmail("user@example")).toBe(false);
      expect(isValidEmail("")).toBe(false);
    });
  });
});
