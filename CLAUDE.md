# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🚨 CRITICAL - READ FIRST

### ⚠️ Template Repository Status
This is initially a **TEMPLATE REPOSITORY** that requires setup:

1. **Initial State**: Contains placeholder code with `@ts-ignore` comments marked as "Template build"
2. **After Setup**: Once Supabase, Better Auth, and other services are configured:
   - **REMOVE all `@ts-ignore` comments** marked with "Template build"  
   - **Generate proper types** using `npx supabase gen types typescript`
   - **Connect real database** - Update all mock data with actual queries
   - **Fix type safety** - Resolve any `as any` or type assertions
3. **Detection**: If you see commits with real features or populated `.env` files, treat as production codebase
4. **Action Required**: Search for `@ts-ignore.*Template build` and resolve all instances

### Customization Points (Template Mode)
When using as template for new projects:
- `/apps/web/src/siteConfig.ts` - Central configuration file:
  - `name`: Company/app name (appears in emails, page titles, dashboard welcome)
  - `logo`: Light/dark mode logo paths
  - `email.from`: Sender email (uses `RESEND_EMAIL_FROM` env var)
  - `contact`: Business analyst info and Slack channel details
- `/apps/web/src/lib/permissions.ts` - Role definitions and permission system
- `/apps/server/src/db/schema/` - Database schema via Drizzle ORM
- `/packages/emails/` - React Email templates
- `/features/*/data/` - Mock data for development

**Note**: Changing `siteConfig.name` automatically updates:
- Email sender name
- Email subjects and content
- Dashboard welcome message
- Page metadata (Note: root layout.tsx has hardcoded "OpsKings" in metadata that may need updating)
- Team invite emails

### Required Runtime
- **Bun 1.2.13+** - npm/pnpm will fail (preinstall check blocks them)
- Run `bun install` for dependencies

### Senior Engineer Execution Approach
Before ANY code changes:
1. **Map the Scope** - Identify exact files and lines to modify, justify each change
2. **Minimal Changes** - Only code directly required for the task, no cleanup or extras
3. **Follow Patterns** - Match existing codebase conventions exactly
4. **No Workarounds** - Always solve root causes, never use `as any`, type assertions, or quick fixes
5. **No Assumptions** - Verify actual conditions, don't assume states

### Debugging Approach
When fixing bugs:
1. **Analyze First** - Reflect on 5-7 possible sources, narrow to 1-2 most likely
2. **Add Logging** - Validate assumptions with targeted logs before fixes
3. **Root Cause Only** - Never use `as any` or workarounds, fix the actual problem
4. **Persist & Research** - If solution doesn't work after multiple attempts, use WebSearch to find proper alternative approaches
5. **Verify Impact** - Check for downstream effects before implementing

### Never Run These Commands
```bash
❌ bun check           # Timeouts - use specific files only
❌ npx biome check .   # Timeouts - use specific files only
```

### Always Use These Instead
```bash
✅ npx biome check --write apps/web/src/components/header.tsx  # Specific file
✅ npx biome check --write "apps/web/app/[...path]/route.ts"   # Use quotes for brackets
```

## ⚠️ Troubleshooting: Bun Install Hanging

If `bun install` gets stuck on "Resolving dependencies", this is typically caused by:

### Root Causes
1. **React version mismatches** between workspace packages (e.g., web app has 19.0.0, emails has 19.1.0)
2. **Corrupted Bun cache** causing resolution conflicts
3. **Network issues** when fetching package manifests from registry

### Solution Steps
```bash
# 1. Clear Bun's package cache
bun pm cache rm

# 2. Remove all node_modules
rm -rf node_modules apps/*/node_modules packages/*/node_modules

# 3. Ensure React versions match across all package.json files
# Check apps/web/package.json and packages/emails/package.json
# Both should use same React version (e.g., 19.1.0)

# 4. Install packages individually first
cd apps/web && bun install --ignore-scripts
cd ../server && bun install --ignore-scripts
cd ../../packages/emails && bun install --ignore-scripts

# 5. Run root install
cd ../.. && bun install
```

### Prevention
- Always keep React/React DOM versions synchronized across workspaces
- Clear cache if you encounter resolution issues: `bun pm cache rm`
- Use `--verbose` flag to debug: `BUN_DEBUG=1 bun install --verbose`

## Tech Stack
- **Next.js 15** + React 19 with App Router (Turbopack in dev)
- **Better Auth** - Modern authentication with email OTP, sign-up, and sign-in
- **Supabase** - PostgreSQL database
- **Drizzle ORM** - Type-safe queries (server app)
- **tRPC** - End-to-end typesafe APIs
- **TailwindCSS v4** + shadcn/ui
- **Biome** - Formatting/linting (tabs, double quotes)
- **Turborepo** - Monorepo management
- **React Email** - Email templates with preview server
- **Bun** - Package manager with isolated linker (bunfig.toml)

