# Frontend Guidelines Document

This document outlines the frontend architecture, design principles, styling approach, component structure, state management, routing, performance optimizations, testing strategies, and overall summary for the **newseed-pos-next-supabase** project. It’s intended to provide a clear, everyday-language guide so that anyone—technical or not—can understand how the frontend is built and maintained.

## 1. Frontend Architecture

### 1.1 Overall Structure
- **Next.js (App Router)**: The backbone framework offering file-based routing, server components for fast first loads, and client components for interactivity. API routes live alongside pages for seamless backend integration.  
- **React 19**: Powers the user interface, letting us build reusable, dynamic components.  
- **TypeScript**: Enforces type safety from components to API routes, reducing runtime errors and improving developer experience.  
- **Tailwind CSS**: Utility-first styling ensures consistency, speeds up UI creation, and supports custom breakpoints for a mobile-first approach.  
- **shadcn/ui**: A library of accessible, themeable React components (Table, Dialog, Button, etc.) that integrate seamlessly with Tailwind.  

### 1.2 Scalability, Maintainability & Performance
- **Scalability**: File-based routing and modular component folders mean new features map neatly to new pages and components.  
- **Maintainability**: TypeScript plus Drizzle ORM schemas keep data models and API contracts in sync. Component-based design isolates UI logic, making updates localized.  
- **Performance**: Next.js automatic code splitting per page, server-side rendering for initial load, and client-side hydration balance speed and interactivity. Lazy loading and optimized assets enhance real-world performance.

## 2. Design Principles

### 2.1 Usability
- **Intuitive Flows**: Common POS actions (open/close shift, add items, pay) are one or two clicks away.  
- **Clear Feedback**: Modals, toasts, and disabled states inform the user of progress and outcomes.

### 2.2 Accessibility
- **Semantic HTML & ARIA**: All custom components use proper roles (buttons, dialogs) and ARIA labels.  
- **Keyboard Navigation**: Tab order and focus states are tested to ensure full keyboard support.  
- **Contrast & Vision**: Color palette meets WCAG AA for normal text and UI elements.

### 2.3 Responsiveness
- **Mobile-First**: Breakpoints prioritize small screens. The sidebar collapses into a mobile menu; the cart appears as a bottom sheet.  
- **Fluid Layouts**: Flexbox and CSS grid utilities adapt layouts across phones, tablets, and desktops.

## 3. Styling and Theming

### 3.1 Styling Approach
- **Utility-First (Tailwind CSS)**: No global CSS; use utility classes for spacing, color, typography, and layout.  
- **Component-Level Styling**: For highly custom UI (like a receipt printout), scoped CSS modules or inline Tailwind classes keep styles co-located.

### 3.2 Theming
- **Dark/Light Mode**: Controlled via a `ThemeProvider` that toggles a `dark` class on the root. Tailwind’s `dark:` variants adjust colors.  
- **CSS Variables**: Define primary, secondary, and neutral colors in `:root` for quick overrides and consistent theming.

### 3.3 Visual Style
- **Modern Flat Design** with subtle glassmorphism on modals and side panels (slight backdrop blur). Clean edges, generous whitespace, and clear iconography.

### 3.4 Color Palette
| Role            | Light Mode       | Dark Mode        |
|-----------------|------------------|------------------|
| Primary         | #4F46E5 (indigo) | #6366F1 (indigo) |
| Secondary       | #10B981 (emerald)| #34D399 (emerald)|
| Accent          | #F59E0B (amber)  | #FBBF24 (amber)  |
| Neutral Light   | #F3F4F6 (gray)   | #1F2937 (gray)   |
| Neutral Medium  | #9CA3AF (gray)   | #4B5563 (gray)   |
| Success         | #16A34A (green)  | #22C55E (green)  |
| Warning         | #D97706 (amber)  | #F59E0B (amber)  |
| Error           | #DC2626 (red)    | #EF4444 (red)    |

### 3.5 Typography
- **Font Family**: Inter, sans-serif (system-fallback).  
- **Sizes & Weights**: Use Tailwind text sizes (`text-sm`, `text-lg`) and font weights (`font-medium`, `font-semibold`) for hierarchy.

## 4. Component Structure

### 4.1 Organization
- **`app/` Directory**: Page and layout files for each route.  
- **`components/` Directory**:  
  • `ui/`—All shadcn/ui wrappers and design-system pieces.  
  • `pos/`—POS-specific components (ProductGrid, ShoppingCart, PaymentModal, Receipt).  
  • `common/`—SiteHeader, AppSidebar, ThemeToggle, etc.

