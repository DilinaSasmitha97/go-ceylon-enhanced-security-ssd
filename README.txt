================================================================================
SE4030 - Secure Software Development
Academic Assignment Submission - Readme Deliverable
Group ID: 97
Application: GoCeylon (Enhanced Security & Identity Federation Platform)
Marks Allocated: 25 | Group Size: 4
================================================================================

1. GROUP MEMBERS AND INDEX NUMBERS
--------------------------------------------------------------------------------
1. A. W. Dilina Sasmitha (Sasmitha A. W. D.)
   Student ID / Index No: IT23143418
   SLIIT Email: it23143418@my.sliit.lk | Personal: dilinasasmitha18@gmail.com
   Contact: 0760817797
   Role: Authentication Architecture, Cryptographic Key Management & Google OAuth 2.0 / OIDC Backend Lead
   Contributions: VULN-01 (Secrets Isolation), VULN-02 (Admin Registration RBAC), Google OAuth 2.0 PKCE Backend Engine, Server-Side Weather Proxy

2. P. G. Dewmini Navodya (Navodya P. G. D.)
   Student ID / Index No: IT23144330
   SLIIT Email: it23144330@my.sliit.lk | Personal: dewminigamage22@gmail.com
   Contact: 0756451400
   Role: Login Security, Anti-Brute-Force Rate Limiting & Calendar Integration Lead
   Contributions: VULN-05 (NoSQL Injection & Enumeration), VULN-06 (Login Rate Limiting), Google OAuth Frontend Integration, Google Calendar Itinerary Synchronization

3. R. A. Bosilu Jinajith (Jinajith R. A. B.)
   Student ID / Index No: IT23212268
   SLIIT Email: it23212268@my.sliit.lk | Personal: rabjinajith@gmail.com
   Contact: 0762250479
   Role: Content Security (Stored XSS), Media Upload Security & Attack Chain Threat Modeling Lead
   Contributions: VULN-04 (Stored XSS in Descriptions), VULN-07 (Unrestricted File Uploads), Multer RAM Buffering & Sharp Transcoding, End-to-End Attack Chain Modeling

4. W. M. Vonara Wijethunge (Wijethunge W. M. V.)
   Student ID / Index No: IT23256750
   SLIIT Email: it23256750@my.sliit.lk | Personal: vonarawijethunge@gmail.com
   Contact: 0775671404
   Role: Object-Level Access Control (IDOR), Security Headers, DevSecOps CI/CD Pipeline & Test Lead
   Contributions: VULN-03 (IDOR Ownership Controls), VULN-08 (Security Headers & CORS), Bonus A10 (Centralized Error Handling), Bonus A03 (Dependency Hardening & Dependabot), DevSecOps CI/CD Pipeline & Jest Regression Suite


2. GITHUB REPOSITORY LINKS
--------------------------------------------------------------------------------
Original Project Repositories:
- Backend:  https://github.com/bosilu-ranathunga/GoCeylon-backend.git
- Frontend: https://github.com/bosilu-ranathunga/GoCeylon-frontend.git

Modified Project Repository (Enhanced Security Version):
- Repository: https://github.com/DilinaSasmitha97/go-ceylon-enhanced-security-ssd.git
- Active Hardened Production Branch: main
  (Note: Full commit history, detailed commit messages, and merged pull requests are maintained on branch 'main')


3. YOUTUBE VIDEO DEMONSTRATION LINK
--------------------------------------------------------------------------------
Link: https://youtu.be/PLACEHOLDER_DEMO_LINK
(Maximum 20 minutes: Detailed walkthrough explaining the 8 remediated vulnerabilities, proof-of-concept exploits, dual-layer defensive implementations, and the Google OAuth 2.0 / OpenID Connect + Google Calendar integration)


4. SUMMARY OF REMEDIATED VULNERABILITIES (8 DISTINCT VULNERABILITIES + 2 BONUS)
--------------------------------------------------------------------------------
1. VULN-01: Hardcoded Secrets & Cloud Credential Leakage
   - OWASP: A02:2021-Cryptographic Failures | CWE-798, CWE-321
   - CVSS: 9.8 (Critical) -> 0.0 (Remediated)
   - Owner: A. W. Dilina Sasmitha (IT23143418)
   - Fix: Complete environment isolation via dotenv, 256-bit cryptographically secure random JWT secret, and server-side Weather API proxy.

2. VULN-02: Unauthenticated Administrative Account Registration
   - OWASP: A01:2021-Broken Access Control | CWE-306, CWE-269
   - CVSS: 9.8 (Critical) -> 0.0 (Remediated)
   - Owner: A. W. Dilina Sasmitha (IT23143418)
   - Fix: Attached role-based access control middleware authMiddleware(['admin']) to /admin/register.

3. VULN-03: Insecure Direct Object References (IDOR) & Broken Object Authorization
   - OWASP: A01:2021-Broken Access Control | CWE-639, CWE-284
   - CVSS: 8.8 (High) -> 0.0 (Remediated)
   - Owner: Vonara Wijethunge (IT23256750)
   - Fix: Implemented ownershipMiddleware.js enforcing requireSelfOrAdmin and requireBookingAccess, locked down user directories, and prevented mass assignment.

4. VULN-04: Stored Cross-Site Scripting (XSS) in Attraction Descriptions
   - OWASP: A03:2021-Injection | CWE-79
   - CVSS: 7.6 (High) -> 0.0 (Remediated)
   - Owner: R. A. Bosilu Jinajith (IT23212268)
   - Fix: Dual-layer sanitization with sanitize-html on server-side persistence and DOMPurify on client-side rendering.

