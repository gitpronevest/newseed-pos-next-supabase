# newseed-pos-next-supabase Backend Structure Document

## 1. Backend Architecture

The backend is built on a serverless, modular design that makes it easy to maintain, scale, and deliver fast responses.

- **Next.js App Router & API Routes**: Each API endpoint lives alongside your pages, keeping server-side logic organized in the `app/api/` directory. Next.js deploys these as on-demand serverless functions.
- **Drizzle ORM**: A type-safe layer that maps TypeScript definitions to PostgreSQL tables. This keeps database code predictable and free of low-level SQL bugs.
- **Supabase Services**: Manages authentication, database hosting, and real-time updates, so you don’t have to run your own servers.

How it supports key goals:
- **Scalability**: Serverless functions auto-scale on Vercel. Supabase’s managed Postgres scales as your data grows.
- **Maintainability**: Co-located routes, clear folder structure (`app/`, `db/`, `lib/`, `components/`), and TypeScript everywhere reduce confusion.
- **Performance**: Edge network on Vercel plus caching strategies (Next.js incremental cache, SWR on the client) deliver content quickly worldwide.

## 2. Database Management

We use a relational database approach for reliable, structured data handling.

- Database Technology:
  - PostgreSQL (managed by Supabase)
  - Accessed via Drizzle ORM in TypeScript
- Data Structure & Practices:
  - Tables for users, shifts, categories, products, options, and transactions
  - Foreign key constraints enforce relationships (for example, each transaction ties to a shift)
  - Migrations and version control: Drizzle schema files live under `db/schema/`, making changes traceable
  - Backups & restore: Supabase auto-schedules daily backups with point-in-time recovery

## 3. Database Schema

Below is a high-level, human-readable view of each table, followed by the SQL definitions.

Tables and relationships:
- **users**: Stores the single admin user (email, hashed password)
- **shifts**: Tracks open/close times and totals for each work session
- **product_categories**: Groups products (e.g., "Beverages", "Snacks")
- **option_groups**: Logical collections of add-ons (e.g., "Milk Types")
- **options**: Individual add-ons linked to an option group (e.g., "Almond Milk")
- **products**: Items for sale with price, stock, category, and associated option groups
- **transactions**: Individual sales records linked to a shift and containing totals

SQL definition (PostgreSQL):
```sql
-- users table (single admin)
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- shifts table
CREATE TABLE shifts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  total_amount DECIMAL(10,2) DEFAULT 0
);

-- product_categories table
CREATE TABLE product_categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- option_groups table
CREATE TABLE option_groups (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- options table (add-ons)
CREATE TABLE options (
  id SERIAL PRIMARY KEY,
  group_id INTEGER NOT NULL REFERENCES option_groups(id),
  name TEXT NOT NULL,
  price_adjustment DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- products table
CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  category_id INTEGER REFERENCES product_categories(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  shift_id INTEGER NOT NULL REFERENCES shifts(id),
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## 4. API Design and Endpoints

We follow a RESTful style using Next.js serverless routes. Each resource has standard CRUD operations.

Key endpoints:
- **/api/auth/**
  - POST /login: Verify admin credentials, return JWT
  - POST /logout: Invalidate session
- **/api/shifts/**
  - POST /open: Start a new shift
  - POST /close: End the current shift and calculate totals
  - GET /: Fetch all shifts or the active shift
- **/api/product_categories/**
  - GET /: List categories
  - POST /: Create a new category
  - PUT /[id]: Update a category
  - DELETE /[id]: Remove a category
- **/api/products/**
  - GET /: List products (with optional category filter)
  - POST /: Create a new product
  - PUT /[id]: Update product details
  - DELETE /[id]: Delete a product
- **/api/options/**
  - GET /: List all option groups and options
  - POST /option-groups/: Create new group
  - POST /options/: Create new option
  - PUT/DELETE similar to above
- **/api/transactions/**
  - POST /: Create a new sale, deduct stock, add to shift
  - GET /: List all transactions or filter by shift

Each route uses Drizzle ORM behind the scenes for type-safe queries and clear error handling.

## 5. Hosting Solutions

- **Vercel** (Frontend & API)
  - Automatic deployments from GitHub
  - Global edge network for low-latency responses
  - Serverless functions for API routes that scale on demand
- **Supabase** (Database & Auth)
  - Managed PostgreSQL with daily backups and monitoring
  - Built-in authentication and row-level security if needed

Benefits:
- **Reliability**: Both platforms guarantee high uptime
- **Scalability**: Serverless + managed DB auto-scale with usage
- **Cost-effectiveness**: Generous free tiers, pay-as-you-go pricing

## 6. Infrastructure Components

- **Load Balancer & CDN**: Provided by Vercel’s global edge network
- **Caching**:
  - Next.js ISR (Incremental Static Regeneration) and SWR on the client for API data
  - Service Worker (PWA) caches static assets for offline loading
- **Containerization (Local Dev)**:
  - Docker Compose setup for Next.js app and Supabase emulator ensures parity between local and production
- **Content Delivery**:
  - Static assets (CSS, JS) served from edge cache

Together, these components ensure quick page loads, real-time updates, and offline resilience.

## 7. Security Measures

- **Authentication & Authorization**:
  - Supabase Auth with JWT tokens
  - Single-admin role enforced at the API level
- **Data Encryption**:
  - TLS (HTTPS) in transit
  - Encryption at rest on Supabase managed DB
- **Environment Variables**:
  - Secrets (API keys, DB URLs) stored in Vercel and `.env.local` files
- **Input Validation & Error Handling**:
  - Zod or built-in validation in API routes
  - Clear error messages to the admin without leaking internal details
- **Rate Limiting & Monitoring**:
  - Basic rate limiting on critical endpoints (login, transactions)
  - Alert on abnormal error spikes

## 8. Monitoring and Maintenance

- **Logging & Alerts**:
  - Vercel analytics for serverless functions
  - Supabase dashboard for DB performance metrics and logs
  - Optional Sentry integration for uncaught exceptions
- **Testing Strategy**:
  - Unit tests (Vitest) for business logic
  - Integration tests for API routes
  - End-to-end tests (Playwright) for critical flows (open/close shift, checkout)
- **Maintenance Practices**:
  - Scheduled dependency updates via GitHub Actions
  - Periodic backup checks
  - Schema migration reviews before releases

## 9. Conclusion and Overall Backend Summary

This backend combines the power of Next.js serverless functions, Supabase’s managed Postgres & Auth, and Drizzle ORM’s type-safe data layer. It delivers a reliable, scalable foundation for the Newseed POS v2 project, handling everything from secure admin login and real-time dashboards to robust transaction management and offline support.

Unique strengths:
- End-to-end TypeScript safety
- Modular folder structure for clear ownership of features
- Instant scalability via serverless deployments
- Managed infrastructure (Supabase & Vercel) minimizing ops overhead

With this setup, developers can focus on building business features—like advanced shift analytics or enhanced PWA experiences—without worrying about the underlying backend complexity.