### 4.2 Reusability & Composition
- **Atomic Components**: Buttons, inputs, dialogs built once and reused.  
- **Composite Components**: Tables, forms, and grids assembled from atomic parts.  
- **Benefits**: New screens (Products, Categories, Reports) share the same building blocks, ensuring consistency and reducing duplication.

## 5. State Management

### 5.1 Local Component State
- **React `useState` and `useReducer`** for form inputs, modal toggles, and simple UI states.

### 5.2 Global & Shared State
- **Context API** for light global needs (theme).  
- **Recommended**: **Zustand** (or **Jotai**) for complex state (shopping cart, offline queue). This keeps POS logic clean and testable outside component trees.

### 5.3 Server State & Data Fetching
- **Next.js Data Fetching**: `getServerSideProps` or server components fetch initial data (shifts, products).  
- **Client Queries**: `useSWR` or React Query can cache and revalidate data (e.g., product lists) for smooth UX.

## 6. Routing and Navigation

### 6.1 File-Based Routing
- **`app/dashboard/`**: Contains pages for shift management (`page.tsx`), POS (`pos/page.tsx`), products, categories, options, and reports.  
- **Nested Layouts**: `layout.tsx` provides the persistent sidebar and header across dashboard routes.

### 6.2 Navigation Structure
- **Sidebar**: Links to Dashboard, POS, Products, Categories, Options, Transactions, Reports.  
- **Mobile**: Sidebar collapses into a burger menu; the cart floats as a bottom sheet.  
- **Breadcrumbs**: Shown at the top of each page for context (optional enhancement).

## 7. Performance Optimization

### 7.1 Code Splitting & Lazy Loading
- Next.js auto-splits code by route.  
- Use `next/dynamic` for heavy components (charts, maps) to defer loading until needed.

### 7.2 Asset Optimization
- **Images**: Use `next/image` for optimized formats and responsive sizes.  
- **Fonts**: Self-host Inter with `@next/font` for fast, optimized delivery.

### 7.3 Caching & PWA
- **Service Worker**: Caches static assets for offline support.  
- **IndexedDB Queue**: Stores transactions if offline, syncs when back online (future enhancement).

### 7.4 Server-Side Rendering & Edge
- Choose SSR for dynamic pages (dashboard stats) and static generation for less-frequently updated pages (reports).  
- Deploy on Vercel’s edge network for global performance.

## 8. Testing and Quality Assurance

### 8.1 Unit Tests
- **Vitest** or **Jest** + React Testing Library for:  
  • Component rendering and behavior (buttons, forms).  
  • Business logic (cart totals, shift calculations).

### 8.2 Integration Tests
- Test Next.js API routes with **Supertest** or **MSW** to simulate database operations (opening/closing shifts, CRUD endpoints).

### 8.3 End-to-End (E2E) Tests
- **Playwright** or **Cypress** for full flows: Admin login → open shift → add items → pay → view transaction in history.

### 8.4 Linting & Formatting
- **ESLint** with `eslint-config-next` and the Tailwind plugin.  
- **Prettier** for consistent code style.  
- **Pre-commit Hooks**: `husky` + `lint-staged` to enforce checks before commits.

## 9. Conclusion and Overall Summary

This frontend setup for **newseed-pos-next-supabase** delivers a modern, type-safe, and scalable foundation for your POS system.  
- **Architecture** leverages Next.js App Router with TypeScript for speed and reliability.  
- **Design Principles** focus on usability, accessibility, and responsiveness to serve the single-admin user on any device.  
- **Styling** uses Tailwind CSS and shadcn/ui for a consistent flat-modern look, with built-in dark/light theming.  
- **Components** are organized for reusability, with a clear split between atomic and composite pieces.  
- **State Management** balances React’s built-ins with a recommendation for a lightweight global store (Zustand) for complex flows.  
- **Routing** and **Layout** structures make navigation intuitive and code maintenance straightforward.  
- **Performance** is enhanced through Next.js features, lazy loading, and PWA capabilities for offline support.  
- **Testing** spans unit, integration, and E2E to ensure a robust, error-free experience.  

Adhering to these guidelines ensures the frontend remains maintainable, performant, and user-friendly as **Newseed POS v2** evolves.