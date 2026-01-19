/**
 * Security Regression Tests
 *
 * These tests ensure security measures remain in place and are not accidentally removed.
 * They test for common vulnerabilities and ensure defensive code exists.
 *
 * IMPORTANT: These tests are critical for maintaining security posture.
 * Do not disable or remove these tests without security review.
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

  describe("CSP Security", () => {
    it("should not have unsafe-eval in production CSP", () => {
      const configPath = path.join(process.cwd(), "next.config.js");
      const config = fs.readFileSync(configPath, "utf-8");

      // Should have conditional unsafe-eval only for development
      expect(config).toContain("isDev");
      expect(config).toMatch(/isDev\s*\?\s*\[\s*["']'unsafe-eval'["']\s*\]/);

      // Should NOT have unconditional unsafe-eval
      expect(config).not.toMatch(/["']'unsafe-eval'["'],?\s*\/\/.*production/i);
    });
  });

  describe("Redirect Domain Allowlist", () => {
    it("should include all production domains", () => {
      const securityPath = path.join(process.cwd(), "lib/security.ts");
      const security = fs.readFileSync(securityPath, "utf-8");

      // Must include all production domains
      expect(security).toContain("readhayai.com");
      expect(security).toContain("hayai.vercel.app");
      expect(security).toContain("makeamericareadagain.ai");

      // Must include Stripe domains
      expect(security).toContain("checkout.stripe.com");
      expect(security).toContain("billing.stripe.com");
    });

    it("should not allow arbitrary domains", () => {
      const securityPath = path.join(process.cwd(), "lib/security.ts");
      const security = fs.readFileSync(securityPath, "utf-8");

      // Should not have wildcard or overly permissive patterns
      expect(security).not.toMatch(/["']\*["']/);
      expect(security).not.toContain("*.");
    });
  });

  describe("Feedback API Security", () => {
    it("should have rate-limited feedback API route", () => {
      const feedbackRoutePath = path.join(
        process.cwd(),
        "app/api/feedback/route.ts"
      );
      expect(fs.existsSync(feedbackRoutePath)).toBe(true);

      const feedbackRoute = fs.readFileSync(feedbackRoutePath, "utf-8");

      // Must have rate limiting
      expect(feedbackRoute).toContain("checkRateLimit");
      expect(feedbackRoute).toContain("getClientIp");

      // Must validate input
      expect(feedbackRoute).toContain("MAX_CONTENT_LENGTH");
      expect(feedbackRoute).toContain("VALID_PAGES");

      // Must use server-side user validation
      expect(feedbackRoute).toContain("auth.getUser");
      expect(feedbackRoute).toMatch(/user_id:\s*user\?\.(id|user_id)\s*\?\?\s*null/);
    });

    it("should not accept user_id from client in feedback submission", () => {
      const feedbackModalPath = path.join(
        process.cwd(),
        "components/FeedbackModal.tsx"
      );
      const feedbackModal = fs.readFileSync(feedbackModalPath, "utf-8");

      // Should NOT send user_id from client
      expect(feedbackModal).not.toMatch(/user_id:\s*session/);
      expect(feedbackModal).not.toMatch(/user_id:\s*user/);

      // Should use API route
      expect(feedbackModal).toContain("/api/feedback");
      expect(feedbackModal).toContain("fetch");
    });
  });

  describe("Database RLS Policies", () => {
    it("should have secure feedback RLS policy in migration", () => {
      const migrationPath = path.join(
        process.cwd(),
        "supabase/migrations/004_security_hardening.sql"
      );
      expect(fs.existsSync(migrationPath)).toBe(true);

      const migration = fs.readFileSync(migrationPath, "utf-8");

      // Must drop the insecure policy
      expect(migration).toContain('DROP POLICY IF EXISTS "Anyone can insert feedback"');

      // Must have secure policy with auth.uid() validation
      expect(migration).toContain("auth.uid()");
      expect(migration).toContain("user_id = auth.uid()");
    });

    it("should restrict profile visibility to authenticated users", () => {
      const migrationPath = path.join(
        process.cwd(),
        "supabase/migrations/004_security_hardening.sql"
      );
      const migration = fs.readFileSync(migrationPath, "utf-8");

      // Must drop the overly permissive policy
      expect(migration).toContain('DROP POLICY IF EXISTS "Profiles are publicly readable"');

      // Must require authentication
      expect(migration).toContain("auth.uid() IS NOT NULL");
    });

    it("should have storage policies for avatars bucket", () => {
      const migrationPath = path.join(
        process.cwd(),
        "supabase/migrations/004_security_hardening.sql"
      );
      const migration = fs.readFileSync(migrationPath, "utf-8");

      // Must have storage policies
      expect(migration).toContain("storage.objects");
      expect(migration).toContain("bucket_id = 'avatars'");

      // Must validate ownership for write operations
      expect(migration).toContain("storage.foldername(name)");
      expect(migration).toContain("auth.uid()::text");
    });
  });

  describe("Content Length Limits", () => {
    it("should have content length constraint on feedback table", () => {
      const migrationPath = path.join(
        process.cwd(),
        "supabase/migrations/004_security_hardening.sql"
      );
      const migration = fs.readFileSync(migrationPath, "utf-8");

      expect(migration).toContain("feedback_content_length");
      expect(migration).toContain("char_length(content)");
      expect(migration).toContain("10000");
    });

    it("should validate content length in feedback API", () => {
      const feedbackRoutePath = path.join(
        process.cwd(),
        "app/api/feedback/route.ts"
      );
      const feedbackRoute = fs.readFileSync(feedbackRoutePath, "utf-8");

      expect(feedbackRoute).toContain("MAX_CONTENT_LENGTH");
      expect(feedbackRoute).toMatch(/trimmedContent\.length\s*>\s*MAX_CONTENT_LENGTH/);
    });
  });
});