## Template → Production Checklist

When transitioning from template to production:
```bash
# 1. Set up Supabase project
- Create project at supabase.com
- Get connection strings and API keys
- Configure .env files with real values

# 2. Generate database types
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > apps/web/src/utils/supabase/database.types.ts

# 3. Configure email service (Resend)
- Sign up at resend.com and get API key
- Add RESEND_API_KEY to .env file
- Add RESEND_EMAIL_FROM to .env file (e.g., "onboarding@resend.dev" for dev, "notifications@yourdomain.com" for production)
- Verify your domain in Resend dashboard for production use

# 4. Clean up template code
- Search and fix: @ts-ignore.*Template build
- Remove mock data from /features/*/data/
- Connect real database queries
- Fix any remaining type safety issues

# 5. Initialize database
bun db:push      # Push Drizzle schema
bun db:migrate   # Run migrations

# 5. Create initial admin user
- No default login credentials exist!
- Signups are disabled by default (disableSignUp: true)
- Seed creates support@opskings.com but no password
- Options to create first user:
  a) Temporarily enable signups in auth.ts
  b) Use team invite feature (requires existing admin)
  c) Manually insert user via Supabase dashboard
  d) Create custom seed script with Better Auth
```

## MCP (Model Context Protocol) Setup

**Note**: MCP configuration (.mcp.json) not yet created. When configured, it will provide:

### Available MCP Tools
- `mcp__supabase__execute_sql` - Run SQL queries
- `mcp__supabase__list_tables` - List database tables  
- `mcp__supabase__select` - Query data from tables

### Setup Required
1. Create `.mcp.json` with Supabase configuration
2. Set `SUPABASE_ACCESS_TOKEN` environment variable
3. See [security-config.md](./docs/claude/security-config.md) for details

## Essential Commands

```bash
# Development
bun dev              # All apps (web:3001, server:3000, emails:3002)
bun dev:web          # Next.js only (port 3001) - runs custom dev script with ASCII art
bun dev:server       # Server only (port 3000) - hot reload with --hot flag
bun dev:native       # Native app development (if configured)

# Database (Drizzle ORM in server app)
bun db:push          # Push Drizzle schema changes to database
bun db:studio        # Open Drizzle Studio GUI at localhost:4983
bun db:migrate       # Run pending migrations
bun db:generate      # Generate new migration files from schema changes

# Email Development
bun --filter @workspace/emails dev    # React Email dev server (port 3002)
bun --filter @workspace/emails export # Export email templates to static HTML

# Type Generation
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > apps/web/src/utils/supabase/database.types.ts
# Generate types after any schema changes, use Tables<"table_name"> for DB types

# Build & Type Checking
bun build            # Build all apps via Turborepo
bun check-types      # TypeScript checks via Turbo (runs tsc --noEmit)

# Build with Memory Issues Fix
NODE_OPTIONS="--max-old-space-size=8192" bun build  # If build fails with memory errors

# Server Compilation (Production)
cd apps/server && bun run compile  # Creates standalone binary with --bytecode

# Installation
bun install          # Install dependencies (npm/pnpm will fail due to preinstall check)
```

## Project Structure

```
/apps
  /web              → Next.js app (port 3001)
    /src/app        → App Router pages
    /src/features   → Feature modules
    /src/components → Shared UI components
    /src/lib        → Auth client, permissions
    /src/middleware.ts → Auth protection & redirects
    /src/siteConfig.ts → Logo, emails, contacts configuration
    /scripts/dev.ts → Custom dev server with ASCII art splash
  /server           → Hono + tRPC (port 3000)
    /src/db         → Drizzle schema & migrations
    /src/routers    → tRPC routers
    /src/lib        → Server utilities

/packages/emails    → React Email templates (dev server port 3002)
/docs/claude        → Detailed documentation
/biome-plugins      → Custom Biome rules (object-assign.grit)
/bunfig.toml        → Bun config (isolated linker mode)
```

## Authentication & Middleware Flow

### Route Protection
- **Middleware** (`/apps/web/src/middleware.ts`) handles authentication redirects:
  - Authenticated users: Redirected from `/` to `/dashboard`
  - Unauthenticated users: Redirected from `/dashboard/*` to `/`
  - Uses `getSessionCookie` from Better Auth for session validation

### Auth API Route
- **Single route handler** at `/api/auth/[...all]` handles all Better Auth endpoints
- Configured in `/apps/web/src/app/api/auth/[...all]/route.ts`
- DO NOT create additional API routes - all go through tRPC server

## Key Architecture Rules

