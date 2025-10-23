# newseed-pos-next-supabase Security Guidelines

This document defines security best practices for the **newseed-pos-next-supabase** repository. It aligns with Security by Design principles and covers authentication, data protection, API hardening, infrastructure, and more.

---

## 1. Authentication & Access Control

- **Supabase Auth Integration**
  - Use Supabase’s email/password provider with secure password policies (minimum 12 characters, mixed case, symbols).
  - Enforce MFA (TOTP or SMS) for the single Admin user.
  - Store passwords with Argon2 or bcrypt; rely on Supabase’s built-in hashing.
- **Session Management**
  - Enable HttpOnly, Secure, and SameSite=Strict cookies for session tokens.
  - Set both idle (e.g., 15 min) and absolute (e.g., 8 h) timeouts.
  - Rotate session identifiers on privilege elevation (e.g., login).
- **Role-Based Access Control (RBAC)**
  - Define an Admin role in Supabase with minimal permissions.
  - Use row-level security (RLS) policies in Supabase to restrict CRUD operations on each table.
  - Validate authorization server-side on every API route and page request.

## 2. Input Handling & Output Encoding

- **Server-Side Validation**
  - Use Zod or Yup schemas in Next.js API routes to validate request bodies, query parameters, and headers.
  - Reject or sanitize any unexpected fields.
- **Prevent Injection**
  - Use Drizzle ORM’s parameterized queries for all database interactions.
  - Never concatenate user input into raw SQL or dynamic imports.
- **Cross-Site Scripting (XSS) Protection**
  - Encode all user-supplied data before rendering in React (default React escapes by design).
  - For any HTML injection (e.g., WYSIWYG), sanitize with a vetted library like DOMPurify.
- **Safe Redirects**
  - Maintain an allow-list of internal Next.js routes. Reject redirect URLs not on the list.

## 3. Data Protection & Privacy

- **Encryption In Transit**
  - Enforce HTTPS/TLS 1.2+ for all external and internal communications (Next.js, Supabase, API calls).
- **Encryption At Rest**
  - Rely on Supabase’s built-in disk encryption for the PostgreSQL database.
  - Use S3 or another object store with server-side encryption for any file uploads.
- **Secrets Management**
  - Store Supabase API keys and service secrets only in environment variables or a secrets manager (e.g., AWS Secrets Manager, Vercel Environment Variables).
  - Do **not** commit `.env.local` or any secret to source control.
- **Data Minimization & Masking**
  - Return only the fields required by the frontend (avoid exposing internal IDs or metadata).
  - Mask sensitive fields (e.g., payment tokens, customer PII) in API responses and logs.

## 4. API & Service Security

- **Rate Limiting & Throttling**
  - Implement server-side rate limits on critical API routes (e.g., login, transaction creation) using a middleware (e.g., `express-rate-limit`, or a hosted rate-limit service).
- **CORS Configuration**
  - Restrict `Access-Control-Allow-Origin` to the official frontend domain(s).
  - Allow only necessary HTTP methods (GET, POST, PUT, DELETE).
- **API Versioning**
  - Namespace routes under `/api/v1/...` to support future changes without breaking existing clients.
- **Error Handling**
  - Do not leak stack traces or internal errors to clients. Return generic error messages and log the full details server-side.

## 5. Web Application Security Hygiene

- **CSRF Protection**
  - For any state-changing requests that use cookies, implement CSRF tokens (e.g., NextAuth or custom synchronizer token).
- **Security Headers**
  - Add the following headers in Next.js `next.config.js` or a custom server:
    - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
    - `X-Content-Type-Options: nosniff`
    - `X-Frame-Options: DENY`
    - `Referrer-Policy: strict-origin-when-cross-origin`
    - `Content-Security-Policy: frame-ancestors 'none'; default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline';`
- **Secure Cookies**
  - Set `HttpOnly`, `Secure`, and `SameSite=Strict` on all session and refresh tokens.
- **Client Storage**
  - Avoid storing tokens or sensitive data in `localStorage` or `sessionStorage`. Use cookies instead.
- **Subresource Integrity (SRI)**
  - Add SRI attributes for any external scripts or styles fetched from CDNs.

## 6. Infrastructure & Deployment Security

- **Docker Hardening**
  - Use minimal base images (e.g., `node:alpine`).
  - Run application as a non-root user inside the container.
  - Scan images for known vulnerabilities with tools like Trivy.
- **CI/CD Pipeline Security**
  - Store credentials and environment variables in the CI provider’s secret store.
  - Run SCA scans on dependencies (e.g., GitHub Dependabot, npm audit) on every PR.
  - Integrate automated static analysis (linting, SAST) as pre-merge checks.
- **Vercel Deployment**
  - Restrict deployments to branches protected by required status checks.
  - Enable preview environment secrets separate from production secrets.
- **Secrets in Environment**
  - Use Vercel Environment Variables or a dedicated secrets manager. Rotate keys periodically.

## 7. Dependency Management

- **Lockfiles**
  - Commit `package-lock.json` or `yarn.lock` to ensure reproducible builds.
- **Vulnerability Scanning**
  - Integrate automated SCA tools (e.g., Snyk, GitHub Dependabot) to catch CVEs in dependencies, including Drizzle ORM, Next.js, React, Tailwind, and shadcn/ui.
- **Minimal Footprint**
  - Audit dependencies regularly and remove unused packages to reduce the attack surface.

## 8. Testing, Monitoring & Incident Response

- **Automated Testing**
  - Unit tests for business logic and security functions (e.g., password hashing, RBAC checks).
  - Integration tests for API routes, including authentication flows and RLS policies.
  - E2E tests (Playwright or Cypress) to simulate full POS workflows (open/close shift, transactions).
- **Logging & Monitoring**
  - Centralize logs (e.g., Datadog, Logflare) and monitor for anomalies (failed logins, high error rates).
  - Implement alerting for security events (multiple failed logins, suspicious API traffic).
- **Incident Response**
  - Define an incident response plan: identify, contain, eradicate, recover, and post-mortem.
  - Maintain a security contact list and communicate with stakeholders in case of a breach.

---

By adhering to these guidelines, **newseed-pos-next-supabase** will be designed and deployed with robust, defense-in-depth measures to protect both the application and its data.