import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0, // Capture 100% of transactions in development, reduce in production

  // Session Replay (optional - captures user sessions for debugging)
  replaysSessionSampleRate: 0.1, // Sample 10% of sessions
  replaysOnErrorSampleRate: 1.0, // Sample 100% of sessions with errors

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Ignore common non-actionable errors
  ignoreErrors: [
    // Browser extensions
    /chrome-extension/,
    /moz-extension/,
    // Network errors
    "Network request failed",
    "Failed to fetch",
    "Load failed",
    // User aborts
    "AbortError",
    // Third-party scripts
    /gtag/,
    /analytics/,
  ],

  // Don't send PII
  beforeSend(event) {
    // Remove user IP
    if (event.user) {
      delete event.user.ip_address;
    }
    return event;
  },
});
