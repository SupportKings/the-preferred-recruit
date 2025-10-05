# Architecture

This is a Turborepo monorepo with a feature-based architecture using Bun workspaces, Next.js 15, and Better Auth.

## MainLayout Usage

**IMPORTANT**: When creating new pages, always wrap your content with `MainLayout` at the page level, not in layout files.

**Correct Usage (in page.tsx):**
```typescript
import { QueryProvider } from "@/lib/providers/query-provider";
import MainLayout from "@/components/layout/main-layout";
import { PageHeader } from "@/features/dashboard/headers/page-header";

export default function YourPage() {
  return (
    <QueryProvider>
      <MainLayout header={<PageHeader />} headersNumber={1}>
        <YourPageContent />
      </MainLayout>
    </QueryProvider>
  );
}
```

**Incorrect Usage (in layout.tsx):**
```typescript
// ❌ DON'T put MainLayout in layout files - this causes SidebarProvider errors
export default function YourLayout({ children }) {
  return (
    <MainLayout>  // ❌ Wrong place!
      {children}
    </MainLayout>
  );
}
```

**Why:** MainLayout contains the SidebarProvider and other context providers. Placing it in layout files causes nested provider errors. Always use it at the individual page level.

## High-Level Structure

### Apps (`/apps`)
- **`web`**: Next.js 15 app with App Router, React 19, and TailwindCSS v4
  - Uses server components by default, `'use client'` sparingly
  - Better Auth handles authentication with email OTP via Resend
  - Feature-based folder structure in `/features`
  - Runs on port 3001 in development
- **`server`**: Hono API server with tRPC and Drizzle ORM
  - Handles API endpoints via tRPC routers
  - Uses Drizzle ORM for database operations
  - Runs on port 3000 in development

### Packages (`/packages`)
- **`emails`**: React Email templates for authentication and notifications

## Key Architectural Patterns

### 1. Feature-Based Organization
Each feature in `/apps/web/features` follows this structure:
- `components/` - Feature-specific React components
- `actions/` - Next.js Server Actions for data mutations
- `hooks/` - Custom React hooks
- `types/` - TypeScript type definitions
- `utilities/` - Helper functions
- `contexts/` - React Context providers

### 2. Data Fetching Strategy
- **Server Components**: For static or infrequently changing data
- **React Query + Supabase Realtime**: For shared, frequently changing data requiring optimistic updates
- Server Actions handle all mutations and are called from client components

### 3. Authentication & Authorization
- Better Auth handles authentication with email OTP
- Middleware protection at `/apps/web/middleware.ts`
- Protected routes under `/dashboard/*`
- Email sending via Resend API

### 4. State Management
- React Query (TanStack Query) for server state
- React Context for client-side state
- Command bar pattern using kbar for application commands

### 5. Database Integration
- Supabase PostgreSQL for main database
- Drizzle ORM in server app for type-safe queries
- TypeScript types generated from Supabase schema
- Better Auth tables for user management

## Important Technologies & Conventions

### Styling & UI
- TailwindCSS v4 for styling
- shadcn/ui components built on Radix UI
- CSS variables for theming with next-themes
- Tab indentation (configured in Biome)
- NumberFlow for animated number transitions

### Code Quality
- Biome for linting and formatting (replaces ESLint/Prettier)
- TypeScript with strict type checking  
- Interfaces preferred over types
- Bun as the package manager (npm/yarn/pnpm will fail due to preinstall check)
- Double quotes for strings
- Early returns and guard clauses for error handling
- Self-documenting code, comments only for "why" not "what"

### Performance Optimizations
- React Server Components by default
- Dynamic imports for code splitting
- Image optimization with Next.js Image
- Focus on Web Vitals (LCP, CLS, FID)
- Turbopack for fast development builds

### Form Handling
- React Hook Form for form state management
- Zod for schema validation
- Server Actions for form submissions

## Development Workflow

1. **Environment Setup**: Set up `.env` files in both web and server apps
2. **Database Types**: Types are in `apps/web/src/utils/supabase/database.types.ts` (generated from Supabase schema)
3. **Component Development**: Use shadcn/ui components from `/components/ui`
4. **Feature Development**: Create new features in `/apps/web/src/features` following the established structure
5. **Testing**: No test framework currently configured - use development server for manual testing

## Component Design Principles

### Component Granularity
Split components into smaller, focused sub-components in separate files:

**Example Structure:**
```
sidebar/
├── Sidebar.tsx          # Main component, imports others
├── SidebarHeader.tsx    # Header sub-component
├── SidebarNavList.tsx   # Navigation list
├── SidebarNavItem.tsx   # Individual nav items
└── SidebarFooter.tsx    # Footer sub-component
```

**Benefits:**
- Better maintainability - smaller files are easier to understand
- Improved reusability - focused components can be used elsewhere
- Enhanced performance - better code-splitting and reduced re-renders

### Component File Organization
Follow this structure within component files:
1. Exported component
2. Sub-components (if small enough to stay in same file)
3. Helper functions
4. Static content
5. Type definitions

### UI Component Library
The project uses a comprehensive UI stack:
- **Base Library**: shadcn/ui components
- **Primitives**: Radix UI for accessibility
- **Styling**: TailwindCSS v4
- **Animations**: NumberFlow for smooth number transitions, Framer Motion for complex animations
- **Location**: UI components in `@/components/ui`

```typescript
import { Button } from "@/components/ui/button"
import NumberFlow from '@number-flow/react'

// Use NumberFlow for animated numbers
<NumberFlow value={123} />
```

## Key Files to Understand

- `/apps/web/src/middleware.ts` - Authentication middleware  
- `/apps/web/src/app/layout.tsx` - Root layout with providers
- `/apps/web/src/components/providers.tsx` - Client-side providers setup
- `/apps/web/src/utils/supabase/database.types.ts` - Database schema types (auto-generated)
- `/apps/web/src/lib/auth-client.ts` - Better Auth client configuration
- `/apps/server/drizzle.config.ts` - Drizzle ORM configuration
- `/biome.json` - Code formatting and linting configuration
- `/turbo.json` - Turborepo build configuration