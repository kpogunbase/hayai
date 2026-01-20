"use client";

import Link from "next/link";

export default function SecurityPolicy() {
  const lastUpdated = "January 2025";
  const contactEmail = "security@makeamericareadagain.ai";
  const githubSecurityUrl = "https://github.com/kpogunbase/hayai/security/advisories";

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          padding: "40px 24px 80px",
        }}
      >
        <Link
          href="/"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            color: "var(--text-secondary)",
            textDecoration: "none",
            fontSize: "14px",
            marginBottom: "32px",
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Hayai
        </Link>

        <h1 style={{ fontSize: "32px", fontWeight: 700, marginBottom: "8px" }}>
          Security Policy
        </h1>
        <p style={{ color: "var(--text-tertiary)", marginBottom: "40px" }}>
          Last Updated: {lastUpdated}
        </p>

        <div style={{ lineHeight: 1.7, fontSize: "15px" }}>
          <section style={{ marginBottom: "32px" }}>
            <p>
              We take the security of Hayai seriously. This page outlines how to report
              security vulnerabilities and what to expect from our response process.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              Reporting a Vulnerability
            </h2>
            <p style={{ marginBottom: "16px" }}>
              <strong>Please do not report security vulnerabilities through public GitHub issues.</strong>
            </p>
            <p style={{ marginBottom: "16px" }}>
              Instead, please report them via one of the following methods:
            </p>
            <ul style={{ paddingLeft: "24px", marginBottom: "16px" }}>
              <li style={{ marginBottom: "8px" }}>
                <strong>GitHub Security Advisories:</strong>{" "}
                <a href={githubSecurityUrl} style={{ color: "var(--accent)" }}>
                  Submit a private security advisory
                </a>
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Email:</strong>{" "}
                <a href={`mailto:${contactEmail}`} style={{ color: "var(--accent)" }}>
                  {contactEmail}
                </a>
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              What to Include
            </h2>
            <p style={{ marginBottom: "16px" }}>
              Please include the following information in your report:
            </p>
            <ul style={{ paddingLeft: "24px", marginBottom: "16px" }}>
              <li style={{ marginBottom: "8px" }}>Type of vulnerability (e.g., XSS, authentication bypass)</li>
              <li style={{ marginBottom: "8px" }}>Full paths of source file(s) related to the vulnerability</li>
              <li style={{ marginBottom: "8px" }}>Step-by-step instructions to reproduce the issue</li>
              <li style={{ marginBottom: "8px" }}>Proof-of-concept or exploit code (if possible)</li>
              <li style={{ marginBottom: "8px" }}>Impact assessment of the vulnerability</li>
              <li style={{ marginBottom: "8px" }}>Any potential mitigations you&apos;ve identified</li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              What to Expect
            </h2>
            <ul style={{ paddingLeft: "24px", marginBottom: "16px" }}>
              <li style={{ marginBottom: "8px" }}>
                <strong>Acknowledgment:</strong> We will acknowledge receipt of your report within 48 hours
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Communication:</strong> We will keep you informed of our progress throughout the process
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Resolution Timeline:</strong> We aim to resolve critical vulnerabilities within 7 days, and other issues within 30 days
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Credit:</strong> We will credit you in our security acknowledgments (unless you prefer to remain anonymous)
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              Scope
            </h2>
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              In Scope
            </h3>
            <ul style={{ paddingLeft: "24px", marginBottom: "16px" }}>
              <li style={{ marginBottom: "8px" }}>The Hayai web application (hayai.vercel.app, makeamericareadagain.ai)</li>
              <li style={{ marginBottom: "8px" }}>Authentication and session management</li>
              <li style={{ marginBottom: "8px" }}>Data storage and privacy</li>
              <li style={{ marginBottom: "8px" }}>API endpoints</li>
              <li style={{ marginBottom: "8px" }}>Client-side security (XSS, CSRF, etc.)</li>
            </ul>
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              Out of Scope
            </h3>
            <ul style={{ paddingLeft: "24px", marginBottom: "16px" }}>
              <li style={{ marginBottom: "8px" }}>Third-party services we integrate with (Supabase, Stripe, Vercel)</li>
              <li style={{ marginBottom: "8px" }}>Social engineering attacks</li>
              <li style={{ marginBottom: "8px" }}>Physical attacks</li>
              <li style={{ marginBottom: "8px" }}>Denial of service attacks</li>
              <li style={{ marginBottom: "8px" }}>Issues in dependencies (please report these to the respective projects)</li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              Safe Harbor
            </h2>
            <p style={{ marginBottom: "16px" }}>
              We support safe harbor for security researchers who:
            </p>
            <ul style={{ paddingLeft: "24px", marginBottom: "16px" }}>
              <li style={{ marginBottom: "8px" }}>Make a good faith effort to avoid privacy violations, destruction of data, and interruption or degradation of our services</li>
              <li style={{ marginBottom: "8px" }}>Only interact with accounts you own or with explicit permission of the account holder</li>
              <li style={{ marginBottom: "8px" }}>Do not exploit a security issue for purposes other than verification</li>
              <li style={{ marginBottom: "8px" }}>Report vulnerabilities promptly and provide us reasonable time to address them before public disclosure</li>
              <li style={{ marginBottom: "8px" }}>Do not use automated scanning tools that generate excessive traffic</li>
            </ul>
            <p>
              We will not pursue civil or criminal action against researchers who follow these guidelines.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              Security Measures
            </h2>
            <p style={{ marginBottom: "16px" }}>
              Hayai implements the following security measures:
            </p>
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              Application Security
            </h3>
            <ul style={{ paddingLeft: "24px", marginBottom: "16px" }}>
              <li style={{ marginBottom: "8px" }}>Content Security Policy (CSP) headers</li>
              <li style={{ marginBottom: "8px" }}>HTTP Strict Transport Security (HSTS)</li>
              <li style={{ marginBottom: "8px" }}>X-Frame-Options to prevent clickjacking</li>
              <li style={{ marginBottom: "8px" }}>Rate limiting on all API endpoints</li>
            </ul>
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              Authentication
            </h3>
            <ul style={{ paddingLeft: "24px", marginBottom: "16px" }}>
              <li style={{ marginBottom: "8px" }}>OAuth 2.0 with PKCE flow via Supabase Auth</li>
              <li style={{ marginBottom: "8px" }}>Secure session management</li>
              <li style={{ marginBottom: "8px" }}>Server-side user validation</li>
            </ul>
            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              Data Protection
            </h3>
            <ul style={{ paddingLeft: "24px", marginBottom: "16px" }}>
              <li style={{ marginBottom: "8px" }}>Row Level Security (RLS) on all database tables</li>
              <li style={{ marginBottom: "8px" }}>Client-side data stored in IndexedDB (local only)</li>
              <li style={{ marginBottom: "8px" }}>No sensitive data transmitted without encryption</li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              Acknowledgments
            </h2>
            <p style={{ color: "var(--text-tertiary)", fontStyle: "italic" }}>
              No acknowledgments yet. Be the first to responsibly disclose a vulnerability!
            </p>
          </section>
        </div>

        <div
          style={{
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid var(--border)",
            display: "flex",
            gap: "24px",
            flexWrap: "wrap",
          }}
        >
          <Link href="/privacy" style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Privacy Policy
          </Link>
          <Link href="/terms" style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Terms of Service
          </Link>
          <Link href="/" style={{ color: "var(--text-secondary)", fontSize: "14px" }}>
            Back to Hayai
          </Link>
        </div>
      </div>
    </div>
  );
}
