"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function NotFound() {
  const [wpm, setWpm] = useState(0);
  const targetWpm = 404;

  // Animate the WPM counter up to 404
  useEffect(() => {
    const duration = 1500;
    const steps = 60;
    const increment = targetWpm / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= targetWpm) {
        setWpm(targetWpm);
        clearInterval(timer);
      } else {
        setWpm(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, []);

  const messages = [
    "This page read itself too fast and disappeared.",
    "You've reached the speed limit of the internet.",
    "Even our RSVP reader couldn't find this page.",
    "This page is buffering... forever.",
  ];

  const [message] = useState(
    messages[Math.floor(Math.random() * messages.length)]
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        padding: "24px",
        textAlign: "center",
      }}
    >
      {/* Animated 404 WPM Display */}
      <div
        style={{
          marginBottom: "32px",
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: "120px",
            fontWeight: 800,
            lineHeight: 1,
            background: "linear-gradient(135deg, var(--accent) 0%, #ff6b6b 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          {wpm}
        </div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--text-tertiary)",
            textTransform: "uppercase",
            letterSpacing: "4px",
            marginTop: "8px",
          }}
        >
          WPM (Words Per Missing)
        </div>
      </div>

      {/* Message */}
      <h1
        style={{
          fontSize: "24px",
          fontWeight: 600,
          marginBottom: "12px",
          color: "var(--text-primary)",
        }}
      >
        Page Not Found
      </h1>
      <p
        style={{
          fontSize: "16px",
          color: "var(--text-secondary)",
          marginBottom: "40px",
          maxWidth: "400px",
        }}
      >
        {message}
      </p>

      {/* RSVP-style word display */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          marginBottom: "40px",
          fontFamily: "monospace",
          fontSize: "32px",
          fontWeight: 500,
        }}
      >
        <span style={{ color: "var(--text-tertiary)" }}>go</span>
        <span
          style={{
            color: "var(--accent)",
            borderBottom: "3px solid var(--accent)",
            paddingBottom: "2px",
          }}
        >
          h
        </span>
        <span style={{ color: "var(--text-tertiary)" }}>ome</span>
      </div>

      {/* Actions */}
      <div
        style={{
          display: "flex",
          gap: "16px",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 28px",
            fontSize: "15px",
            fontWeight: 600,
            color: "#fff",
            backgroundColor: "var(--accent)",
            borderRadius: "10px",
            textDecoration: "none",
            transition: "transform 0.15s, opacity 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.opacity = "0.9";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.opacity = "1";
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          Back to Hayai
        </Link>

        <button
          onClick={() => window.history.back()}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "14px 28px",
            fontSize: "15px",
            fontWeight: 600,
            color: "var(--text-primary)",
            backgroundColor: "var(--bg-secondary)",
            border: "1px solid var(--border)",
            borderRadius: "10px",
            cursor: "pointer",
            transition: "background-color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-tertiary)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--bg-secondary)";
          }}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Go Back
        </button>
      </div>

      {/* Fun footer */}
      <p
        style={{
          position: "absolute",
          bottom: "24px",
          fontSize: "13px",
          color: "var(--text-tertiary)",
        }}
      >
        Pro tip: Reading faster won&apos;t make this page appear.
      </p>
    </div>
  );
}
