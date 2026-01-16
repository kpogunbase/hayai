"use client";

import Link from "next/link";

export default function TermsOfService() {
  const effectiveDate = "January 15, 2025";
  const companyName = "Hayai";
  const websiteUrl = "https://readhayai.com";
  const contactEmail = "support@readhayai.com";
  const jurisdiction = "California, United States";

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
          Terms of Service
        </h1>
        <p style={{ color: "var(--text-tertiary)", marginBottom: "40px" }}>
          Effective Date: {effectiveDate}
        </p>

        <div style={{ lineHeight: 1.7, fontSize: "15px" }}>
          <section style={{ marginBottom: "32px" }}>
            <p>
              Welcome to {companyName}. These Terms of Service (&quot;Terms&quot;) govern your access to
              and use of the {companyName} website located at{" "}
              <a href={websiteUrl} style={{ color: "var(--accent)" }}>{websiteUrl}</a>{" "}
              (the &quot;Service&quot;), operated by {companyName} (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;).
            </p>
            <p style={{ marginTop: "16px" }}>
              <strong>PLEASE READ THESE TERMS CAREFULLY BEFORE USING THE SERVICE.</strong> By
              accessing or using the Service, you agree to be bound by these Terms and our{" "}
              <Link href="/privacy" style={{ color: "var(--accent)" }}>Privacy Policy</Link>.
              If you do not agree to these Terms, do not use the Service.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              1. Description of Service
            </h2>
            <p>
              {companyName} is a speed reading application that uses Rapid Serial Visual
              Presentation (RSVP) technology to help users read text content faster. The Service
              allows users to upload documents, read them using our RSVP reader, and track their
              reading progress.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              2. Eligibility
            </h2>
            <p>
              You must be at least 13 years old to use the Service. By using the Service, you
              represent and warrant that:
            </p>
            <ul style={{ paddingLeft: "24px", marginTop: "12px" }}>
              <li style={{ marginBottom: "8px" }}>You are at least 13 years of age</li>
              <li style={{ marginBottom: "8px" }}>
                If you are between 13 and 18 years old (or the age of majority in your jurisdiction),
                you have your parent&apos;s or legal guardian&apos;s permission to use the Service
              </li>
              <li style={{ marginBottom: "8px" }}>
                You have the legal capacity to enter into a binding agreement
              </li>
              <li style={{ marginBottom: "8px" }}>
                You are not prohibited from using the Service under any applicable law
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              3. Account Registration
            </h2>
            <p>
              To access certain features of the Service, you must create an account by signing
              in with Google. You agree to:
            </p>
            <ul style={{ paddingLeft: "24px", marginTop: "12px" }}>
              <li style={{ marginBottom: "8px" }}>
                Provide accurate and complete information during registration
              </li>
              <li style={{ marginBottom: "8px" }}>
                Maintain the security of your account credentials
              </li>
              <li style={{ marginBottom: "8px" }}>
                Immediately notify us of any unauthorized access to your account
              </li>
              <li style={{ marginBottom: "8px" }}>
                Accept responsibility for all activities that occur under your account
              </li>
            </ul>
            <p style={{ marginTop: "12px" }}>
              We reserve the right to suspend or terminate your account if any information
              provided is inaccurate, false, or violates these Terms.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              4. Subscriptions and Payments
            </h2>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              4.1 Free and Paid Tiers
            </h3>
            <p>
              The Service offers both free and paid subscription tiers. Free users have limited
              uploads. Paid subscribers (&quot;Pro&quot;) have access to additional features and higher
              or unlimited usage limits as described on our pricing page.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              4.2 Billing
            </h3>
            <p>
              Paid subscriptions are billed in advance on a monthly or annual basis, depending
              on the plan you select. All payments are processed securely through Stripe.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              4.3 Automatic Renewal
            </h3>
            <p>
              Your subscription will automatically renew at the end of each billing period unless
              you cancel it before the renewal date. You authorize us to charge your payment
              method for the renewal.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              4.4 Cancellation
            </h3>
            <p>
              You may cancel your subscription at any time through the Stripe customer portal
              accessible from your account settings. Upon cancellation:
            </p>
            <ul style={{ paddingLeft: "24px", marginTop: "8px" }}>
              <li style={{ marginBottom: "8px" }}>
                Your subscription will remain active until the end of the current billing period
              </li>
              <li style={{ marginBottom: "8px" }}>
                You will not be charged for subsequent billing periods
              </li>
              <li style={{ marginBottom: "8px" }}>
                Your account will revert to the free tier after the subscription period ends
              </li>
            </ul>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              4.5 Refunds
            </h3>
            <p>
              All subscription fees are non-refundable, except as required by applicable law.
              If you believe you have been charged in error, please contact us at{" "}
              <a href={`mailto:${contactEmail}`} style={{ color: "var(--accent)" }}>{contactEmail}</a>{" "}
              within 14 days of the charge.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              4.6 Price Changes
            </h3>
            <p>
              We reserve the right to change our subscription prices at any time. Any price
              changes will not affect your current subscription period but will apply to
              subsequent renewals. We will provide reasonable notice of any price changes.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              5. Acceptable Use
            </h2>
            <p>You agree to use the Service only for lawful purposes. You will NOT:</p>
            <ul style={{ paddingLeft: "24px", marginTop: "12px" }}>
              <li style={{ marginBottom: "8px" }}>
                Upload, share, or distribute any content that is illegal, harmful, threatening,
                abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable
              </li>
              <li style={{ marginBottom: "8px" }}>
                Upload content that infringes on any third party&apos;s intellectual property rights,
                privacy rights, or other rights
              </li>
              <li style={{ marginBottom: "8px" }}>
                Attempt to gain unauthorized access to the Service, other users&apos; accounts,
                or our systems
              </li>
              <li style={{ marginBottom: "8px" }}>
                Use the Service to transmit malware, viruses, or other malicious code
              </li>
              <li style={{ marginBottom: "8px" }}>
                Interfere with or disrupt the Service or servers connected to the Service
              </li>
              <li style={{ marginBottom: "8px" }}>
                Use automated means (bots, scrapers, etc.) to access the Service without our
                written permission
              </li>
              <li style={{ marginBottom: "8px" }}>
                Circumvent or attempt to circumvent any usage limits or access controls
              </li>
              <li style={{ marginBottom: "8px" }}>
                Use the Service to violate any applicable laws or regulations
              </li>
              <li style={{ marginBottom: "8px" }}>
                Impersonate any person or entity or falsely claim an affiliation with any person
                or entity
              </li>
              <li style={{ marginBottom: "8px" }}>
                Share your account credentials or allow others to access your account
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              6. User Content
            </h2>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              6.1 Your Content
            </h3>
            <p>
              Documents you upload to the Service are processed locally in your browser. You
              retain all rights to your content. We do not claim ownership of any content you
              upload.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              6.2 Your Responsibility
            </h3>
            <p>
              You are solely responsible for the content you upload and must ensure you have
              the right to use and process such content. You represent and warrant that:
            </p>
            <ul style={{ paddingLeft: "24px", marginTop: "8px" }}>
              <li style={{ marginBottom: "8px" }}>
                You own or have obtained all necessary rights to the content you upload
              </li>
              <li style={{ marginBottom: "8px" }}>
                Your content does not violate any laws or infringe on any third party&apos;s rights
              </li>
              <li style={{ marginBottom: "8px" }}>
                Your content does not contain any viruses or malicious code
              </li>
            </ul>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              6.3 Profile Content
            </h3>
            <p>
              If you upload a profile picture or set a username, you grant us a limited,
              non-exclusive license to display that content within the Service for the purpose
              of providing the Service to you.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              7. Intellectual Property
            </h2>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              7.1 Our Property
            </h3>
            <p>
              The Service, including its original content, features, functionality, design,
              code, and branding (excluding user content), is and will remain the exclusive
              property of {companyName} and its licensors. The Service is protected by copyright,
              trademark, and other intellectual property laws.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              7.2 Limited License
            </h3>
            <p>
              We grant you a limited, non-exclusive, non-transferable, revocable license to
              access and use the Service for your personal, non-commercial use, subject to
              these Terms.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              7.3 Restrictions
            </h3>
            <p>You may not:</p>
            <ul style={{ paddingLeft: "24px", marginTop: "8px" }}>
              <li style={{ marginBottom: "8px" }}>
                Copy, modify, or create derivative works of the Service
              </li>
              <li style={{ marginBottom: "8px" }}>
                Reverse engineer, decompile, or disassemble any part of the Service
              </li>
              <li style={{ marginBottom: "8px" }}>
                Remove any copyright, trademark, or other proprietary notices
              </li>
              <li style={{ marginBottom: "8px" }}>
                Use our trademarks or branding without our prior written consent
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              8. Disclaimers
            </h2>
            <div style={{ backgroundColor: "var(--bg-secondary)", padding: "20px", borderRadius: "8px", marginBottom: "16px" }}>
              <p style={{ fontWeight: 600, marginBottom: "12px" }}>
                THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY
                KIND, EITHER EXPRESS OR IMPLIED.
              </p>
              <p>
                TO THE FULLEST EXTENT PERMITTED BY LAW, WE DISCLAIM ALL WARRANTIES, INCLUDING
                BUT NOT LIMITED TO:
              </p>
              <ul style={{ paddingLeft: "24px", marginTop: "12px" }}>
                <li style={{ marginBottom: "8px" }}>
                  IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
                  NON-INFRINGEMENT
                </li>
                <li style={{ marginBottom: "8px" }}>
                  WARRANTIES THAT THE SERVICE WILL BE UNINTERRUPTED, ERROR-FREE, SECURE, OR
                  FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS
                </li>
                <li style={{ marginBottom: "8px" }}>
                  WARRANTIES REGARDING THE ACCURACY, RELIABILITY, OR COMPLETENESS OF ANY
                  CONTENT OR INFORMATION PROVIDED THROUGH THE SERVICE
                </li>
                <li style={{ marginBottom: "8px" }}>
                  WARRANTIES THAT THE SERVICE WILL MEET YOUR REQUIREMENTS OR ACHIEVE ANY
                  INTENDED RESULTS
                </li>
              </ul>
            </div>
            <p>
              We do not warrant that the use of our speed reading technology will improve your
              reading speed or comprehension. Results may vary based on individual factors.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              9. Limitation of Liability
            </h2>
            <div style={{ backgroundColor: "var(--bg-secondary)", padding: "20px", borderRadius: "8px" }}>
              <p style={{ marginBottom: "12px" }}>
                <strong>TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW:</strong>
              </p>
              <p style={{ marginBottom: "12px" }}>
                IN NO EVENT SHALL {companyName.toUpperCase()}, ITS OWNER, OFFICERS, DIRECTORS, EMPLOYEES,
                AGENTS, OR LICENSORS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
                OR PUNITIVE DAMAGES, INCLUDING BUT NOT LIMITED TO:
              </p>
              <ul style={{ paddingLeft: "24px", marginBottom: "12px" }}>
                <li style={{ marginBottom: "8px" }}>LOSS OF PROFITS, DATA, OR GOODWILL</li>
                <li style={{ marginBottom: "8px" }}>SERVICE INTERRUPTION OR COMPUTER DAMAGE</li>
                <li style={{ marginBottom: "8px" }}>COST OF SUBSTITUTE SERVICES</li>
                <li style={{ marginBottom: "8px" }}>ANY DAMAGES ARISING FROM YOUR USE OR INABILITY TO USE THE SERVICE</li>
              </ul>
              <p style={{ marginBottom: "12px" }}>
                REGARDLESS OF THE THEORY OF LIABILITY (CONTRACT, TORT, OR OTHERWISE), EVEN IF
                WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
              </p>
              <p>
                <strong>
                  OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING FROM OR RELATED TO THE
                  SERVICE SHALL NOT EXCEED THE GREATER OF: (A) THE AMOUNT YOU PAID TO US IN
                  THE 12 MONTHS PRECEDING THE CLAIM, OR (B) ONE HUNDRED DOLLARS ($100 USD).
                </strong>
              </p>
            </div>
            <p style={{ marginTop: "16px" }}>
              Some jurisdictions do not allow the exclusion or limitation of certain damages.
              If these laws apply to you, some or all of the above limitations may not apply,
              and you may have additional rights.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              10. Indemnification
            </h2>
            <p>
              You agree to indemnify, defend, and hold harmless {companyName}, its owner, and
              any affiliated parties from and against any and all claims, damages, losses,
              liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising
              out of or related to:
            </p>
            <ul style={{ paddingLeft: "24px", marginTop: "12px" }}>
              <li style={{ marginBottom: "8px" }}>Your use or misuse of the Service</li>
              <li style={{ marginBottom: "8px" }}>Your violation of these Terms</li>
              <li style={{ marginBottom: "8px" }}>Your violation of any rights of any third party</li>
              <li style={{ marginBottom: "8px" }}>Any content you upload or share through the Service</li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              11. Dispute Resolution
            </h2>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              11.1 Informal Resolution
            </h3>
            <p>
              Before filing any legal claim, you agree to first contact us at{" "}
              <a href={`mailto:${contactEmail}`} style={{ color: "var(--accent)" }}>{contactEmail}</a>{" "}
              and attempt to resolve the dispute informally for at least 30 days.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              11.2 Binding Arbitration
            </h3>
            <p>
              If we cannot resolve a dispute informally, any controversy or claim arising out
              of or relating to these Terms or the Service shall be settled by binding arbitration
              administered by a mutually agreed-upon arbitration service. The arbitration will
              be conducted on an individual basis and not as a class action.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              11.3 Class Action Waiver
            </h3>
            <p>
              <strong>
                YOU AGREE THAT ANY DISPUTE RESOLUTION PROCEEDINGS WILL BE CONDUCTED ONLY ON AN
                INDIVIDUAL BASIS AND NOT IN A CLASS, CONSOLIDATED, OR REPRESENTATIVE ACTION.
              </strong>
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              11.4 Exceptions
            </h3>
            <p>
              Notwithstanding the above, either party may bring an individual action in small
              claims court or seek injunctive relief for intellectual property infringement.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              12. Governing Law
            </h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of
              the State of {jurisdiction.split(",")[0]}, {jurisdiction.split(",")[1]?.trim()}, without regard
              to its conflict of law provisions.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              13. Termination
            </h2>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              13.1 By You
            </h3>
            <p>
              You may terminate your account at any time by contacting us at{" "}
              <a href={`mailto:${contactEmail}`} style={{ color: "var(--accent)" }}>{contactEmail}</a>.
              If you have an active subscription, please cancel it first through the Stripe portal.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              13.2 By Us
            </h3>
            <p>
              We may terminate or suspend your account and access to the Service immediately,
              without prior notice or liability, for any reason, including if you breach these
              Terms. Upon termination:
            </p>
            <ul style={{ paddingLeft: "24px", marginTop: "8px" }}>
              <li style={{ marginBottom: "8px" }}>Your right to use the Service will immediately cease</li>
              <li style={{ marginBottom: "8px" }}>We may delete your account and associated data</li>
              <li style={{ marginBottom: "8px" }}>
                Provisions of these Terms that should survive termination will remain in effect
              </li>
            </ul>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              14. Changes to Terms
            </h2>
            <p>
              We reserve the right to modify these Terms at any time. We will provide notice of
              material changes by:
            </p>
            <ul style={{ paddingLeft: "24px", marginTop: "12px" }}>
              <li style={{ marginBottom: "8px" }}>Posting the updated Terms on this page</li>
              <li style={{ marginBottom: "8px" }}>Updating the &quot;Effective Date&quot; at the top</li>
              <li style={{ marginBottom: "8px" }}>
                For material changes, sending an email to the address associated with your account
              </li>
            </ul>
            <p style={{ marginTop: "12px" }}>
              Your continued use of the Service after any changes constitutes acceptance of the
              new Terms. If you do not agree to the new Terms, you must stop using the Service.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              15. General Provisions
            </h2>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              15.1 Entire Agreement
            </h3>
            <p>
              These Terms, together with our Privacy Policy, constitute the entire agreement
              between you and {companyName} regarding the Service and supersede all prior
              agreements and understandings.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              15.2 Severability
            </h3>
            <p>
              If any provision of these Terms is found to be unenforceable, the remaining
              provisions will remain in full force and effect.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              15.3 Waiver
            </h3>
            <p>
              Our failure to enforce any right or provision of these Terms will not be deemed
              a waiver of such right or provision.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              15.4 Assignment
            </h3>
            <p>
              You may not assign or transfer these Terms or your rights hereunder without our
              prior written consent. We may assign our rights and obligations without restriction.
            </p>

            <h3 style={{ fontSize: "16px", fontWeight: 600, marginBottom: "12px", marginTop: "20px" }}>
              15.5 Force Majeure
            </h3>
            <p>
              We shall not be liable for any failure or delay in performing our obligations
              due to circumstances beyond our reasonable control, including but not limited to
              natural disasters, acts of government, internet outages, or third-party service
              failures.
            </p>
          </section>

          <section style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "20px", fontWeight: 600, marginBottom: "16px" }}>
              16. Contact Information
            </h2>
            <p>
              If you have any questions about these Terms, please contact us at:
            </p>
            <p style={{ marginTop: "12px" }}>
              <strong>{companyName}</strong><br />
              Email:{" "}
              <a href={`mailto:${contactEmail}`} style={{ color: "var(--accent)" }}>{contactEmail}</a>
            </p>
          </section>

          <section style={{ marginTop: "48px", padding: "24px", backgroundColor: "var(--bg-secondary)", borderRadius: "12px" }}>
            <p style={{ fontStyle: "italic", color: "var(--text-secondary)", fontSize: "14px" }}>
              By using {companyName}, you acknowledge that you have read, understood, and agree
              to be bound by these Terms of Service.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
