# Project Requirements Document (PRD)

## 1. Project Overview

Newseed POS v2 is a modern, full-stack Point of Sale (POS) system built on top of a ready-made starter template (`newseed-pos-next-supabase`). It gives a single admin user a secure login, real-time shift management, product catalog management, and a responsive checkout interface. The codebase uses Next.js, TypeScript, Supabase, Drizzle ORM, Tailwind CSS, and shadcn/ui to deliver a fast, reliable foundation so your team can focus on business features instead of boilerplate setup.

We’re building this to accelerate development of Newseed POS v2 and ensure production-grade quality from day one. Key objectives include:
- Secure admin authentication with Supabase Auth.
- An "Open/Close Shift" dashboard that shows live sales stats.
- Full CRUD (Create-Read-Update-Delete) for products, categories, and option groups.
- A mobile-first POS interface with cart, payment dialog, and receipt generation.
- Basic Progressive Web App (PWA) features and offline transaction queuing.

Success will be measured by a working v1 prototype where the admin can log in, manage their catalog, open/close shifts, process transactions, and view sales—all on desktop or mobile—within a Dockerized development environment.

## 2. In-Scope vs. Out-of-Scope

**In-Scope (v1)**
- Admin authentication using Supabase Auth (email/password).
- Shift management dashboard with "Open Shift" and "Close Shift" buttons.
- Real-time statistics display (charts and tables) for the active shift.
- CRUD pages for Product Categories, Option Groups, and Products.
- POS interface under `/app/dashboard/pos` with:
  - Category tabs to filter products.
  - Shopping cart component with quantity and add-on selection.
  - Payment dialog (modal) and transaction endpoint.
  - Receipt view or print dialog.
- Drizzle ORM schemas and migrations for PostgreSQL (via Supabase).
- Responsive, mobile-first UI using Tailwind CSS and shadcn/ui components.
- Basic PWA setup (service worker registration, manifest file).
- Dockerized local environment, deployment scaffolding for Vercel.

**Out-of-Scope (v1)**
- Multi-user roles and permissions beyond a single admin.
- Integration with external payment gateways (e.g., Stripe) beyond a mock or basic flow.
- Advanced analytics or reporting beyond shift history.
- Hardware integrations (barcode scanners, receipt printers).
- Full offline conflict resolution (only basic queuing).
- Multi-language support or deep localization.

## 3. User Flow

When an admin arrives, they land on the sign-in page. After entering their email and password, Supabase Auth verifies credentials. Once logged in, the admin sees the main dashboard layout: a sidebar for navigation (Shifts, POS, Products, Categories, Options, Reports) and a top header with logout and theme toggle. On the Shifts page, they can open a new shift, see live sales totals and transaction count in real time, then close the shift to finalize totals.

To manage the catalog, the admin clicks "Products" or "Categories" in the sidebar. They see a data table listing existing items with buttons to add, edit, or delete entries via a modal form. When ready to sell, they switch to the POS page. Products load in a grid filtered by category tabs; tapping a product adds it to the cart pane (on desktop) or opens a slide-up sheet (on mobile). The admin adjusts quantities or options, taps "Pay," completes the purchase in a dialog, and views/prints the receipt. All transactions are saved to the current shift and can be reviewed later in the "Reports" section.

## 4. Core Features

- **Authentication & Session Management**: Secure admin sign-in/out with Supabase.
- **Shift Management**: Open/close shift buttons, current shift status, live stats (sales total, transaction count).
- **Dashboard Charts & Tables**: Real-time data visualization for shifts and overall sales.
- **Product Catalog**: CRUD pages for Product Categories, Products, and Option Groups using shadcn/ui `Table`, `Dialog`, `Form`.
- **POS Interface**: Responsive three-column layout (categories, product grid, cart), mobile slide-up cart (using `Sheet`).
- **Shopping Cart Logic**: Add/remove items, select add-ons, calculate totals.
- **Payment Flow**: Modal dialog to confirm payment, trigger API route, record transaction, decrement stock.
- **Receipt Generation**: Render printable receipt view after transaction.
- **Database Layer**: Drizzle ORM schemas for `shifts`, `products`, `categories`, `options`, `transactions`.
- **Theming**: Dark/light mode toggle.
- **PWA & Offline**: Basic service worker, manifest, queue transactions in IndexedDB when offline.
- **Containerization & Deployment**: Docker Compose for local dev, Vercel deployment boilerplate.

## 5. Tech Stack & Tools

- **Frontend**
  - Next.js (App Router)
  - React 19
  - TypeScript
  - Tailwind CSS
  - shadcn/ui (prebuilt accessible components)
- **Backend & Data**
  - Next.js API Routes
  - Supabase Auth (email/password)
  - Supabase PostgreSQL
  - Drizzle ORM (TypeScript-first ORM)
- **PWA & Offline**
  - Service Worker (Workbox or manual)
  - IndexedDB for offline queuing
- **Dev & Deployment**
  - Docker & Docker Compose
  - Vercel (production hosting)
- **Testing (future)**
  - Vitest or Jest for unit tests
  - Playwright or Cypress for E2E tests

## 6. Non-Functional Requirements

- **Performance**: 
  - Initial page load under 2 seconds (cold start).
  - API responses under 200 ms.
  - Real-time updates reflect within 1 second.
- **Security**: 
  - HTTPS only in production.
  - Protect API routes via session checks.
  - Secure storage of env vars (`.env.local`).
  - OWASP Top 10 guidance for web apps.
- **Usability & Accessibility**:
  - WCAG 2.1 AA compliance for key flows.
  - Responsive breakpoints for desktop, tablet, and mobile.
- **Compliance**:
  - GDPR-ready (no personal data beyond admin email).
- **Reliability**:
  - Service worker correctly caches static assets.
  - Offline queue persistence across reloads.

## 7. Constraints & Assumptions

- Supabase project and credentials are available.
- Only one admin user role is required for v1.
- Next.js App Router and TypeScript v5+ are used.
- Developers will run via Docker Compose (Postgres + app).
- Network may drop; offline queuing should simply store and retry.
- No external payment gateway integration in v1.

## 8. Known Issues & Potential Pitfalls

- **API Rate Limits**: Supabase may throttle heavy traffic—use exponential backoff or batching.
- **Offline Sync Complexity**: Queued transactions might conflict if shifts close offline—limit offline to active shift only.
- **Drizzle Migrations**: Schema changes require manual migration scripts—document versioning carefully.
- **Service Worker Scope**: Misconfigured scope may break navigation—test PWA routes thoroughly.
- **State Management**: Cart logic can get complex—consider a lightweight store (Zustand) if React state grows unwieldy.

---

This PRD lays out a clear, detailed roadmap for an AI or development team to implement Newseed POS v2 with no missing info. All subsequent technical docs can reference these sections for APIs, UI guidelines, and deployment steps.