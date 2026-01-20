# Security Policy

## Reporting a Vulnerability

We take the security of Hayai seriously. If you believe you have found a security vulnerability, please report it to us responsibly.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **GitHub Security Advisories**: Use GitHub's private vulnerability reporting feature at [github.com/kpogunbase/hayai/security/advisories](https://github.com/kpogunbase/hayai/security/advisories)

2. **Email**: Send details to security@makeamericareadagain.ai

### What to Include

Please include the following information in your report:

- Type of vulnerability (e.g., XSS, SQL injection, authentication bypass)
- Full paths of source file(s) related to the vulnerability
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact assessment of the vulnerability
- Any potential mitigations you've identified

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Communication**: We will keep you informed of our progress throughout the process
- **Resolution Timeline**: We aim to resolve critical vulnerabilities within 7 days, and other issues within 30 days
- **Credit**: We will credit you in our security acknowledgments (unless you prefer to remain anonymous)

## Scope

### In Scope

- The Hayai web application (hayai.vercel.app, makeamericareadagain.ai)
- Authentication and session management
- Data storage and privacy
- API endpoints
- Client-side security (XSS, CSRF, etc.)

### Out of Scope

- Third-party services we integrate with (Supabase, Stripe, Vercel)
- Social engineering attacks
- Physical attacks
- Denial of service attacks
- Issues in dependencies (please report these to the respective projects)

## Safe Harbor

We support safe harbor for security researchers who:

- Make a good faith effort to avoid privacy violations, destruction of data, and interruption or degradation of our services
- Only interact with accounts you own or with explicit permission of the account holder
- Do not exploit a security issue for purposes other than verification
- Report vulnerabilities promptly and provide us reasonable time to address them before public disclosure
- Do not use automated scanning tools that generate excessive traffic

We will not pursue civil or criminal action against researchers who follow these guidelines.

## Security Measures

Hayai implements the following security measures:

### Application Security
- Content Security Policy (CSP) headers
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options to prevent clickjacking
- X-Content-Type-Options to prevent MIME sniffing
- Rate limiting on all API endpoints

### Authentication
- OAuth 2.0 with PKCE flow via Supabase Auth
- Secure session management
- Server-side user validation

### Data Protection
- Row Level Security (RLS) on all database tables
- Client-side data stored in IndexedDB (local only)
- No sensitive data transmitted without encryption

### Input Validation
- Server-side validation of all user inputs
- Content length limits on user-submitted data
- URL validation against allowlists

## Acknowledgments

We would like to thank the following security researchers for their responsible disclosure:

*No acknowledgments yet. Be the first!*

---

Last updated: January 2025
