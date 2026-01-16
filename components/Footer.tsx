"use client";

import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      style={{
        padding: "24px",
        borderTop: "1px solid var(--border)",
        backgroundColor: "var(--bg-primary)",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            color: "var(--text-tertiary)",
          }}
        >
          &copy; {currentYear} Hayai. All rights reserved.
        </div>

        <nav
          style={{
            display: "flex",
            gap: "24px",
            fontSize: "13px",
          }}
        >
          <Link
            href="/privacy"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            Terms of Service
          </Link>
          <a
            href="mailto:support@readhayai.com"
            style={{
              color: "var(--text-secondary)",
              textDecoration: "none",
              transition: "color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-primary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
            }}
          >
            Contact
          </a>
        </nav>
      </div>
    </footer>
  );
}
