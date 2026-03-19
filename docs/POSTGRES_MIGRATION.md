# PostgreSQL Migration Guide

## ⚠️ CRITICAL NOTICE

**Production is currently using SQLite on Vercel's ephemeral filesystem. Customer data WILL BE LOST on next deployment.**

**Action Required:** Complete this migration immediately to prevent data loss.

For a step-by-step checklist, see: `docs/POSTGRES_MIGRATION_CHECKLIST.md`

## Overview

The TaxBridge application supports both SQLite (development) and PostgreSQL (production) databases through a unified database abstraction layer. This migration is essential for production deployment on platforms like Vercel that use ephemeral filesystems.

## Environment Configuration

### Development (SQLite)
No configuration needed - SQLite is used by default when `DATABASE_URL` is not set.

### Production (PostgreSQL)

Add the following environment variable to `.env.production`:

```bash
# PostgreSQL Connection String
# Format: postgresql://username:password@host:port/database
DATABASE_URL=postgresql://user:password@your-postgres-host.com:5432/taxbridge

# Example with Supabase:
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres

# Example with Railway:
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@containers-us-west-1.railway.app:5432/railway

# Example with Neon:
DATABASE_URL=postgresql://[user]:[password]@[endpoint].neon.tech/[dbname]?sslmode=require
```

## PostgreSQL Provider Setup

### Option 1: Supabase (Recommended)

**Step-by-step setup:**

1. **Create account**
   - Go to https://supabase.com
   - Click "Start your project"
   - Sign up with GitHub (recommended) or email

2. **Create new project**
   - Click "New Project"
   - Project name: `taxbridge-production`
   - Database password: Generate strong password (SAVE THIS)
   - Region: Choose closest to users (e.g., `us-east-1`)
   - Plan: Free tier (500MB database, automatic backups)
   - Wait 2-3 minutes for provisioning

3. **Get connection string**
   - Click **Project Settings** (gear icon, bottom left)
   - Click **Database** in settings menu
   - Scroll to **Connection string** section
   - Select **URI** tab (NOT "Transaction pooler")
   - Copy connection string:
     ```
     postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijklm.supabase.co:5432/postgres
     ```
   - Replace `[YOUR-PASSWORD]` with your database password

4. **Configure environment**
   - Add to `.env.production`:
     ```bash
     DATABASE_URL=postgresql://postgres:YourPassword@db.yourproject.supabase.co:5432/postgres
     ```
   - Add to Vercel environment variables:
     - Go to Vercel → Project Settings → Environment Variables
     - Key: `DATABASE_URL`
     - Value: Your connection string
     - Environment: Production (check the box)
     - Click Save

5. **Initialize database**
   ```bash
   export $(cat .env.production | xargs)
   tsx scripts/init-postgres-db.ts
   ```

6. **Verify setup**
   ```bash
   tsx scripts/test-postgres-connection.ts
   tsx scripts/verify-postgres-data.ts
   ```

**Pros**: Free tier, automatic backups, built-in admin UI, connection pooling, excellent documentation
**Cons**: Cold starts on free tier (minimal impact)
**Best for**: Production deployments, first-time PostgreSQL users

### Option 2: Railway

1. Create account at https://railway.app
2. Create new project > Add PostgreSQL
3. Copy the `DATABASE_URL` connection string
4. Set environment variable
5. Run migrations: `npm run db:init:postgres`

**Pros**: Simple deployment, good free tier, fast
**Cons**: Costs can add up with usage

### Option 3: Neon

1. Create account at https://neon.tech
2. Create new project
3. Copy connection string from dashboard
4. Set `DATABASE_URL` environment variable
5. Run migrations: `npm run db:init:postgres`

**Pros**: Serverless PostgreSQL, auto-scaling, branching
**Cons**: Newer platform

## Database Initialization

### Quick Start

```bash
# 1. Load environment variables
export $(cat .env.production | xargs)

# 2. Test connection
tsx scripts/test-postgres-connection.ts

# 3. Initialize database schema
tsx scripts/init-postgres-db.ts

# 4. Verify setup
tsx scripts/verify-postgres-data.ts

# 5. Test locally with PostgreSQL
npm run dev
# Look for: [DB] Using PostgreSQL database
```

### Available Scripts

| Script | Purpose |
|--------|---------|
| `tsx scripts/test-postgres-connection.ts` | Test DATABASE_URL connection |
| `tsx scripts/init-postgres-db.ts` | Initialize schema and run migrations |
| `tsx scripts/verify-postgres-data.ts` | Verify data and check database health |

### Running Migrations

Migrations are automatically applied when the application starts if using PostgreSQL.

The `init-postgres-db.ts` script runs all pending migrations automatically.

## Schema Differences

The PostgreSQL schema is equivalent to SQLite but with these improvements:

1. **Data Types**:
   - `REAL` → `NUMERIC(12, 2)` for currency precision
   - `INTEGER` → `SERIAL` for auto-increment IDs
   - `TEXT` → `TIMESTAMP` for datetime fields

2. **Boolean Values**:
   - SQLite: `0/1`
   - PostgreSQL: `FALSE/TRUE`

3. **Timestamps**:
   - SQLite: `CURRENT_TIMESTAMP` returns text
   - PostgreSQL: `CURRENT_TIMESTAMP` returns proper timestamp

4. **Generated Columns**:
   - SQLite: `VIRTUAL`
   - PostgreSQL: `STORED`

## Quick Migration Checklist

**See `docs/POSTGRES_MIGRATION_CHECKLIST.md` for detailed step-by-step guide.**

