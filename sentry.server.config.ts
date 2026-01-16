import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,

  // Performance Monitoring
  tracesSampleRate: 1.0,

  // Only enable in production
  enabled: process.env.NODE_ENV === "production",

  // Don't send PII
  beforeSend(event) {
    if (event.user) {
      delete event.user.ip_address;
    }
    return event;
  },
});