5. VULN-05: NoSQL Query Injection & User Account Enumeration
   - OWASP: A03:2021-Injection | CWE-943, CWE-204
   - CVSS: 8.6 (High) -> 0.0 (Remediated)
   - Owner: Dewmini Navodya Gamage (IT23144330)
   - Fix: Integrated express-mongo-sanitize globally, enforced primitive string validation, and standardized generic authentication error messages.

6. VULN-06: Authentication Brute-Force & Credential Stuffing
   - OWASP: A07:2021-Identification and Authentication Failures | CWE-307
   - CVSS: 7.5 (High) -> 0.0 (Remediated)
   - Owner: Dewmini Navodya Gamage (IT23144330)
   - Fix: Configured targeted express-rate-limit on login routes (5 attempts / 15 min) and global API rate limiting (100 req / 15 min).

7. VULN-07: Unrestricted File Upload & Media Storage Vulnerabilities
   - OWASP: A04:2021-Insecure Design | CWE-434
   - CVSS: 9.1 (Critical) -> 0.0 (Remediated)
   - Owner: R. A. Bosilu Jinajith (IT23212268)
   - Fix: Multer in-memory buffering, Sharp binary magic-byte decoding and WebP/JPEG re-encoding, direct Cloudinary streaming, and strict file constraints.

8. VULN-08: Security Misconfiguration, Insecure CORS & Missing Security Headers
   - OWASP: A05:2021-Security Misconfiguration | CWE-1021, CWE-942
   - CVSS: 6.5 (Medium) -> 0.0 (Remediated)
   - Owner: Vonara Wijethunge (IT23256750)
   - Fix: Helmet security header suite (CSP frame-ancestors 'none', X-Frame-Options: DENY, HSTS, X-Content-Type-Options), strict CORS domain whitelisting.

Bonus A10: Centralized Exception Handling & Stack Trace Leaks
   - OWASP A10 / CWE-209, CWE-550: Generic production error masking and centralized error handling middleware.

Bonus A03: Vulnerable Third-Party Dependencies
   - OWASP A03 / CWE-1395: Upgraded high/critical vulnerable packages and configured automated Dependabot scanning.


5. OAUTH 2.0 & OPENID CONNECT (OIDC) IMPLEMENTATION
--------------------------------------------------------------------------------
- Standard: RFC 7636 (PKCE) and RFC 6749.
- Provider: Google Identity Services.
- Architecture:
  1. Backend generates cryptographically secure code_verifier, code_challenge (SHA-256), state token (anti-CSRF), and nonce.
  2. Google consent dialog authenticates user and returns authorization code to backend callback.
  3. Backend exchanges code with Google token endpoint, validates ID token signature, and issues a single-use One-Time Code (OTC).
  4. Frontend exchanges OTC for a signed GoCeylon session JWT, preventing token exposure in browser URLs or history.
  5. Incremental Authorization enables Google Calendar API integration to sync tourist tour itineraries automatically.


6. GIT COMMIT AUDIT ON BRANCH 'main'
--------------------------------------------------------------------------------
Dilina Sasmitha (IT23143418):
- 1600365: fix(VULN-01): eliminate hardcoded secrets and default JWT secret
- 2ba89fc: fix(VULN-02): restrict admin registration to authenticated administrators
- 4e8504a: feat(auth): implement Google OAuth 2.0 PKCE backend with one-time code exchange
- 0976280: fix(VULN-01): proxy weather API via backend to eliminate frontend hardcoded secret
- PR #1, PR #31

Dewmini Navodya (IT23144330):
- 09c58ac: block NoSQL injection and user enumeration in login
- 2525f80: resolve NoSQL injection across all controllers
- a5ba6c3 / bb9b2ab: rate-limit login to stop brute-force attacks
- 905023a: add "Sign in with Google" flow on the frontend
- 1c04fcb: add booking to Google Calendar via incremental authorization
- 7921cbc / 10596a2: suppress post-fix Semgrep false positives with justification
- PR #21, PR #22, PR #23, PR #24, PR #29, PR #30, PR #32

Bosilu Jinajith (IT23212268):
- ef2cffc: fix: prevent stored XSS in attraction descriptions
- d3a6b1b: fix: resolve Semgrep XSS findings
- 4945072: fix: restrict and sanitize image uploads
- 18b9f1d: Update config.js
- PR #26, PR #27, PR #33

Vonara Wijethunge (IT23256750):
- c3e1f1e: chore(test): split app.js/server.js and add Jest + Supertest + mongodb-memory-server
- 13121e9 & 4a7bf2b: test & fix(VULN-03): enforce object-level authorization on user, booking and RFID endpoints
- 1d81e58, abfc92e, a4a2b2d: test & fix(VULN-08): add security headers, harden CORS and prevent clickjacking
- 593affa: ci: add security pipeline (Gitleaks, Semgrep, npm audit, Jest, ZAP baseline)
- 8c466c4, 05e82d0, 1e42c9f: fix(A03): upgrade vulnerable backend/frontend dependencies & enable Dependabot
- fe62ee6, 75dfb79, 111485e: test & fix(A10): register the error handler and stop leaking internal error messages
- PR #2, PR #3, PR #4, PR #5, PR #25


7. LOCAL SETUP AND VERIFICATION
--------------------------------------------------------------------------------
1. Clone: git clone https://github.com/DilinaSasmitha97/go-ceylon-enhanced-security-ssd.git
2. Backend:
   cd GoCeylon-backend
   npm install
   # Configure .env from .env.example
   npm run dev
3. Frontend:
   cd ../GoCeylon-frontend
   npm install
   # Configure .env from .env.example
   npm run dev
4. Run Security Regression Tests:
   cd ../GoCeylon-backend && npm test
================================================================================
