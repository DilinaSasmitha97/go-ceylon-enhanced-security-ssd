# GoCeylon — Enhanced Security & Identity Federation Platform
> **SE4030 – Secure Software Development | Academic Group Assignment**  
> **Sri Lanka Institute of Information Technology (SLIIT)**  
> **Group ID:** Group 97 | **Group Size:** 4 Members | **Marks Allocated:** 25 Marks  
> **Production Branch:** `main` (100% Passing DevSecOps CI/CD Security Pipeline)

---

## 1. Deliverables & Project Metadata

### 1.1 Group Members & Identification
| Member Full Name | Student ID & Email | Contact | Assigned Security Lead Roles & Technical Focus Areas |
| :--- | :---: | :---: | :--- |
| **A. W. Dilina Sasmitha**<br>*(Sasmitha A. W. D.)* | **IT23143418**<br>`it23143418@my.sliit.lk` | 0760817797 | **Authentication Architecture, Cryptographic Hardening & OAuth 2.0 / OIDC Backend Lead**<br>• VULN-01 (Hardcoded Secrets & Credential Isolation)<br>• VULN-02 (Unauthenticated Administrative Account Registration)<br>• Google OAuth 2.0 / OIDC Backend Engine with PKCE & One-Time Code Exchange<br>• Server-Side Weather API Proxy Architecture (`GET /location/weather`) |
| **P. G. Dewmini Navodya**<br>*(Navodya P. G. D.)* | **IT23144330**<br>`it23144330@my.sliit.lk` | 0756451400 | **Login Security, Anti-Brute-Force Rate Limiting & Calendar Integration Lead**<br>• VULN-05 (NoSQL Query Injection & User Enumeration Prevention)<br>• VULN-06 (Authentication Brute-Force & Credential Stuffing Mitigation)<br>• Google OAuth 2.0 Frontend Client Integration ("Sign in with Google")<br>• Google Calendar Itinerary Synchronization (Incremental Authorization) |
| **R. A. Bosilu Jinajith**<br>*(Jinajith R. A. B.)* | **IT23212268**<br>`it23212268@my.sliit.lk` | 0762250479 | **Content Security, Media Upload Pipeline & Attack Chain Modeling Lead**<br>• VULN-04 (Stored Cross-Site Scripting in Attraction Descriptions)<br>• VULN-07 (Unrestricted File Upload & Media Storage Vulnerabilities)<br>• Multer RAM Buffering & Sharp Magic-Byte Binary Image Transcoding<br>• End-to-End Stored XSS-to-Passport Exfiltration Attack Chain Modeling |
| **W. M. Vonara Wijethunge**<br>*(Wijethunge W. M. V.)* | **IT23256750**<br>`it23256750@my.sliit.lk` | 0775671404 | **Access Control, Security Headers, DevSecOps CI/CD Pipeline & Test Lead**<br>• VULN-03 (Insecure Direct Object References / Broken Object Authorization)<br>• VULN-08 (Security Misconfiguration, Security Headers & Clickjacking Prevention)<br>• Bonus Hardening A10 (Centralized Exception Handling & Stack Trace Shielding)<br>• Bonus Hardening A03 (Vulnerable Dependency Remediation & Dependabot)<br>• DevSecOps GitHub Actions Security Pipeline & 45+ Jest Regression Test Suite |

---