### 1. MainLayout Pattern
```typescript
// ✅ CORRECT - In page.tsx with headers array
export default function Page() {
  return (
    <MainLayout headers={[<PageHeader key="header" />]}>
      <Content />
    </MainLayout>
  );
}

// ❌ WRONG - Never in layout.tsx (causes provider errors)
// ❌ WRONG - MainLayout expects headers array, not single header prop
// Note: Dashboard layout.tsx already has SidebarProvider - don't nest providers
```

### 2. API Routes & tRPC Architecture
- **Better Auth**: `/api/auth/[...all]` - Handles all auth endpoints
- **tRPC Server**: Hono-based server (port 3000) with type-safe tRPC routers
  - Entry point: `/apps/server/src/index.ts`
  - CORS configured via `CORS_ORIGIN` env var
  - Context creation in `/apps/server/src/lib/context.ts`
  - Routes mounted at `/trpc/*`
- **Client Integration**: Use `@trpc/tanstack-react-query` for data fetching in web app
- **No Next.js API routes**: All custom APIs go through tRPC server for end-to-end type safety

### 3. Feature Structure
```
/features/[name]/
  components/   → UI components
  actions/      → Server Actions  
  queries/      → React Query hooks
  hooks/        → Custom React hooks
  types/        → TypeScript types
  layout/       → Page headers
```

### 4. Data Fetching Architecture
1. **Server Components** → Initial page data (SEO-friendly, fast loading)
2. **tRPC + React Query** → Dynamic data with real-time updates via Supabase subscriptions
3. **Server Actions** → All mutations and form submissions
4. **Feature Pattern**: Actions in `/features/[name]/actions/`, Queries in `/features/[name]/queries/`

### 5. Server Actions Pattern
```typescript
// All server actions use next-safe-action with actionClient
"use server";
export const createAction = actionClient
  .inputSchema(zodSchema)
  .action(async ({ parsedInput }) => {
    // Implementation with proper error handling
    // Always revalidatePath() after mutations
  });
```

## Code Standards

- **TypeScript**: Never use `any`, use proper types, interfaces preferred over types
- **Components**: Server by default, `'use client'` only when needed (forms, interactions)
- **Formatting**: Tabs, double quotes, semicolons (Biome enforced)
- **HTML**: Never nest `<ul>` in `<p>`, add `type="button"` to buttons, use semantic elements
- **Imports**: Auto-organized by Biome (React → Next → Node → tRPC → Radix → libs → hooks → utils → components → features → local)
- **Classes**: Auto-sorted with `cn()`, `clsx()`, `cva()` functions via Biome nursery rule
- **Validation**: Zod schemas for all forms and API inputs with proper error handling
- **UI Components**: Use shadcn/ui components from `/components/ui/`, never recreate existing ones
- **Data Tables**: Use existing table patterns from `/components/universal-data-table/`
- **Object Spread**: Never use `Object.assign()`, use object spread `{...obj}` (Biome enforced via Grit plugin)

## Biome Configuration Details

- **Custom plugin**: `biome-plugins/object-assign.grit` enforces object spread syntax
- **Class sorting**: Enabled for `clsx`, `cva`, `cn` functions
- **Import organization**: Specific groups with blank lines between (see biome.json)
- **Linting rules**: 
  - `noParameterAssign`: error
  - `useExhaustiveDependencies`: info only (not error)
  - `useSortedClasses`: auto-fix enabled

## Environment Variables

```bash
# apps/web/.env
DATABASE_URL=postgresql://...              # Supabase PostgreSQL connection
BETTER_AUTH_DATABASE_URL=postgresql://...  # Better Auth database (can be same as DATABASE_URL)
NEXT_PUBLIC_SUPABASE_URL=https://...      # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...         # Supabase anonymous key
NEXT_PUBLIC_APP_URL=http://localhost:3001 # App URL
NEXT_PUBLIC_SERVER_URL=http://localhost:3000 # tRPC server URL
BETTER_AUTH_SECRET=...                     # Secret for auth sessions
RESEND_API_KEY=re_...                      # Resend API key for emails
RESEND_EMAIL_FROM=...                      # Sender email (e.g., "onboarding@resend.dev" or "noreply@yourdomain.com")

# apps/server/.env  
DATABASE_URL=postgresql://...              # Same as web app
CORS_ORIGIN=http://localhost:3001         # CORS allowed origin
```

## 📚 Documentation Modules

For detailed information, see `/docs/claude/`:

### Development
- [commands.md](./docs/claude/commands.md) - All commands reference
- [architecture.md](./docs/claude/architecture.md) - System design
- [security-config.md](./docs/claude/security-config.md) - Environment setup
- [project-documentation-guidelines.md](./docs/claude/project-documentation-guidelines.md) - Guidelines for maintaining PROJECT_OVERVIEW.md

