# OpsKings Template

## stack

S

- **🔐 Better Auth** - Modern authentication with email OTP, sign-up, and sign-in
- **⚡ Next.js 15** - Full-stack React framework with App Router
- **🎨 TailwindCSS** - Utility-first CSS for rapid UI development
- **🧩 shadcn/ui** - Reusable UI components built on Radix UI
- **🚀 Bun** - Fast JavaScript runtime and package manager
- **🗄️ Supabase** - PostgreSQL database with auth and real-time features
- **🔧 Biome** - Fast formatter and linter
- **📦 Turborepo** - Optimized monorepo build system
- **🎯 TypeScript** - End-to-end type safety

## Prerequisites

### 1. Install Bun

This project requires Bun as the package manager and runtime. Install it from [bun.com](https://bun.com/docs/installation):

**macOS/Linux:**

```bash
curl -fsSL https://bun.com/install | bash
```

**Windows:**

```powershell
powershell -c "irm bun.sh/install.ps1|iex"
```

**Verify installation:**

```bash
bun --version
```

### 2. Install Supabase CLI

The project uses Supabase for database management. Install the CLI:

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Windows/Linux:**
```bash
npx supabase --version
```

**Or download directly from:** [supabase.com/docs/guides/cli](https://supabase.com/docs/guides/cli/getting-started)

### 3. VS Code Extensions

For the best development experience, install these VS Code extensions:

- **Biome** - Official Biome extension for formatting and linting
- **Tailwind CSS IntelliSense** - Autocomplete for Tailwind classes

## Getting Started

1. **Clone and install dependencies:**

```bash
git clone <your-repo-url>
cd opskings-template
bun install
```

> **⚠️ Troubleshooting:** If `bun install` hangs on "Resolving dependencies", see the [Common Issues](#common-issues) section below.

2. **Set up environment variables:**

```bash
# Copy example env files
cp apps/web/.env.example apps/web/.env
cp apps/server/.env.example apps/server/.env
```

3. **Set up Supabase database:**

   Create a new Supabase project at [supabase.com](https://supabase.com) and get your database URL and API keys.

4. **Configure environment variables** in `apps/web/.env`:

   ```bash
   # Supabase
   DATABASE_URL=your_supabase_db_url
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # App
   NEXT_PUBLIC_APP_URL=http://localhost:3001
   BETTER_AUTH_SECRET=your_secret_key

   # Email (Resend)
   RESEND_API_KEY=your_resend_api_key
   ```

5. **Run database migrations:**

   ```bash
   cd apps/web
   supabase db push
   ```

   This will create all necessary tables and seed data including:
   - User authentication tables (Better Auth)
   - Application tables (clients, team_members, roles, etc.)
   - Initial seed data (admin role, support user, default statuses)

## Authentication Setup

### Set up Resend for OTP emails

- Sign up at [resend.com](https://resend.com)
- Get your API key from the dashboard
- Add to `apps/web/.env`:

```bash
RESEND_API_KEY=re_xxxxxxxxxxxx
```

- Verify your domain or use the default sender email

### Supabase RLS (Row Level Security)

If using Supabase, set up Row Level Security:

1. **Create helper functions:**

```sql
-- Function to get current user ID
create function current_user_id() returns text as $$
  select current_setting('my.user_id', true);
$$ language sql stable;

-- Function to set user ID
create function set_user_id(user_id text)
returns void
language sql
as $$
  select set_config('my.user_id', user_id, false);
$$;
```

2. **Enable RLS on tables:**

```sql
alter table public.user enable row level security;
```

3. **Create RLS policies:**

```sql
-- Users can only see their own data
create policy "Users can only see their own data"
on public.user
for select
using (
  id = current_user_id()
);
```

## Development

**Start the development server:**

```bash
bun dev
```

- **Web app:** [http://localhost:3001](http://localhost:3001)
- **API server:** [http://localhost:3000](http://localhost:3000)

## Project Structure

```
opskings-template/
├── apps/
│   ├── web/                 # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/         # App Router pages
│   │   │   ├── components/  # UI components
│   │   │   ├── features/    # Feature modules
│   │   │   └── lib/         # Utilities and config
│   │   └── public/          # Static assets
│   └── server/              # Hono API server
│       ├── src/
│       │   ├── routers/     # tRPC routers
│       │   └── db/          # Database schema
│       └── drizzle.config.ts
├── packages/
│   └── emails/              # Email templates
└── scripts/                 # Build and dev scripts
```

## Available Scripts

- `bun dev` - Start all applications in development mode
- `bun build` - Build all applications for production
- `bun dev:web` - Start only the web application
- `bun dev:server` - Start only the server
- `bun check-types` - Check TypeScript types across all apps
- `bun db:push` - Push schema changes to database
- `bun db:studio` - Open database studio UI
- `bun check` - Run Biome formatting and linting

## Styling and Theming

### Customizing Styles

1. **Use TweakCN** for component customization
2. **Modify global styles** in `apps/web/src/index.css`
3. **Update theme** in `apps/web/src/components/theme-provider.tsx`

### Logo Configuration

Update your logo and branding in `apps/web/src/siteConfig.ts`:

```typescript
export const siteConfig = {
  name: "Your App Name",
  logo: {
    src: "/logo.png", // Path to your logo
  },
  email: {
    from: "noreply@yourapp.com", // Sender email
  },
};
```

## Tips & Best Practices

### Development Workflow

1. **Always use Bun** - The project is configured to prevent npm/pnpm usage
2. **Run Biome** - Format code with `bun check` before committing
3. **Type safety** - Leverage TypeScript for better development experience

## Common Issues

### Bun Install Hanging on "Resolving dependencies"

If `bun install` gets stuck, this is usually caused by React version mismatches or cache issues.

**Solution:**

```bash
# 1. Clear Bun's cache
bun pm cache rm

# 2. Remove all node_modules
rm -rf node_modules apps/*/node_modules packages/*/node_modules

# 3. Ensure React versions match across all workspaces
# Check that apps/web/package.json and packages/emails/package.json
# both use the same React version (e.g., 19.1.0)

# 4. Install packages individually
cd apps/web && bun install --ignore-scripts
cd ../server && bun install --ignore-scripts
cd ../../packages/emails && bun install --ignore-scripts

# 5. Run root install
cd ../.. && bun install
```

**Prevention:**
- Keep React/React DOM versions synchronized across all workspace packages
- Clear cache when encountering issues: `bun pm cache rm`
- Use verbose mode for debugging: `BUN_DEBUG=1 bun install --verbose`