**Code preparation (completed):**
- [x] Install `pg` and `@types/pg` packages
- [x] Create PostgreSQL schema file (`postgres-schema.sql`)
- [x] Create unified database abstraction layer (`lib/db/unified.ts`)
- [x] Update all database queries to use async/await
- [x] Create PostgreSQL migration files
- [x] Create initialization and test scripts
- [x] Test database operations

**Production setup (action required):**
- [ ] Create Supabase account and project
- [ ] Get DATABASE_URL connection string
- [ ] Add DATABASE_URL to `.env.production`
- [ ] Add DATABASE_URL to Vercel environment variables
- [ ] Run `tsx scripts/test-postgres-connection.ts`
- [ ] Run `tsx scripts/init-postgres-db.ts`
- [ ] Run `tsx scripts/verify-postgres-data.ts`
- [ ] Test locally with `npm run dev`
- [ ] Build with `npm run build` (verify zero errors)
- [ ] Deploy to production
- [ ] Verify data persistence after deployment

## Testing

### Test PostgreSQL Connection
```bash
# Load environment
export $(cat .env.production | xargs)

# Test connection
tsx scripts/test-postgres-connection.ts

# Expected output:
# ✅ Connection successful!
# ✅ Found N tables
# ✅ All required tables present!
# ✅ Write permissions verified
```

### Test Local Development with PostgreSQL
```bash
# Load environment
export $(cat .env.production | xargs)

# Start dev server
npm run dev

# Expected in logs:
# [DB] Using PostgreSQL database
```

### Test SQLite (Development - Default)
```bash
# Unset DATABASE_URL
unset DATABASE_URL

# Start dev server
npm run dev

# Expected in logs:
# [DB] Using SQLite database
```

### Verify Data Integrity
```bash
# Load environment
export $(cat .env.production | xargs)

# Run verification
tsx scripts/verify-postgres-data.ts

# Shows:
# - Table row counts
# - Database size
# - Recent activity
# - Index health
```

## Troubleshooting

### "DATABASE_URL environment variable is required"
- Ensure `DATABASE_URL` is set in your environment
- Format: `postgresql://user:password@host:port/database`

### "Cannot connect to database"
- Check your PostgreSQL instance is running
- Verify connection string is correct
- Check firewall/network settings
- Ensure SSL mode is correct (add `?sslmode=require` if needed)

### "Relation does not exist"
- Run migrations: `npm run db:init:postgres`
- Check database permissions

### TypeScript errors with database types
- The unified layer returns `any` for backward compatibility
- Use the exported query functions instead of direct database access

## Best Practices

1. **Always use the query functions** from `lib/db/unified.ts` or `lib/db/index.ts`
2. **Never use SQLite-specific syntax** in production code (e.g., `.prepare()`)
3. **Always await** database operations - they're all async now
4. **Test both databases** before deploying
5. **Use connection pooling** in production (automatically enabled)

## Performance Notes

- PostgreSQL connection pool: max 20 connections
- Idle timeout: 30 seconds
- Connection timeout: 2 seconds
- SSL enabled in production automatically

## Rollback Plan

If you need to rollback to SQLite-only:

1. Unset `DATABASE_URL` environment variable
2. The app will automatically use SQLite
3. All data in PostgreSQL will remain but won't be accessible

## Vercel Deployment

### Critical Steps for Vercel

1. **Add DATABASE_URL to Vercel**
   - Go to https://vercel.com/dashboard
   - Select your project
   - Settings → Environment Variables
   - Add `DATABASE_URL` with your PostgreSQL connection string
   - Select "Production" environment
   - Save

2. **Trigger Deployment**
   ```bash
   git add -A
   git commit -m "[P0-CRITICAL] Complete PostgreSQL migration"
   git push origin main
   ```

3. **Verify in Production**
   - Check Vercel deployment logs
   - Look for: `[DB] Using PostgreSQL database`
   - Test creating data in production
   - Redeploy and verify data persists

### Common Vercel Issues

**Data not persisting:**
- Check DATABASE_URL is set in Vercel (Settings → Environment Variables)
- Verify you redeployed AFTER adding the environment variable
- Check deployment logs for database connection errors

**Build errors:**
- Run `npm run build` locally first
- Verify all database queries use the unified layer
- Check for any remaining SQLite-specific code

## New Scripts Reference

### `scripts/test-postgres-connection.ts`
Tests the DATABASE_URL connection and verifies PostgreSQL is accessible.
- Validates connection string format
- Checks database permissions
- Lists existing tables
- Tests write capability
- Shows connection pool stats

### `scripts/init-postgres-db.ts`
Initializes the PostgreSQL database schema and runs migrations.
- Creates all required tables
- Sets up indexes
- Runs pending migrations
- Creates migration tracking table
- Verifies setup with test query

### `scripts/verify-postgres-data.ts`
Verifies data exists and database is healthy.
- Shows table row counts
- Displays database size
- Lists recent activity
- Checks index health
- Reports active connections
- Validates data integrity

## Support

**For migration help:**
- See: `docs/POSTGRES_MIGRATION_CHECKLIST.md` (step-by-step guide)
- Check migration logs in console
- Review error messages carefully
- Test connection with `tsx scripts/test-postgres-connection.ts`
- Verify setup with `tsx scripts/verify-postgres-data.ts`

**Resources:**
- Supabase Docs: https://supabase.com/docs/guides/database
- PostgreSQL Connection Issues: https://supabase.com/docs/guides/database/connecting-to-postgres
- Vercel Environment Variables: https://vercel.com/docs/projects/environment-variables