### Best Practices  
- [critical-thinking.md](./docs/claude/critical-thinking.md) - **STOP AND THINK** before coding
- [senior-engineer-execution.md](./docs/claude/senior-engineer-execution.md) - Senior engineer task execution
- [debug.md](./docs/claude/debug.md) - Systematic debugging approach
- [code-quality.md](./docs/claude/code-quality.md) - TypeScript & standards
- [ui-ux-standards.md](./docs/claude/ui-ux-standards.md) - Component patterns

### Implementation
- [feature-patterns.md](./docs/claude/feature-patterns.md) - Common patterns
- [data-fetching.md](./docs/claude/data-fetching.md) - Query strategies

### Troubleshooting
- [common-mistakes.md](./docs/claude/common-mistakes.md) - Frequent issues
- [linting-errors.md](./docs/claude/linting-errors.md) - Biome fixes
- [troubleshooting.md](./docs/claude/troubleshooting.md) - Debug guide (includes Email/OTP auth issues)

### Deployment
- [deployment.md](./docs/claude/deployment.md) - Production setup

### Init Handler
- [init-handler.md](./docs/claude/init-handler.md) - Creating new documentation

## Authentication Details

- **Better Auth** with PostgreSQL adapter
- **Email OTP** via Resend for passwordless login (primary method)
- **Passkey support** for biometric authentication
- **Admin plugin** for role-based access control (admin, user roles)
- **Session caching** enabled (5 min cache)
- **⚠️ No default login**: Signups disabled, no test credentials provided
- **Initial user setup**: See Template → Production Checklist step #5

## Feature Development Workflow

1. **Read relevant docs** in `/docs/claude/` for your task
2. **Think critically** before implementing (see critical-thinking.md)
3. **Follow established patterns**: Look at `/features/clients/` as reference implementation
4. **Use feature generation prompts**: See `FEATURE_GENERATION_PROMPT.md` for complete patterns
5. **Type-first development**: Create types in `/features/[name]/types/` before implementation
6. **Use existing components**: Check `/components/ui/` and `/components/` before creating new ones
7. **Server Actions**: Use `actionClient` from `@/lib/safe-action` with Zod validation
8. **Check specific files** with Biome, never run globally
9. **Use MCP tools** for database queries when available

### Auto-Documentation Protocol
**IMPORTANT**: Keep `PROJECT_OVERVIEW.md` current using a two-tier approach:

**Tier 1: Silent Auto-Updates** (no user prompt needed)
- ✅ Major structural changes: new database tables, external service integrations
- ✅ New environment variables or configuration requirements
- ✅ Clear completion signals: user says "thanks", "perfect", "looks good"
- ✅ Successful final lint/typecheck after feature implementation

**Tier 2: Prompt for Updates** (when uncertain about completion)
- ✅ Feature appears complete but no clear completion signal
- ✅ Significant functionality added but user hasn't indicated they're done
- ✅ New API endpoints, pages, or business logic implemented
- Ask: "Should I update the project documentation to reflect these changes?"

**Never update during**:
- ❌ Active debugging/troubleshooting sessions
- ❌ Work-in-progress iterations
- ❌ Incomplete implementations

Follow `/docs/claude/project-documentation-guidelines.md` for update format.

## Important Reminders

- Do exactly what's asked, nothing more
- Prefer editing existing files over creating new ones
- Never create documentation unless explicitly requested
- **Template Detection**: Check for `@ts-ignore.*Template build` comments - if present, this is still a template
- **After Real Development Starts**: Remove all template workarounds and connect real services
- Use MCP tools for database exploration when configured
- Authentication uses Better Auth, not Supabase Auth
- **No test framework configured** - manual testing only (no Jest/Vitest/Playwright)
- Next.js configuration:
  - Experimental optimizations: `optimizePackageImports` for lucide-react, framer-motion
  - `useCache` enabled for performance
  - Images from all HTTPS sources allowed
- Monorepo structure: separate server (Hono+tRPC) and web (Next.js) apps
- Database schema managed via Drizzle ORM in server app (`/apps/server/src/db/`)
- Site configuration (logo, emails, contacts) managed via `/apps/web/src/siteConfig.ts`
- Dashboard pages already have SidebarProvider in layout - use MainLayout for content only
- **TypeScript project references** enable type sharing between web and server apps
- **Custom dev script** at `/apps/web/scripts/dev.ts` shows ASCII art splash screen
- **Turborepo caching** enabled for build tasks, disabled for dev/db tasks
- **Global env vars** configured in turbo.json for cross-package access
- **Middleware matcher** configured for `/` and `/dashboard/:path*` routes only
- **Bun isolated linker** configured in `bunfig.toml` for better dependency isolation
- **Theme provider** uses next-themes for dark/light mode support
- **Fonts**: Uses Geist and Geist Mono from Google Fonts (configured in root layout)
- **Metadata**: Root layout has hardcoded title "OpsKings" and description "OpsOS Template" that may need customization