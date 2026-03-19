# PostgreSQL Migration Checklist

**CRITICAL:** First paying customer data is at risk. Complete this migration IMMEDIATELY.

## Pre-Migration Verification

- [ ] **Backup existing SQLite database**
  ```bash
  cp data/taxbridge.db data/taxbridge.db.backup-$(date +%Y%m%d)
  ```
  **Location:** `/Users/michaelguo/hivemind-projects/cross-border-tax/data/taxbridge.db`

- [ ] **Verify current customer data exists**
  ```bash
  sqlite3 data/taxbridge.db "SELECT COUNT(*) FROM user_profiles;"
  sqlite3 data/taxbridge.db "SELECT COUNT(*) FROM rsu_entries;"
  ```

## Supabase Setup (Recommended)

### Step 1: Create Supabase Account
- [ ] Go to https://supabase.com
- [ ] Click "Start your project" or "Sign In"
- [ ] Sign up with GitHub (recommended) or email
- [ ] Verify email if required

### Step 2: Create New Project
- [ ] Click "New Project" button in dashboard
- [ ] Fill in project details:
  - **Project name:** `taxbridge-production` (or your choice)
  - **Database password:** Generate a strong password (SAVE THIS - you'll need it)
  - **Region:** Choose closest to your users (e.g., `us-east-1` for USA/Canada)
  - **Pricing plan:** Select "Free" tier (includes 500MB database, automatic backups)
- [ ] Click "Create new project"
- [ ] **Wait 2-3 minutes** for project provisioning (progress bar shows status)

### Step 3: Get Database Connection String
- [ ] Once project is ready, click on your project in the dashboard
- [ ] In the left sidebar, click **"Project Settings"** (gear icon at bottom)
- [ ] Click **"Database"** in the settings menu
- [ ] Scroll down to **"Connection string"** section
- [ ] Select **"URI"** tab (not "Transaction pooler" or "Session pooler")
- [ ] Copy the connection string - it looks like:
  ```
  postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijklm.supabase.co:5432/postgres
  ```
- [ ] Replace `[YOUR-PASSWORD]` with the database password you created in Step 2
- [ ] **Save this connection string securely** (you'll need it next)

**Example connection string:**
```
postgresql://postgres:MySecureP@ssw0rd123@db.xyzprojectref.supabase.co:5432/postgres
```

### Step 4: Configure Local Environment
- [ ] Open your project in terminal/code editor
- [ ] Create or edit `.env.production` file in project root:
  ```bash
  # In project root: /Users/michaelguo/hivemind-projects/cross-border-tax/
  nano .env.production
  ```
- [ ] Add the DATABASE_URL variable:
  ```bash
  # PostgreSQL Connection (Production)
  DATABASE_URL=postgresql://postgres:YourPassword@db.yourproject.supabase.co:5432/postgres
  ```
- [ ] Save and close the file
- [ ] **Verify the file exists:**
  ```bash
  ls -la .env.production
  cat .env.production
  ```

### Step 5: Configure Vercel Environment Variables
- [ ] Go to https://vercel.com/dashboard
- [ ] Select the `cross-border-tax` project
- [ ] Click **"Settings"** tab at the top
- [ ] Click **"Environment Variables"** in the left sidebar
- [ ] Add new environment variable:
  - **Key:** `DATABASE_URL`
  - **Value:** Your Supabase connection string (from Step 3)
  - **Environment:** Check ✅ **Production** (and optionally Preview)
- [ ] Click **"Save"**
- [ ] **Important:** Environment variables only apply to NEW deployments

## Database Migration Execution

### Step 6: Test Connection Locally
- [ ] Load production environment:
  ```bash
  export $(cat .env.production | xargs)
  ```
- [ ] Run connection test script:
  ```bash
  tsx scripts/test-postgres-connection.ts
  ```
- [ ] **Expected output:**
  ```
  ✓ PostgreSQL connection successful
  ✓ Database version: PostgreSQL 15.x
  ✓ Connection test passed
  ```
- [ ] If errors occur, check:
  - [ ] Password is correct (no special characters causing issues)
  - [ ] Connection string format is exact
  - [ ] No extra spaces in .env.production file
  - [ ] Supabase project is fully provisioned (not still initializing)

### Step 7: Initialize PostgreSQL Schema
- [ ] Run the initialization script:
  ```bash
  tsx scripts/init-postgres-db.ts
  ```
- [ ] **Expected output:**
  ```
  🚀 Initializing PostgreSQL database...
  ✓ Database schema initialized successfully
  ✓ All migrations completed
  ✅ PostgreSQL database ready for production
  ```
- [ ] Verify tables were created (in Supabase dashboard):
  - [ ] Go to Supabase project → **"Table Editor"** (left sidebar)
  - [ ] You should see tables: `user_profiles`, `rsu_entries`, `tax_calculations`, etc.

### Step 8: Migrate Existing Data (if applicable)
⚠️ **ONLY IF YOU HAVE EXISTING CUSTOMER DATA IN SQLITE**

- [ ] Export data from SQLite:
  ```bash
  tsx scripts/export-sqlite-data.ts
  ```
- [ ] Review exported data in `data/postgres-migration/`
- [ ] Import data to PostgreSQL:
  ```bash
  tsx scripts/import-to-postgres.ts
  ```
- [ ] Verify data migrated correctly:
  ```bash
  tsx scripts/verify-postgres-data.ts
  ```

## Testing & Validation

### Step 9: Test Application Locally with PostgreSQL
- [ ] Load production environment:
  ```bash
  export $(cat .env.production | xargs)
  ```
- [ ] Start development server:
  ```bash
  npm run dev
  ```
- [ ] Test key functionality:
  - [ ] User registration/login works
  - [ ] RSU entry creation works
  - [ ] Tax calculations are saved
  - [ ] Data persists after server restart
- [ ] Check application logs for database connection messages:
  ```
  [DB] Using PostgreSQL database
  ```

### Step 10: Verify Data Persistence
- [ ] Create a test entry in the application
- [ ] Note the entry details (or take screenshot)
- [ ] Stop the dev server (Ctrl+C)
- [ ] Restart the dev server:
  ```bash
  npm run dev
  ```
- [ ] **Verify the test entry is still there** (data persisted)
- [ ] Check in Supabase dashboard:
  - [ ] Go to **"Table Editor"**
  - [ ] Select `rsu_entries` table
  - [ ] Your test entry should be visible

### Step 11: Build Verification
- [ ] Ensure no build errors with PostgreSQL:
  ```bash
  npm run build
  ```
- [ ] **Expected:** Build completes with zero errors
- [ ] If build fails:
  - [ ] Review error messages
  - [ ] Check for any SQLite-specific code still in use
  - [ ] Verify all database queries use the unified layer

## Production Deployment

### Step 12: Deploy to Vercel
- [ ] Commit all changes:
  ```bash
  git add -A
  git commit -m "[P0-CRITICAL] Complete PostgreSQL migration"
  git push origin main
  ```
- [ ] **Vercel will automatically deploy** (if auto-deploy enabled)
- [ ] OR manually trigger deployment in Vercel dashboard:
  - [ ] Go to Vercel project → **"Deployments"** tab
  - [ ] Click **"Redeploy"** on the latest commit
  - [ ] Wait for deployment to complete (~2-3 minutes)

### Step 13: Verify Production Deployment
- [ ] Visit production URL: https://taxbridge.app (or your domain)
- [ ] Check deployment logs in Vercel:
  - [ ] Go to **"Deployments"** → Click latest deployment
  - [ ] Click **"Functions"** tab
  - [ ] Look for database connection logs: `[DB] Using PostgreSQL database`
- [ ] Test critical flows in production:
  - [ ] User signup/login
  - [ ] Create RSU entry
  - [ ] View dashboard
  - [ ] Generate tax report

### Step 14: Post-Deployment Verification
- [ ] Create a test entry in production
- [ ] Wait 5 minutes
- [ ] Trigger a new deployment (to simulate Vercel's ephemeral filesystem reset):
  ```bash
  # Make a small change and redeploy
  git commit --allow-empty -m "Test deployment persistence"
  git push origin main
  ```
- [ ] **CRITICAL CHECK:** Verify the test entry from before still exists
- [ ] If data persists → ✅ Migration successful!
- [ ] If data lost → ❌ DATABASE_URL not properly set in Vercel

## Backup Configuration

### Step 15: Enable Automatic Backups
- [ ] In Supabase dashboard:
  - [ ] Go to **"Settings"** → **"Database"**
  - [ ] Scroll to **"Backups"** section
  - [ ] **Free tier:** Automatic backups enabled (7-day retention)
  - [ ] Note: Backups run daily at a fixed time
- [ ] Set up manual backup reminder (weekly):
  ```bash
  # Add to your calendar or cron
  # Every Friday: Download Supabase backup from dashboard
  ```

### Step 16: Configure Point-in-Time Recovery (Optional - Paid Feature)
⚠️ **Only available on Pro plan ($25/month)**

- [ ] If critical data requires PITR:
  - [ ] Upgrade to Supabase Pro plan
  - [ ] Enable PITR in **Settings → Database → Point in Time Recovery**
  - [ ] This allows recovery to any point in the last 7 days

## Monitoring & Maintenance

### Step 17: Set Up Database Monitoring
- [ ] In Supabase dashboard:
  - [ ] Go to **"Reports"** tab
  - [ ] Review available metrics:
    - Database size
    - Connection count
    - Query performance
  - [ ] Set up email alerts (if available in your tier)

### Step 18: Create Database Access Documentation
- [ ] Document for team:
  - [ ] Supabase project URL
  - [ ] Database connection details (in password manager)
  - [ ] Backup schedule
  - [ ] Emergency restore procedures
- [ ] Store in secure location (1Password, LastPass, etc.)

## Rollback Plan (Emergency Only)

### If Migration Fails:
- [ ] Immediately revert environment variable in Vercel:
  - [ ] Go to Vercel → Settings → Environment Variables
  - [ ] Delete or comment out `DATABASE_URL`
  - [ ] Redeploy
- [ ] Application will revert to SQLite (local storage)
- [ ] Restore from SQLite backup:
  ```bash
  cp data/taxbridge.db.backup-YYYYMMDD data/taxbridge.db
  ```
- [ ] Contact support or review error logs to diagnose PostgreSQL issue

## Success Criteria

✅ **Migration is successful when ALL of these are true:**

1. [ ] Supabase project is created and accessible
2. [ ] DATABASE_URL is set in `.env.production` locally
3. [ ] DATABASE_URL is set in Vercel environment variables
4. [ ] PostgreSQL schema is initialized (all tables exist)
5. [ ] Application runs locally with PostgreSQL (confirmed in logs)
6. [ ] Application builds with zero errors
7. [ ] Production deployment uses PostgreSQL (confirmed in Vercel logs)
8. [ ] Test data persists across deployments
9. [ ] Automatic backups are enabled in Supabase
10. [ ] Customer data (if any) is migrated and verified

## Timeline Estimate

- **Total time:** 30-45 minutes for new setup
- **Breakdown:**
  - Supabase account + project creation: 5-10 minutes
  - Environment configuration: 5 minutes
  - Schema initialization: 2-3 minutes
  - Testing locally: 10-15 minutes
  - Production deployment + verification: 10-15 minutes

## Troubleshooting

### "Cannot connect to database"
- **Check:** DATABASE_URL format is correct
- **Check:** Password has no unescaped special characters
- **Check:** Supabase project is fully provisioned (not in "Building" state)
- **Fix:** Try connection pooler URL instead of direct connection

### "Relation does not exist"
- **Check:** Schema initialization script ran successfully
- **Fix:** Run `tsx scripts/init-postgres-db.ts` again

### "Too many connections"
- **Check:** Connection pool settings in `lib/db/postgres.ts`
- **Fix:** Reduce `max: 20` to `max: 10` in pool config

### "SSL required" error
- **Fix:** Append `?sslmode=require` to DATABASE_URL:
  ```
  DATABASE_URL=postgresql://...postgres?sslmode=require
  ```

### Data not persisting in production
- **Most likely cause:** DATABASE_URL not set in Vercel
- **Fix:** Verify environment variable is set in Vercel dashboard
- **Fix:** Trigger new deployment after adding variable

## Support Resources

- **Supabase Docs:** https://supabase.com/docs/guides/database
- **PostgreSQL Connection Issues:** https://supabase.com/docs/guides/database/connecting-to-postgres
- **Vercel Environment Variables:** https://vercel.com/docs/projects/environment-variables
- **Migration Guide:** `docs/POSTGRES_MIGRATION.md`

---

**Questions or Issues?**
- Review error messages carefully
- Check all checkboxes were completed in order
- Verify connection string has no typos or extra spaces
- Test locally first before deploying to production
