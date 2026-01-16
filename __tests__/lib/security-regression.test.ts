/**
 * Security Regression Tests
 *
 * These tests ensure security measures remain in place and are not accidentally removed.
 * They test for common vulnerabilities and ensure defensive code exists.
 */

import fs from "fs";
import path from "path";

describe("Security Regression Tests", () => {
  describe("Environment Variables", () => {
    it("should have .env files in .gitignore", () => {
      const gitignorePath = path.join(process.cwd(), ".gitignore");
      const gitignore = fs.readFileSync(gitignorePath, "utf-8");

      // .env*.local pattern covers .env.local
      expect(gitignore).toMatch(/\.env\*?\.?local/);
      expect(gitignore).toContain(".env");
    });

    it("should not have actual secrets in tracked example file", () => {
      const examplePath = path.join(process.cwd(), ".env.local.example");
      if (fs.existsSync(examplePath)) {
        const content = fs.readFileSync(examplePath, "utf-8");

        // Should not contain actual API keys
        expect(content).not.toMatch(/sk_live_[a-zA-Z0-9]+/);
        expect(content).not.toMatch(/whsec_[a-zA-Z0-9]{20,}/);
        expect(content).not.toMatch(/eyJ[a-zA-Z0-9._-]{50,}/); // JWT tokens
      }
    });
  });

  describe("Security Headers", () => {
    it("should have security headers configured in next.config.js", () => {
      const configPath = path.join(process.cwd(), "next.config.js");
      const config = fs.readFileSync(configPath, "utf-8");

      expect(config).toContain("Strict-Transport-Security");
      expect(config).toContain("X-Frame-Options");
      expect(config).toContain("X-Content-Type-Options");
      expect(config).toContain("Referrer-Policy");
    });
  });

  describe("API Route Security", () => {
    it("should verify Stripe webhook signature", () => {
      const webhookPath = path.join(
        process.cwd(),
        "app/api/stripe/webhook/route.ts"
      );
      const webhook = fs.readFileSync(webhookPath, "utf-8");

      expect(webhook).toContain("stripe-signature");
      expect(webhook).toContain("constructEvent");
      expect(webhook).toContain("STRIPE_WEBHOOK_SECRET");
    });

    it("should check authentication in checkout route", () => {
      const checkoutPath = path.join(
        process.cwd(),
        "app/api/stripe/checkout/route.ts"
      );
      const checkout = fs.readFileSync(checkoutPath, "utf-8");

      expect(checkout).toContain("auth.getUser");
      expect(checkout).toMatch(/if\s*\(\s*!user\s*\)/);
    });

    it("should check authentication in portal route", () => {
      const portalPath = path.join(
        process.cwd(),
        "app/api/stripe/portal/route.ts"
      );
      const portal = fs.readFileSync(portalPath, "utf-8");

      expect(portal).toContain("auth.getUser");
      expect(portal).toMatch(/if\s*\(\s*!user\s*\)/);
    });
  });

  describe("Input Validation", () => {
    it("should validate plan parameter in checkout", () => {
      const checkoutPath = path.join(
        process.cwd(),
        "app/api/stripe/checkout/route.ts"
      );
      const checkout = fs.readFileSync(checkoutPath, "utf-8");

      // Should validate plan is one of allowed values
      expect(checkout).toMatch(/plan\s*!==\s*["']monthly["']/);
      expect(checkout).toMatch(/plan\s*!==\s*["']yearly["']/);
    });

    it("should validate username format in profile lib", () => {
      const profilePath = path.join(process.cwd(), "lib/profile.ts");
      const profile = fs.readFileSync(profilePath, "utf-8");

      // Should have username regex validation
      expect(profile).toContain("usernameRegex");
      expect(profile).toMatch(/\[a-zA-Z0-9_\]/);
    });
  });

  describe("URL Validation", () => {
    it("should have isValidRedirectUrl in security lib", () => {
      const securityPath = path.join(process.cwd(), "lib/security.ts");
      const security = fs.readFileSync(securityPath, "utf-8");

      expect(security).toContain("isValidRedirectUrl");
      expect(security).toContain("ALLOWED_REDIRECT_DOMAINS");
      expect(security).toContain("checkout.stripe.com");
      expect(security).toContain("billing.stripe.com");
    });

    it("should use URL validation in PricingCards", () => {
      const pricingPath = path.join(
        process.cwd(),
        "components/PricingCards.tsx"
      );
      const pricing = fs.readFileSync(pricingPath, "utf-8");

      expect(pricing).toContain("isValidRedirectUrl");
    });

    it("should use URL validation in UserMenu", () => {
      const userMenuPath = path.join(process.cwd(), "components/UserMenu.tsx");
      const userMenu = fs.readFileSync(userMenuPath, "utf-8");

      expect(userMenu).toContain("isValidRedirectUrl");
    });
  });

  describe("Database Security", () => {
    it("should have RLS enabled in migrations", () => {
      const migrationPath = path.join(
        process.cwd(),
        "supabase/migrations/001_subscriptions_and_usage.sql"
      );
      const migration = fs.readFileSync(migrationPath, "utf-8");

      expect(migration).toContain("ROW LEVEL SECURITY");
      expect(migration).toContain("auth.uid()");
    });

    it("should restrict users to their own data", () => {
      const migrationPath = path.join(
        process.cwd(),
        "supabase/migrations/001_subscriptions_and_usage.sql"
      );
      const migration = fs.readFileSync(migrationPath, "utf-8");

      // Should have policies that check auth.uid() = user_id
      expect(migration).toContain("auth.uid() = user_id");
    });
  });

  describe("XSS Prevention", () => {
    it("should not use dangerouslySetInnerHTML", () => {
      const componentsDir = path.join(process.cwd(), "components");
      const checkDir = (dir: string) => {
        const files = fs.readdirSync(dir);
        files.forEach((file) => {
          const filePath = path.join(dir, file);
          const stat = fs.statSync(filePath);
          if (stat.isDirectory()) {
            checkDir(filePath);
          } else if (file.endsWith(".tsx") || file.endsWith(".ts")) {
            const content = fs.readFileSync(filePath, "utf-8");
            expect(content).not.toContain("dangerouslySetInnerHTML");
          }
        });
      };
      checkDir(componentsDir);
    });
  });
});
