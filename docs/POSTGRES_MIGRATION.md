# PostgreSQL Migration Guide

## Overview

The TaxBridge application now supports both SQLite (development) and PostgreSQL (production) databases through a unified database abstraction layer.

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

1. Create account at https://supabase.com
2. Create new project
3. Go to Settings > Database
4. Copy the "Connection string" (URI format)
5. Set `DATABASE_URL` environment variable
6. Run migrations: `npm run db:init:postgres`

**Pros**: Free tier, automatic backups, built-in admin UI, connection pooling
**Cons**: Cold starts on free tier

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

### First-time Setup

```bash
# Set DATABASE_URL in .env.production
export DATABASE_URL="postgresql://..."

# Initialize schema
tsx scripts/init-postgres-db.ts

# Or use npm script
npm run db:init:postgres
```

### Running Migrations

Migrations are automatically applied when the application starts if using PostgreSQL.

To manually run migrations:

```bash
tsx scripts/run-postgres-migrations.ts
```

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

## Migration Checklist

- [x] Install `pg` and `@types/pg` packages
- [x] Create PostgreSQL schema file (`postgres-schema.sql`)
- [x] Create unified database abstraction layer (`lib/db/unified.ts`)
- [x] Update all database queries to use async/await
- [x] Create PostgreSQL migration files
- [x] Test database operations
- [ ] Set up PostgreSQL instance (Supabase/Railway/Neon)
- [ ] Configure `DATABASE_URL` environment variable
- [ ] Run initial migration
- [ ] Verify data persistence

## Testing

### Test SQLite (Development)
```bash
# Unset DATABASE_URL
unset DATABASE_URL
npm run dev
```

### Test PostgreSQL (Production)
```bash
# Set DATABASE_URL
export DATABASE_URL="postgresql://..."
npm run dev
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

## Support

For issues or questions about the migration:
- Check the migration logs in console
- Review TypeScript errors carefully
- Test queries in both SQLite and PostgreSQL
- Verify environment variables are set correctly
