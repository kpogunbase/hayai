"use client";

import Link from "next/link";

export default function PrivacyPolicy() {
  const effectiveDate = "January 15, 2025";
  const companyName = "Hayai";
  const websiteUrl = "https://readhayai.com";
  const contactEmail = "support@readhayai.com";

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
          Privacy Policy
        </h1>
        <p style={{ color: "var(--text-tertiary)", marginBottom: "40px" }}>
          Effective Date: {effectiveDate}
        </p>

        <div style={{ lineHeight: 1.7, fontSize: "15px" }}>
          <section style={{ marginBottom: "32px" }}>
            <p>
              {companyName} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;) operates the website{" "}
              <a href={websiteUrl} style={{ color: "var(--accent)" }}>{websiteUrl}</a>{" "}
              (the &quot;Service&quot;). This Privacy Policy explains how we collect, use, disclose,
              and safeguard your information when you use our Service.
            </p>
            <p style={{ marginTop: "16px" }}>
              <strong>Please read this Privacy Policy carefully.</strong> By accessing or using
              the Service, you acknowledge that you have read, understood, and agree to be bound
              by this Privacy Policy. If you do not agree, please discontinue use of the Service.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              1. Information We Collect
            </h2>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              1.1 Information You Provide
            </h3>
            <ul style={{ paddingLeft: "24px", marginBottom: "16px" }}>
              <li style={{ marginBottom: "8px" }}>
                <strong>Account Information:</strong> When you sign in via Google OAuth, we receive
                your email address and basic profile information (name, profile picture) from Google.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Profile Information:</strong> You may optionally provide a username and
                upload a profile picture.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Payment Information:</strong> When you subscribe, payment details are
                collected and processed directly by Stripe. We do not store your full credit card
                number on our servers.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Uploaded Content:</strong> Documents you upload (TXT, PDF, DOCX) are
                processed locally in your browser. We do not store your uploaded documents on our servers.
              </li>
            </ul>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              1.2 Information Collected Automatically
            </h3>
            <ul style={{ paddingLeft: "24px", marginBottom: "16px" }}>
              <li style={{ marginBottom: "8px" }}>
                <strong>Usage Data:</strong> We track your upload count to enforce usage limits
                based on your subscription tier.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Reading Statistics:</strong> We may store your reading progress, words
                read, and reading speed preferences locally in your browser (IndexedDB/localStorage).
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Device Information:</strong> We may collect information about your browser
                type, operating system, and device type for analytics and troubleshooting purposes.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Log Data:</strong> Our servers automatically record information including
                your IP address, browser type, referring/exit pages, and timestamps.
              </li>
            </ul>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              1.3 Cookies and Local Storage
            </h3>
            <p>
              We use cookies and similar technologies to maintain your session, remember your
              preferences, and provide the Service. We also use browser local storage to save
              your reading progress and settings. You can disable cookies in your browser settings,
              but this may affect the functionality of the Service.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              2. How We Use Your Information
            </h2>
            <p>We use the information we collect to:</p>
            <ul style={{ paddingLeft: "24px", marginTop: "12px" }}>
              <li style={{ marginBottom: "8px" }}>Provide, maintain, and improve the Service</li>
              <li style={{ marginBottom: "8px" }}>Process transactions and send related information</li>
              <li style={{ marginBottom: "8px" }}>Send you technical notices, updates, and support messages</li>
              <li style={{ marginBottom: "8px" }}>Respond to your comments, questions, and requests</li>
              <li style={{ marginBottom: "8px" }}>Monitor and analyze usage trends to improve user experience</li>
              <li style={{ marginBottom: "8px" }}>Detect, prevent, and address fraud and security issues</li>
              <li style={{ marginBottom: "8px" }}>Enforce our Terms of Service and comply with legal obligations</li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              3. How We Share Your Information
            </h2>
            <p>We may share your information in the following circumstances:</p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              3.1 Third-Party Service Providers
            </h3>
            <ul style={{ paddingLeft: "24px", marginBottom: "16px" }}>
              <li style={{ marginBottom: "8px" }}>
                <strong>Supabase:</strong> We use Supabase for authentication and database services.
                Your account data is stored on Supabase servers.{" "}
                <a href="https://supabase.com/privacy" style={{ color: "var(--accent)" }} target="_blank" rel="noopener noreferrer">
                  Supabase Privacy Policy
                </a>
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Stripe:</strong> We use Stripe to process payments. When you make a purchase,
                your payment information is handled directly by Stripe.{" "}
                <a href="https://stripe.com/privacy" style={{ color: "var(--accent)" }} target="_blank" rel="noopener noreferrer">
                  Stripe Privacy Policy
                </a>
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Google:</strong> We use Google OAuth for authentication. When you sign in
                with Google, Google shares your basic profile information with us.{" "}
                <a href="https://policies.google.com/privacy" style={{ color: "var(--accent)" }} target="_blank" rel="noopener noreferrer">
                  Google Privacy Policy
                </a>
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Vercel:</strong> Our Service is hosted on Vercel.{" "}
                <a href="https://vercel.com/legal/privacy-policy" style={{ color: "var(--accent)" }} target="_blank" rel="noopener noreferrer">
                  Vercel Privacy Policy
                </a>
              </li>
            </ul>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              3.2 Legal Requirements
            </h3>
            <p>
              We may disclose your information if required to do so by law or in response to valid
              requests by public authorities (e.g., a court or government agency), or when we believe
              disclosure is necessary to protect our rights, your safety, or the safety of others.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              3.3 Business Transfers
            </h3>
            <p>
              If we are involved in a merger, acquisition, or sale of all or a portion of our assets,
              your information may be transferred as part of that transaction. We will notify you via
              email and/or a prominent notice on our Service of any change in ownership or uses of
              your personal information.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              3.4 What We Do NOT Share
            </h3>
            <p>
              We do <strong>not</strong> sell, rent, or trade your personal information to third
              parties for their marketing purposes. We do <strong>not</strong> share your uploaded
              documents with anyone, as they are processed locally in your browser.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              4. Data Retention
            </h2>
            <p>
              We retain your personal information for as long as your account is active or as needed
              to provide you with the Service. We will also retain and use your information as
              necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
            </p>
            <p style={{ marginTop: "12px" }}>
              If you wish to delete your account and associated data, please contact us at{" "}
              <a href={`mailto:${contactEmail}`} style={{ color: "var(--accent)" }}>{contactEmail}</a>.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              5. Data Security
            </h2>
            <p>
              We implement appropriate technical and organizational security measures to protect
              your personal information against unauthorized access, alteration, disclosure, or
              destruction. These measures include:
            </p>
            <ul style={{ paddingLeft: "24px", marginTop: "12px" }}>
              <li style={{ marginBottom: "8px" }}>Encryption of data in transit using TLS/SSL</li>
              <li style={{ marginBottom: "8px" }}>Encryption of sensitive data at rest</li>
              <li style={{ marginBottom: "8px" }}>Regular security audits and testing</li>
              <li style={{ marginBottom: "8px" }}>Row-level security policies in our database</li>
              <li style={{ marginBottom: "8px" }}>Secure authentication via OAuth 2.0</li>
            </ul>
            <p style={{ marginTop: "12px" }}>
              However, no method of transmission over the Internet or electronic storage is 100%
              secure. While we strive to use commercially acceptable means to protect your personal
              information, we cannot guarantee its absolute security.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              6. Your Rights and Choices
            </h2>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              6.1 Access and Portability
            </h3>
            <p>
              You have the right to request a copy of the personal information we hold about you.
              Contact us at{" "}
              <a href={`mailto:${contactEmail}`} style={{ color: "var(--accent)" }}>{contactEmail}</a>{" "}
              to make this request.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              6.2 Correction
            </h3>
            <p>
              You can update your profile information (username, avatar) directly through your
              account settings. For other corrections, contact us.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              6.3 Deletion
            </h3>
            <p>
              You may request deletion of your account and personal data by contacting us. Note
              that we may retain certain information as required by law or for legitimate business
              purposes.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              6.4 Opt-Out
            </h3>
            <p>
              You may opt out of receiving promotional communications by following the unsubscribe
              instructions in those messages. Note that you cannot opt out of service-related
              communications (e.g., account verification, purchase confirmations).
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              7. International Data Transfers
            </h2>
            <p>
              Your information may be transferred to and processed in countries other than your
              country of residence, including the United States. These countries may have data
              protection laws that are different from the laws of your country. By using the Service,
              you consent to the transfer of your information to these countries.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              8. Children&apos;s Privacy
            </h2>
            <p>
              The Service is not intended for children under the age of 13. We do not knowingly
              collect personal information from children under 13. If we become aware that we have
              collected personal information from a child under 13, we will take steps to delete
              that information. If you believe we have collected information from a child under 13,
              please contact us at{" "}
              <a href={`mailto:${contactEmail}`} style={{ color: "var(--accent)" }}>{contactEmail}</a>.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              9. California Privacy Rights (CCPA)
            </h2>
            <p>
              If you are a California resident, you have additional rights under the California
              Consumer Privacy Act (CCPA):
            </p>
            <ul style={{ paddingLeft: "24px", marginTop: "12px" }}>
              <li style={{ marginBottom: "8px" }}>
                <strong>Right to Know:</strong> You can request information about the categories
                and specific pieces of personal information we have collected about you.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Right to Delete:</strong> You can request deletion of your personal information.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Right to Non-Discrimination:</strong> We will not discriminate against you
                for exercising your CCPA rights.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>No Sale of Personal Information:</strong> We do not sell personal information
                as defined by the CCPA.
              </li>
            </ul>
            <p style={{ marginTop: "12px" }}>
              To exercise these rights, contact us at{" "}
              <a href={`mailto:${contactEmail}`} style={{ color: "var(--accent)" }}>{contactEmail}</a>.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              10. European Privacy Rights (GDPR)
            </h2>
            <p>
              If you are located in the European Economic Area (EEA), you have additional rights
              under the General Data Protection Regulation (GDPR):
            </p>
            <ul style={{ paddingLeft: "24px", marginTop: "12px" }}>
              <li style={{ marginBottom: "8px" }}>
                <strong>Legal Basis:</strong> We process your data based on: (a) your consent,
                (b) performance of a contract, (c) compliance with legal obligations, or
                (d) our legitimate interests.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Right to Access:</strong> You can request a copy of your personal data.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Right to Rectification:</strong> You can request correction of inaccurate data.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Right to Erasure:</strong> You can request deletion of your data.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Right to Restrict Processing:</strong> You can request that we limit how
                we use your data.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Right to Data Portability:</strong> You can request your data in a
                machine-readable format.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Right to Object:</strong> You can object to processing based on legitimate
                interests.
              </li>
              <li style={{ marginBottom: "8px" }}>
                <strong>Right to Withdraw Consent:</strong> Where we rely on consent, you can
                withdraw it at any time.
              </li>
            </ul>
            <p style={{ marginTop: "12px" }}>
              You also have the right to lodge a complaint with your local supervisory authority.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              11. Changes to This Privacy Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any
              changes by posting the new Privacy Policy on this page and updating the &quot;Effective
              Date&quot; at the top. For material changes, we may also send you an email notification.
            </p>
            <p style={{ marginTop: "12px" }}>
              Your continued use of the Service after any changes indicates your acceptance of
              the updated Privacy Policy.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              12. Contact Us
            </h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices, please
              contact us at:
            </p>
            <p style={{ marginTop: "12px" }}>
              <strong>{companyName}</strong><br />
              Email:{" "}
              <a href={`mailto:${contactEmail}`} style={{ color: "var(--accent)" }}>{contactEmail}</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
