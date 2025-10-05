# Troubleshooting

## Email/OTP Authentication Issues

### Common Problems and Solutions

#### 1. "API key is invalid" Error
- Verify `RESEND_API_KEY` in `.env` starts with `re_` and is valid
- Test the key at [resend.com/api-keys](https://resend.com/api-keys)
- **Restart dev server after updating `.env`** (required for env changes)

#### 2. "You can only send testing emails to your own email address"
- **Free tier limitation**: Can only send to account owner's email
- Check which email is registered with your Resend account
- For production: Add and verify your domain at [resend.com/domains](https://resend.com/domains)

#### 3. Sender Email Configuration
- Set `RESEND_EMAIL_FROM` in your `.env` file
- Must be either:
  - `onboarding@resend.dev` (for development/testing)
  - Your verified domain email (e.g., `notifications@yourdomain.com`)
- The email is configured in `/apps/web/src/siteConfig.ts` via environment variable

#### 4. Debug OTP Codes in Development
```bash
# OTP codes are logged to console during development
# Look for: "sendVerificationOTP [email] [6-digit-code] sign-in"
# Use this code even if email fails to send
```

#### 5. Quick Checklist
- [ ] RESEND_API_KEY is set in `.env`
- [ ] RESEND_EMAIL_FROM is set in `.env`
- [ ] Server restarted after `.env` changes
- [ ] Sender email verified in Resend dashboard
- [ ] Using correct test email (account owner's for free tier)
- [ ] Check spam folder for emails

## Debugging Approach

When encountering issues, follow this systematic approach:

1. **Reflect on 5-7 different possible sources of the problem**
2. **Distill those down to 1-2 most likely sources**
3. **Add targeted logs to validate assumptions before implementing fixes**
4. **Never use `as any` or workarounds - always fix the root cause**
5. **If solution doesn't work after multiple attempts, use WebSearch for alternatives**

## Common Issues and Solutions

### Build Memory Errors

If you encounter memory errors during build, increase the Node.js memory allocation:

```bash
NODE_OPTIONS="--max-old-space-size=8192" bun build
```

For persistent issues, try:
```bash
NODE_OPTIONS="--max-old-space-size=16384" bun build
```

### Type Generation Issues

#### Problem: Types not generating correctly
Always use the specific project ID when generating types:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > apps/web/src/utils/supabase/database.types.ts
```

#### Problem: Types out of sync with database
1. Pull the latest schema:
   ```bash
   supabase db pull
   ```
2. Regenerate types:
   ```bash
   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > apps/web/src/utils/supabase/database.types.ts
   ```

### Supabase Connection Issues

#### Problem: Cannot connect to Supabase
1. Ensure environment variables are set correctly in `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

2. Check that you're logged in:
   ```bash
   supabase login
   ```

3. Verify project link:
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

#### Problem: MCP not working
1. Ensure `SUPABASE_ACCESS_TOKEN` is set in your shell:
   ```bash
   export SUPABASE_ACCESS_TOKEN=your_token_here
   ```

2. Get token from: https://supabase.com/dashboard/account/tokens

### Development Server Issues

#### Problem: Port already in use
Kill the process using the port:
```bash
# Find process on port 3000
lsof -i :3000
# Kill the process
kill -9 <PID>
```

Or use a different port:
```bash
cd apps/web && bun dev -- --port 3001
```

#### Problem: Hot reload not working
1. Clear Next.js cache:
   ```bash
   rm -rf apps/web/.next
   ```

2. Restart development server:
   ```bash
   bun dev
   ```

### TypeScript Errors

#### Problem: Cannot find module errors
1. Install dependencies:
   ```bash
   bun install
   ```

2. Clear TypeScript cache:
   ```bash
   rm -rf node_modules/.cache
   ```

3. Restart TypeScript server in your IDE

#### Problem: Type errors in generated files
Never edit `packages/supabase/src/types/supabase.ts` directly - it's auto-generated. If types are incorrect:
1. Fix the database schema
2. Regenerate types

### Biome Linting Issues

#### Problem: Formatting conflicts
Run auto-fix:
```bash
# NEVER run global bun check - will timeout!
# Use: npx biome check --write <specific-file>
```

For specific directories:
```bash
npx biome format features/ app/ --write
```

#### Problem: Biome not recognizing files
Check `biome.json` configuration and ensure file extensions are included.

### Turbo Build Issues

#### Problem: Turbo cache causing issues
Clear Turbo cache:
```bash
rm -rf .turbo
turbo build --force
```

### Database Migration Issues

#### Problem: Migrations failing
1. Check migration status:
   ```bash
   supabase migration list
   ```

2. Reset local database:
   ```bash
   supabase db reset
   ```

3. Apply migrations:
   ```bash
   supabase db push
   ```

### Authentication Issues

#### Problem: Session not persisting
1. Check middleware configuration in `/apps/web/middleware.ts`
2. Ensure cookies are enabled in browser
3. Verify Supabase Auth settings in dashboard

### Package Installation Issues

#### Problem: bun install failing
1. Clear bun cache:
   ```bash
   bun pm cache rm
   ```

2. Delete lock file and reinstall:
   ```bash
   rm bun.lockb
   bun install
   ```

#### Problem: Version conflicts
Check required versions:
- Node.js >= 20
- Bun 1.2.13+

### Worker Deployment Issues

#### Problem: Cloudflare Worker not deploying
1. Check wrangler authentication:
   ```bash
   npx wrangler login
   ```

2. Verify `wrangler.toml` configuration

3. Deploy with verbose output:
   ```bash
   cd apps/worker && npx wrangler deploy --verbose
   ```

## Getting Help

If issues persist:
1. Check the error logs carefully
2. Search for the error message in project issues
3. Verify all environment variables are set
4. Ensure all dependencies are installed correctly
5. Try clearing all caches and rebuilding