### 1.2 Repository & Deliverable Links
- **Original Baseline Project Repositories:**
  - Backend: [https://github.com/bosilu-ranathunga/GoCeylon-backend.git](https://github.com/bosilu-ranathunga/GoCeylon-backend.git)
  - Frontend: [https://github.com/bosilu-ranathunga/GoCeylon-frontend.git](https://github.com/bosilu-ranathunga/GoCeylon-frontend.git)
- **Enhanced Hardened Repository:**
  - Monorepo: [https://github.com/DilinaSasmitha97/go-ceylon-enhanced-security-ssd.git](https://github.com/DilinaSasmitha97/go-ceylon-enhanced-security-ssd.git)
  - Active Hardened Branch: `main`
- **Video Demonstration Link (YouTube):**
  - [https://youtu.be/g6JWj29NZmY](https://youtu.be/g6JWj29NZmY) *(Maximum 20 minutes — Walkthrough of all 8 remediated vulnerabilities, proof-of-concept exploits, dual-layer defenses, and Google OAuth 2.0 / OIDC & Google Calendar feature demonstrations)*
- **Formal Technical Report:**
  - Included as `reports/SE4030_GoCeylon_Security_Report.pdf` within the submission archive.

---

## 2. Project Overview & System Scope

**GoCeylon** is a comprehensive, multi-role tourism and travel management platform designed to connect international travelers with authentic Sri Lankan experiences, licensed tour guides, registered local businesses, and cultural attractions. 

### Multi-Role Architecture
1. **Tourist (Traveler):** Explores curated attractions, views live weather updates, books certified tour guides, purchases RFID transit cards, and syncs travel itineraries directly to Google Calendar.
2. **Tour Guide:** Manages professional profiles, registers spoken languages, sets hourly/daily rates, and accepts bookings.
3. **Business Owner:** Registers local excursions, uploads verified marketing media, and administers tourism hospitality packages.
4. **Platform Administrator:** Verifies RFID smart cards, oversees platform metrics, and manages system accounts.

### Technology Stack
- **Backend Runtime:** Node.js v22 LTS & Express.js REST API
- **Persistence:** MongoDB Atlas (Cloud NoSQL) with Mongoose ODM
- **Frontend SPA:** React 18, Vite tooling, Tailwind CSS, Lucide Icons, Axios
- **Identity & External APIs:** Google Identity Services (OAuth 2.0 / OpenID Connect with PKCE), Google Calendar API v3, Cloudinary API, WeatherAPI.com
- **Testing & Security Tools:** Gitleaks, Semgrep SAST, OWASP ZAP (DAST), Jest, Supertest, `mongodb-memory-server`, Dependabot

---

## 3. Vulnerability Remediation Matrix (8 Core + 2 Bonus Hardening)

Every identified vulnerability was verified via black-box/white-box tooling, patched using defense-in-depth principles, and locked down with automated regression tests.

| Vuln ID | Vulnerability Title | OWASP Top 10 | MITRE CWE | Initial CVSS | Hardened CVSS | Lead Owner | Verification Tool |
| :---: | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **VULN-01** | Hardcoded Secrets & Cloud Credential Leakage | A02: Cryptographic Failures | CWE-798, CWE-321 | **9.8 (Critical)** | **0.0 (None)** | A. W. Dilina Sasmitha | Gitleaks AST Scanner |
| **VULN-02** | Unauthenticated Administrative Account Registration | A01: Broken Access Control | CWE-306, CWE-269 | **9.8 (Critical)** | **0.0 (None)** | A. W. Dilina Sasmitha | OWASP ZAP Requester |
| **VULN-03** | Insecure Direct Object References (IDOR) & Broken Object Authorization | A01: Broken Access Control | CWE-639, CWE-284 | **8.8 (High)** | **0.0 (None)** | Vonara Wijethunge | Jest Integration Suite |
| **VULN-04** | Stored Cross-Site Scripting (XSS) in Attraction Descriptions | A03: Injection | CWE-79 | **7.6 (High)** | **0.0 (None)** | R. A. Bosilu Jinajith | Semgrep SAST & ZAP |
| **VULN-05** | NoSQL Query Injection & User Account Enumeration | A03: Injection | CWE-943, CWE-204 | **8.6 (High)** | **0.0 (None)** | Dewmini Navodya Gamage | Semgrep & Jest Suite |
| **VULN-06** | Authentication Brute-Force & Credential Stuffing | A07: Identification & Auth Failures | CWE-307 | **7.5 (High)** | **0.0 (None)** | Dewmini Navodya Gamage | OWASP ZAP Fuzzer |
| **VULN-07** | Unrestricted File Upload & Media Storage Vulnerabilities | A04: Insecure Design | CWE-434 | **9.1 (Critical)** | **0.0 (None)** | R. A. Bosilu Jinajith | Jest Integration Suite |
| **VULN-08** | Security Misconfiguration, Insecure CORS & Missing Security Headers | A05: Security Misconfiguration | CWE-1021, CWE-942 | **6.5 (Medium)** | **0.0 (None)** | Vonara Wijethunge | OWASP ZAP Baseline |
| **Bonus A10** | Centralized Error Handling & Stack Trace Leaks | A10: Exceptional Conditions | CWE-209, CWE-550 | **5.3 (Medium)** | **0.0 (None)** | Vonara Wijethunge | Jest Integration Suite |
| **Bonus A03** | Vulnerable Third-Party Dependencies & Dependabot Automation | A03: Vulnerable Components | CWE-1395 | **8.2 (High)** | **0.0 (None)** | Vonara Wijethunge | `npm audit` & Dependabot |

---

## 4. Technical Summary of Vulnerabilities and Dual-Track Remediations

### VULN-01: Hardcoded Secrets & Cloud Credential Leakage
- **Root Cause:** Plaintext MongoDB Atlas URI with administrative credentials committed in `app.js`, static JWT secret `'your_secret_key'` in `authController.js`, and third-party WeatherAPI key embedded in client React code.
- **Remediation:** 
  1. Complete environment isolation via `dotenv` and untracked `.env` files.
  2. Generated a 256-bit cryptographically secure pseudorandom JWT secret (`crypto.randomBytes(32).toString('hex')`).
  3. Engineered a server-side weather proxy endpoint (`GET /location/weather`) in `LocationControllers.js` to eliminate client-side key exposure.
- **Verification:** Gitleaks pre-commit hooks and CI scan confirm 0 secrets detected.

### VULN-02: Unauthenticated Administrative Account Registration
- **Root Cause:** `POST /admin/register` lacked any authorization check, allowing arbitrary public users to create administrative accounts with full platform privileges.
- **Remediation:** Attached role-based access control middleware `authMiddleware(['admin'])` to `adminRoutes.js`. Only authenticated platform administrators can create subsequent admin accounts.
- **Verification:** OWASP ZAP confirms unauthenticated registration attempts return `401 Unauthorized`.

### VULN-03: Insecure Direct Object References (IDOR) & Broken Object Authorization
- **Root Cause:** Endpoints accepting record IDs (`/users/:id`, `/booking/:id`, `/rfid/:id`) allowed any authenticated user to view, edit, or delete arbitrary user records, tourist passport numbers, and RFID balances simply by mutating URL parameters.
- **Remediation:** 
  1. Created `ownershipMiddleware.js` enforcing `requireSelfOrAdmin`, `requireBookingAccess`, and `requireBusinessOwnerOrAdmin`.
  2. Restricted `GET /users` exclusively to administrators and projected out password hashes from all queries (`.select('-password')`).
  3. Enforced server-side JWT identity binding for booking creations (`req.user.id`).
- **Verification:** 18 dedicated Jest regression tests verify cross-tenant access returns `403 Forbidden`.

### VULN-04: Stored Cross-Site Scripting (XSS) in Attraction Descriptions
- **Root Cause:** Unsanitized rich-text HTML descriptions entered in `AddLocation.jsx` were persisted directly to MongoDB and rendered in `AttractionsInfo.jsx` via raw HTML injection, enabling persistent session hijacking.
- **Remediation:** 
  1. Implemented server-side HTML sanitization in `sanitizeRichText.js` using `sanitize-html` to strip dangerous elements (`<script>`, `<iframe>`, event handlers) on write.
  2. Added client-side defense-in-depth sanitization via `DOMPurify.sanitize()` prior to rendering.
- **Verification:** Semgrep AST scanner and browser exploit payloads confirm script execution is completely neutralized.

### VULN-05: NoSQL Query Injection & User Account Enumeration
- **Root Cause:** Login inputs were passed unvalidated to Mongoose query selectors (`User.findOne({ email })`), permitting MongoDB operator injection (`{"$gt": ""}`). Additionally, distinct error messages ("User not found" vs. "Invalid password") enabled user enumeration.
- **Remediation:** 
  1. Integrated `express-mongo-sanitize` globally to strip `$` and `.` characters from request payloads.
  2. Enforced strict primitive string type checking on email and password fields.
  3. Standardized all authentication failure responses to a generic `"Invalid email or password"`.
- **Verification:** Automated unit tests and Semgrep rule validations confirm injection neutralization.

### VULN-06: Authentication Brute-Force & Credential Stuffing
- **Root Cause:** The `/api/auth/login` endpoint had no rate limits, allowing automated dictionary attacks and password spraying.
- **Remediation:** 
  1. Configured `express-rate-limit` on the login route (maximum 5 attempts per 15-minute window per IP).
  2. Implemented global API rate limiting (100 requests per 15 minutes) and RFC-compliant `RateLimit-*` headers.
- **Verification:** OWASP ZAP Fuzzer confirms requests exceeding the quota are blocked with `HTTP 429 Too Many Requests`.

### VULN-07: Unrestricted File Upload & Media Storage Vulnerabilities
- **Root Cause:** File upload routes used local disk storage without file type or content validation, allowing attackers to upload executable scripts (e.g., webshells) or oversized files causing denial of service.
- **Remediation:** 
  1. Converted upload handling to in-memory buffering using `multer.memoryStorage()`.
  2. Enforced magic-byte binary inspection and transcoding using the `sharp` library to decode and re-encode images into sanitized WebP/JPEG formats.
  3. Streamed transcoded buffers directly to Cloudinary cloud storage, never writing raw user data to the server disk.
  4. Enforced strict size limits (5MB per file, max 5 files).
- **Verification:** Jest test suite verifies rejection of malicious non-image files and mime-spoofed binaries.

### VULN-08: Security Misconfiguration, Insecure CORS & Missing Security Headers
- **Root Cause:** API responses lacked essential security headers (CSP, X-Frame-Options, HSTS), allowing clickjacking, MIME-sniffing, and cross-origin abuse. CORS allowed wildcard origins (`*`).
- **Remediation:** 
  1. Configured `helmet` with strict directives: `Content-Security-Policy: frame-ancestors 'none'`, `X-Frame-Options: DENY`, `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`.
  2. Restricted CORS in `corsMiddleware.js` to explicitly whitelisted origin domains defined in `process.env.FRONTEND_URL`.
  3. Configured Vite dev server proxy to send matching security headers.
- **Verification:** OWASP ZAP baseline scan and Jest tests confirm header presence and rejection of unauthorized origins.

### Bonus A10: Centralized Exception Handling & Stack Trace Leaks
- **Remediation:** Replaced default unhandled error responses with a centralized `errorHandler.js` and custom `ErrorResponse` class. In production mode, internal stack traces and database cast errors are suppressed, returning clean, uniform error payloads.

### Bonus A03: Vulnerable Third-Party Dependencies
- **Remediation:** Executed `npm audit fix` across both backend and frontend repositories, upgrading vulnerable packages (such as `axios`, `express`, `mongoose`, `vite`). Configured GitHub Dependabot for continuous automated security patching.

---

## 5. OAuth 2.0 & OpenID Connect (OIDC) Implementation

GoCeylon integrates enterprise-grade federated identity using **Google OAuth 2.0 and OpenID Connect (OIDC)**, compliant with **RFC 7636 (PKCE)** and **RFC 6749**.

```
+---------------------------------------------------------------------------------------------------+
|                                GOOGLE OAUTH 2.0 PKCE & OIDC FLOW                                  |
+---------------------------------------------------------------------------------------------------+
[ Browser ]                  [ GoCeylon Backend ]                 [ Google Identity Provider ]
     |                                |                                        |
     | 1. GET /api/auth/google        |                                        |
     |------------------------------->| (Generates code_verifier,              |
     |                                |  code_challenge = SHA256(verifier),    |
     |                                |  state, and nonce stored in cookies)   |
     | 2. Redirect to Google Consent  |                                        |
     |<-------------------------------|                                        |
     |                                                                         |
     | 3. User authenticates & grants consent                                  |
     |------------------------------------------------------------------------>|
     |                                                                         |
     | 4. Redirects to /api/auth/google/callback?code=AUTH_CODE&state=STATE    |
     |<------------------------------------------------------------------------|
     |                                                                         |
     | 5. Forward callback with cookies to backend                             |
     |------------------------------->|                                        |
     |                                | 6. Validates state cookie (Anti-CSRF)  |
     |                                |    POST /token with code & verifier    |
     |                                |--------------------------------------->|
     |                                |                                        |
     |                                | 7. Returns access_token & id_token     |
     |                                |<---------------------------------------|
     |                                |                                        |
     |                                | 8. Verifies ID token signature         |
     |                                |    Generates single-use OTC (5 min ttl)|
     | 9. Redirects to /auth/callback?code=OTC                                 |
     |<-------------------------------|                                        |
     |                                |                                        |
     | 10. POST /api/auth/google/exchange { code: OTC }                       |
     |------------------------------->|                                        |
     |                                | 11. Validates & burns OTC (Single-use) |
     |                                |     Issues signed GoCeylon JWT         |
     | 12. Returns JWT & User Profile |                                        |
     |<-------------------------------|                                        |
```

### Key Security Safeguards
1. **Proof Key for Code Exchange (PKCE - RFC 7636):** Protects against authorization code interception attacks by requiring dynamic SHA-256 hashed code challenges.
2. **State & Nonce Validation:** Cryptographically generated random bytes prevent Login CSRF attacks and token replay attempts.
3. **Single-Use One-Time Code (OTC) Exchange:** Instead of passing the GoCeylon session JWT via redirect URLs (which risks leakage in browser history and HTTP referrers), the backend returns a short-lived (5-minute) single-use authorization code that the frontend immediately exchanges via a secure `POST` request.
4. **Google Calendar Itinerary Synchronization (Incremental Authorization):** Tourists booking verified tour packages can optionally grant incremental calendar permissions (`https://www.googleapis.com/auth/calendar.events`), automatically adding confirmed tour bookings with live timestamps and guide details to their Google Calendar.

---

## 6. Member-by-Member Contribution & Git Commit Audit

Every group member's direct code contributions are verifiable via merged pull requests and commits on the `main` branch:

### 6.1 A. W. Dilina Sasmitha (IT23143418)
- **Role:** Authentication Architecture, Cryptographic Key Management & Google OAuth 2.0 / OIDC Backend Lead
- **Key Commits on `main`:**
  - `1600365` — `fix(VULN-01): eliminate hardcoded secrets and default JWT secret` (Externalized DB credentials, generated 256-bit secret)
  - `2ba89fc` — `fix(VULN-02): restrict admin registration to authenticated administrators` (Attached RBAC middleware to `/admin/register`)
  - `4e8504a` — `feat(auth): implement Google OAuth 2.0 PKCE backend with one-time code exchange` (Engineered `oauthController.js`)
  - `0976280` — `fix(VULN-01): proxy weather API via backend to eliminate frontend hardcoded secret` (Implemented `GET /location/weather`)
  - `8c2debb` & `5136031` — Merged Pull Requests #1 and #31 for secret isolation and weather proxy

### 6.2 Dewmini Navodya Gamage (IT23144330)
- **Role:** Login Security, Anti-Brute-Force Rate Limiting, OAuth Frontend & Calendar Integration Lead
- **Key Commits on `main`:**
  - `09c58ac` & `2525f80` — `block NoSQL injection and user enumeration in login` / `resolve NoSQL injection across all controllers` (`express-mongo-sanitize` & generic errors)
  - `a5ba6c3` & `bb9b2ab` — `rate-limit login to stop brute-force attacks` (Implemented `express-rate-limit` returning HTTP 429)
  - `905023a` — `add "Sign in with Google" flow on the frontend` (OAuth UI and `AuthCallback.jsx` exchange handler)
  - `1c04fcb` — `add booking to Google Calendar via incremental authorization` (Integrated `calendarController.js`)
  - `7921cbc` & `10596a2` — Semgrep rule optimizations and false-positive suppression with justification
  - `2750e58`, `18ccd20`, `909f772`, `eba19de`, `2e9b96f`, `c9155e4` — Merged Pull Requests #21, #22, #23, #24, #29, #30

### 6.3 R. A. Bosilu Jinajith (IT23212268)
- **Role:** Content Security (Stored XSS), Media Upload Security & Attack Chain Threat Modeling Lead
- **Key Commits on `main`:**
  - `ef2cffc` — `fix: prevent stored XSS in attraction descriptions` (Engineered `sanitizeRichText.js` with `sanitize-html` and client-side DOMPurify)
  - `d3a6b1b` — `fix: resolve Semgrep XSS findings` (Sanitization tuning across all location rendering components)
  - `4945072` — `fix: restrict and sanitize image uploads` (Multer memory storage, Sharp image decoding/transcoding, Cloudinary streaming)
  - `18b9f1d` — `Update config.js` (Media service configuration hardening)
  - `c70c5ef`, `0db6441`, `33b9d6a` — Merged Pull Requests #26, #27, and #33

### 6.4 Vonara Wijethunge (IT23256750)
- **Role:** Object-Level Access Control (IDOR), Security Headers, DevSecOps CI/CD Pipeline & Test Lead
- **Key Commits on `main`:**
  - `c3e1f1e` — `chore(test): split app.js/server.js and add Jest + Supertest + mongodb-memory-server`
  - `13121e9` & `4a7bf2b` — `test(VULN-03)` / `fix(VULN-03): enforce object-level authorization on user, booking and RFID endpoints` (`ownershipMiddleware.js`)
  - `1d81e58`, `abfc92e`, `a4a2b2d` — `test(VULN-08)` / `fix(VULN-08): add security headers, harden CORS and prevent clickjacking`
  - `593affa` — `ci: add security pipeline (Gitleaks, Semgrep, npm audit, Jest, ZAP baseline)`
  - `8c466c4`, `05e82d0`, `1e42c9f` — `fix(A03): upgrade vulnerable dependencies & enable Dependabot`
  - `fe62ee6`, `75dfb79`, `111485e` — `test(A10)` / `fix(A10): register the error handler and stop leaking internal error messages`
  - `f4ed601`, `b2766b0`, `fc20445`, `89b8323`, `c9d8375` — Merged Pull Requests #2, #3, #4, #5, #25

---

## 7. Automated DevSecOps CI/CD Pipeline

The repository integrates a comprehensive DevSecOps pipeline defined in [`.github/workflows/security.yml`](.github/workflows/security.yml), running automatically on every push and pull request to `main`:

```
+-------------------------------------------------------------------------+
|                  DEVSECOPS CONTINUOUS SECURITY PIPELINE                 |
+-------------------------------------------------------------------------+
  |-- [ Job 1: Secrets Scan ]
  |     └── Gitleaks v8.21.2: Scans all commits for embedded keys/credentials
  |
  |-- [ Job 2: Static Application Security Testing (SAST) ]
  |     └── Semgrep v1.178.0: Rulesets for OWASP Top 10, XSS, Node.js, Secrets
  |
  |-- [ Job 3: Software Composition Analysis (SCA) ]
  |     └── npm audit: Verifies 0 high/critical CVEs across frontend & backend
  |
  |-- [ Job 4: Automated Security Regression Tests ]
  |     └── Jest & Supertest: 45+ integration tests on mongodb-memory-server
  |
  |-- [ Job 5: Dynamic Application Security Testing (DAST) ]
        └── OWASP ZAP Baseline Scan: Automated dynamic scan against running API
```

---

## 8. Local Setup & Execution Guide

### 8.1 Prerequisites
- **Node.js:** v22.x LTS or higher
- **npm:** v10.x or higher
- **MongoDB:** Active MongoDB Atlas URI or local MongoDB instance (port 27017)
- **Git**

### 8.2 Installation & Environment Configuration

#### 1. Clone the Hardened Repository
```bash
git clone https://github.com/DilinaSasmitha97/go-ceylon-enhanced-security-ssd.git
cd go-ceylon-enhanced-security-ssd
```

#### 2. Backend Setup
```bash
cd GoCeylon-backend
npm install
```
Create a `.env` file in `GoCeylon-backend/` based on `.env.example`:
```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_cryptographically_secure_256bit_hex_secret
COOKIE_SECRET=your_secure_cookie_session_secret
FRONTEND_URL=http://localhost:5173
WEATHER_API_KEY=your_weatherapi_key
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URI=http://localhost:3000/api/auth/google/callback
```

#### 3. Frontend Setup
```bash
cd ../GoCeylon-frontend
npm install
```
Create a `.env` file in `GoCeylon-frontend/`:
```env
VITE_API_URL=http://localhost:3000
VITE_GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
```

### 8.3 Running the Application
- **Start Backend:**
  ```bash
  cd GoCeylon-backend
  npm run dev
  # Server starts on http://localhost:3000
  ```
- **Start Frontend:**
  ```bash
  cd GoCeylon-frontend
  npm run dev
  # Client starts on http://localhost:5173
  ```

### 8.4 Running Security Tests & Verification Tools
- **Execute Jest Security Regression Test Suite:**
  ```bash
  cd GoCeylon-backend
  npm test
  ```
- **Run Secret Detection (Gitleaks):**
  ```bash
  gitleaks detect --source="." --verbose
  ```
- **Run Static Analysis (Semgrep):**
  ```bash
  semgrep scan --config p/owasp-top-ten --config .semgrep/
  ```
- **Run Dependency Audit:**
  ```bash
  cd GoCeylon-backend && npm audit --audit-level=high
  cd ../GoCeylon-frontend && npm audit --audit-level=high
  ```

---

## 9. Academic Declaration & Integrity Statement

We hereby certify that the security auditing, vulnerability remediation, identity federation architecture, and automated DevSecOps implementation presented in this repository represents the original collaborative work of the undersigned students, completed under the academic curriculum of module **SE4030 – Secure Software Development**. All external libraries, references, and frameworks utilized have been properly acknowledged and cited.

- **A. W. Dilina Sasmitha** (IT23143418)
- **Dewmini Navodya Gamage** (IT23144330)
- **R. A. Bosilu Jinajith** (IT23212268)
- **Vonara Wijethunge** (IT23256750)
