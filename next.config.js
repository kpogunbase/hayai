const { withSentryConfig } = require("@sentry/nextjs");

// Build Content Security Policy
const isDev = process.env.NODE_ENV === "development";

const cspDirectives = {
  "default-src": ["'self'"],
  "script-src": [
    "'self'",
    "'unsafe-inline'", // Required for Next.js
    // 'unsafe-eval' only in development - NEVER in production (security risk)
    ...(isDev ? ["'unsafe-eval'"] : []),
    "https://*.supabase.co",
    "https://accounts.google.com",
    "https://*.sentry.io",
  ],
  "style-src": ["'self'", "'unsafe-inline'"], // Required for styled-jsx and inline styles
  "img-src": ["'self'", "data:", "blob:", "https://*.googleusercontent.com", "https://*.supabase.co"],
  "font-src": ["'self'"],
  "connect-src": [
    "'self'",
    "https://*.supabase.co",
    "wss://*.supabase.co",
    "https://accounts.google.com",
    "https://oauth2.googleapis.com",
    "https://*.sentry.io",
    "https://*.ingest.sentry.io",
  ],
  "frame-src": ["'self'", "https://accounts.google.com", "https://*.supabase.co"],
  "frame-ancestors": ["'self'"],
  "form-action": ["'self'", "https://accounts.google.com", "https://*.supabase.co"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
  "upgrade-insecure-requests": [],
};

const cspString = Object.entries(cspDirectives)
  .map(([key, values]) => {
    if (values.length === 0) return key;
    return `${key} ${values.join(" ")}`;
  })
  .join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          {
            key: "Content-Security-Policy",
            value: cspString,
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
        ],
      },
    ];
  },
};

module.exports = withSentryConfig(nextConfig, {
  // Sentry webpack plugin options
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,

  // Suppress source map upload logs
  silent: true,

  // Upload source maps for better stack traces
  widenClientFileUpload: true,

  // Transpile Sentry SDK for better compatibility
  transpileClientSDK: true,

  // Hide source maps from end users
  hideSourceMaps: true,

  // Disable logger to reduce bundle size
  disableLogger: true,

  // Automatically tree-shake Sentry SDK
  automaticVercelMonitors: true,
});
