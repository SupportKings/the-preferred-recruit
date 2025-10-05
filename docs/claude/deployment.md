# Deployment

## Vercel (Recommended for Next.js)

### Initial Setup
1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic preview deployments on PRs

### Environment Variables
Required environment variables for Vercel:
```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### Build Settings
- Framework Preset: Next.js
- Build Command: `bun build`
- Output Directory: `.next`
- Install Command: `bun install`

### Advanced Configuration
If build fails with memory issues, add to environment variables:
```env
NODE_OPTIONS=--max-old-space-size=8192
```

### Preview Deployments
- Automatic deployments for every push to any branch
- Comments on PRs with preview URLs
- Production deployment on merge to main branch

## Cloudflare Workers

### Prerequisites
1. Cloudflare account
2. Wrangler CLI installed

### Deployment Steps
1. Navigate to worker directory:
   ```bash
   cd apps/worker
   ```

2. Login to Cloudflare:
   ```bash
   npx wrangler login
   ```

3. Configure `wrangler.toml` with your account details

4. Deploy the worker:
   ```bash
   npx wrangler deploy
   ```

### Environment Variables for Workers
Configure secrets using Wrangler:
```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_KEY
```

### Debugging Deployment
For verbose output during deployment:
```bash
npx wrangler deploy --verbose
```

## Database Migrations

### Production Migrations
1. Always test migrations locally first:
   ```bash
   supabase db reset
   supabase migration up
   ```

2. Apply to production:
   ```bash
   supabase db push --db-url postgresql://[connection-string]
   ```

### Rollback Strategy
Keep migration rollback scripts ready:
```sql
-- In case of issues, have a rollback plan
-- Store in supabase/rollback/[migration-name].sql
```

## Pre-Deployment Checklist

### Code Quality
- [ ] Run `bun check` and fix all issues
- [ ] Run `bun check-types` in web app
- [ ] Test all critical user paths locally
- [ ] Check for console errors and warnings

### Security
- [ ] All API keys are in environment variables
- [ ] No sensitive data in code
- [ ] RLS policies are properly configured
- [ ] CORS settings are appropriate

### Performance
- [ ] Images are optimized
- [ ] Bundle size is reasonable
- [ ] Lighthouse scores are acceptable
- [ ] Database queries are optimized

### Configuration
- [ ] Environment variables are set correctly
- [ ] Database migrations are up to date
- [ ] Supabase project is properly configured
- [ ] Domain settings are correct

## Monitoring

### Application Monitoring
- Use Vercel Analytics for Next.js app
- Monitor Cloudflare Worker metrics in dashboard
- Set up error tracking (e.g., Sentry)

### Database Monitoring
- Monitor Supabase dashboard for:
  - Query performance
  - Database size
  - Connection pool usage
  - Error logs

### Alerts
Set up alerts for:
- High error rates
- Slow response times
- Database connection issues
- Failed deployments

## Rollback Procedures

### Vercel Rollback
1. Go to Vercel dashboard
2. Navigate to deployments
3. Find previous working deployment
4. Click "Promote to Production"

### Worker Rollback
```bash
# List previous deployments
npx wrangler deployments list

# Rollback to specific version
npx wrangler rollback [deployment-id]
```

### Database Rollback
1. Have backup strategy in place
2. Use point-in-time recovery if available
3. Apply rollback migrations if needed

## Production Best Practices

1. **Use staging environment** - Test everything in staging first
2. **Gradual rollouts** - Use feature flags for new features
3. **Monitor after deployment** - Watch metrics for 24 hours
4. **Have rollback plan** - Know how to revert quickly
5. **Document changes** - Keep deployment log
6. **Communicate** - Notify team of deployments
7. **Off-peak deployment** - Deploy during low traffic periods