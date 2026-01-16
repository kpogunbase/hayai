"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0a0a0a",
          color: "#fff",
          fontFamily: "system-ui, sans-serif",
          padding: "24px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "64px",
            marginBottom: "16px",
          }}
        >
          :/
        </div>
        <h1
          style={{
            fontSize: "24px",
            fontWeight: 600,
            marginBottom: "12px",
          }}
        >
          Something went wrong
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: "#888",
            marginBottom: "32px",
            maxWidth: "400px",
          }}
        >
          We&apos;ve been notified and are working on a fix. Please try again.
        </p>
        <button
          onClick={reset}
          style={{
            padding: "14px 28px",
            fontSize: "15px",
            fontWeight: 600,
            color: "#fff",
            backgroundColor: "#6366f1",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
