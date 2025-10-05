# Commands Reference

## Development
- `bun install` - Install all dependencies across the monorepo
- `turbo dev` or `bun dev` - Run all apps in development mode concurrently
- `bun dev:web` - Run only the web app
- `bun dev:server` - Run only the server app

## Build & Production
- `turbo build` or `bun build` - Build all applications
- `NODE_OPTIONS="--max-old-space-size=8192" bun build` - Build with increased memory (use when build fails with memory errors)
- `cd apps/web && bun build` - Build only the web app
- `cd apps/web && bun start` - Start the web app in production mode

## Code Quality & Linting

### ⚠️ CRITICAL: Avoid Global Biome Commands
**DO NOT USE** these commands as they will timeout:
- ❌ `bun check` - Will timeout on full project
- ❌ `npx biome check .` - Will timeout on full project

### ✅ Correct Way: Run Biome on Specific Files
Always run Biome on specific files or small directories to avoid timeouts:

**For single files:**
- `npx biome check --write "apps/web/app/api/admin/users/[userId]/ban/route.ts"` - Check single file (use quotes for bracket paths)
- `npx biome check --write apps/web/components/admin/create-user-modal.tsx` - Check specific component

**For directories (use small, specific paths):**
- `npx biome check --write apps/web/app/api/admin/users` - Check specific API directory
- `npx biome check --write apps/web/components/admin` - Check admin components
- `npx biome check --write apps/web/features/admin` - Check admin features

**Special options:**
- `npx biome check --write --unsafe <file>` - Apply unsafe fixes (like useEffect dependencies)
- `npx biome format --write <file>` - Format specific file only

### TypeScript Type Checking
- `cd apps/web && bun check-types` - Run TypeScript type checking for web app
- `npx tsc --noEmit <specific-file>` - Check specific file only

## Database Operations

### Drizzle (Server App)
- `bun db:push` - Push schema changes to database
- `bun db:studio` - Open Drizzle Studio UI
- `bun db:migrate` - Run database migrations
- `bun db:generate` - Generate migration files

### Supabase Types Generation
- `supabase login` - Login to Supabase CLI
- `supabase link --project-ref YOUR_PROJECT_REF` - Link to the project
- `supabase db pull` - Pull remote database schema
- `npx supabase gen types typescript --project-id YOUR_PROJECT_ID > apps/web/src/utils/supabase/database.types.ts` - Generate TypeScript types from Supabase database schema

## Package Management
- `bun add <package>` - Add a package (run from specific app/package directory)
- `bun add -D <package>` - Add a dev dependency
- `bun install` - Install all dependencies after adding packages

## Testing
- No test framework currently configured
- For manual testing: Use the development server and check features manually
- Consider implementing Vitest or Jest for unit tests in the future