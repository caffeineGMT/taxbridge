# PostgreSQL Migration - Quick Reference

## Critical Context

**Problem:** Vercel uses ephemeral filesystem. SQLite data is lost on every deployment.
**Impact:** First paying customer's data WILL BE DELETED on next deploy.
**Solution:** Migrate to PostgreSQL immediately.

## Three-Step Migration

### 1. Setup Supabase (5 minutes)

```bash
# Visit https://supabase.com
# Create account → New Project
# Project name: taxbridge-production
# Save the database password!
# Get connection string from Settings → Database → Connection String (URI)
```

### 2. Configure Environment (2 minutes)

```bash
# Create .env.production
echo "DATABASE_URL=postgresql://postgres:YourPassword@db.yourproject.supabase.co:5432/postgres" > .env.production

# Load environment
export $(cat .env.production | xargs)

# Test connection
npm run db:postgres:test
```

### 3. Initialize Database (1 minute)

```bash
# Initialize schema and migrations
npm run db:postgres:init

# Verify everything works
npm run db:postgres:verify

# Test locally
npm run dev
# Look for: [DB] Using PostgreSQL database
```

## Deploy to Production

### Set Vercel Environment Variable

1. Go to https://vercel.com/dashboard
2. Select project → Settings → Environment Variables
3. Add:
   - Key: `DATABASE_URL`
   - Value: Your Supabase connection string
   - Environment: Production ✅
4. Save

### Deploy

```bash
npm run build          # Verify zero errors
git add -A
git commit -m "[P0-CRITICAL] Complete PostgreSQL migration"
git push origin main
```

### Verify Production

1. Check Vercel logs for: `[DB] Using PostgreSQL database`
2. Test creating data in production
3. Trigger redeploy (verify data persists)

## NPM Scripts

| Command | Purpose |
|---------|---------|
| `npm run db:postgres:test` | Test database connection |
| `npm run db:postgres:init` | Initialize schema and migrations |
| `npm run db:postgres:verify` | Verify data and health check |

## Files Created

- `docs/POSTGRES_MIGRATION_CHECKLIST.md` - Detailed step-by-step guide (18 steps)
- `scripts/test-postgres-connection.ts` - Connection validation tool
- `scripts/init-postgres-db.ts` - Database initialization script
- `scripts/verify-postgres-data.ts` - Data verification and health check
- `docs/POSTGRES_MIGRATION.md` - Updated comprehensive guide

## Troubleshooting

**Connection fails:**
```bash
# Check DATABASE_URL format
echo $DATABASE_URL

# Expected format:
# postgresql://postgres:password@db.projectref.supabase.co:5432/postgres
```

**"No tables found":**
```bash
# Run initialization
npm run db:postgres:init
```

**Data not persisting in production:**
- Verify DATABASE_URL is set in Vercel (Settings → Environment Variables)
- Redeploy after adding environment variable
- Check deployment logs

## Success Criteria

✅ `npm run db:postgres:test` passes
✅ `npm run db:postgres:init` completes
✅ `npm run db:postgres:verify` shows healthy database
✅ `npm run build` succeeds with zero errors
✅ Production logs show "Using PostgreSQL database"
✅ Data persists after redeployment

## Timeline

- Total time: ~10 minutes for setup
- Supabase account: 5 min
- Environment config: 2 min
- Database init: 1 min
- Testing: 2 min
- Deployment: automated

## Need Help?

See full guides:
- `docs/POSTGRES_MIGRATION_CHECKLIST.md` - Step-by-step with screenshots
- `docs/POSTGRES_MIGRATION.md` - Complete technical reference

## Architecture

```
Development (local):  SQLite (auto-selected when DATABASE_URL not set)
Production (Vercel):  PostgreSQL (auto-selected when DATABASE_URL is set)

Code uses unified layer: lib/db/unified.ts
All queries are database-agnostic
Automatic switching based on environment
```
