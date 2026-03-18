-- ============================================================
-- Live Payment Test - Database Verification Queries
-- ============================================================
-- Use these queries during the live payment test to verify
-- database state at each step
--
-- Usage: sqlite3 data/taxbridge.db < scripts/payment-test-db-queries.sql
-- Or run individual queries as needed
-- ============================================================

-- ============================================================
-- PART 1: Initial State Verification
-- ============================================================

-- Find test account (replace %livetest% with actual email pattern)
.mode column
.headers on
.width 5 35 12 20 15

SELECT
  id,
  email,
  subscription_tier,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status,
  created_at
FROM user_profiles
WHERE email LIKE '%livetest%'
ORDER BY created_at DESC
LIMIT 5;

-- Expected Result (before payment):
-- subscription_tier: free
-- stripe_customer_id: NULL
-- stripe_subscription_id: NULL
-- subscription_status: NULL or 'inactive'

.print ''
.print '--------------------------------------------------------'
.print 'Initial State Check Complete'
.print 'Expected: tier=free, no Stripe IDs'
.print '--------------------------------------------------------'
.print ''

-- ============================================================
-- PART 2: Post-Payment Verification
-- ============================================================

-- Check if tier upgraded to 'pro' after payment
-- Run this query ~30 seconds after completing Stripe Checkout

SELECT
  id,
  email,
  subscription_tier,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status,
  updated_at
FROM user_profiles
WHERE email LIKE '%livetest%';

-- Expected Result (after payment):
-- subscription_tier: pro
-- stripe_customer_id: cus_... (starts with 'cus_')
-- stripe_subscription_id: sub_... (starts with 'sub_')
-- subscription_status: active

.print ''
.print '--------------------------------------------------------'
.print 'Post-Payment Check Complete'
.print 'Expected: tier=pro, Stripe IDs populated, status=active'
.print '--------------------------------------------------------'
.print ''

-- ============================================================
-- PART 3: Pro Feature Usage Verification
-- ============================================================

-- Count RSU entries created during test
-- Free tier allows 1 entry, Pro allows unlimited
-- Test should create 5+ entries

SELECT
  up.email,
  COUNT(rsu.id) as rsu_entry_count,
  up.subscription_tier
FROM user_profiles up
LEFT JOIN rsu_entries rsu ON rsu.user_id = up.id
WHERE up.email LIKE '%livetest%'
GROUP BY up.id;

-- Expected Result (during Pro testing):
-- rsu_entry_count: 5 or more
-- subscription_tier: pro

.print ''
.print '--------------------------------------------------------'
.print 'Pro Features Usage Check Complete'
.print 'Expected: 5+ RSU entries created'
.print '--------------------------------------------------------'
.print ''

-- ============================================================
-- PART 4: Post-Refund Downgrade Verification
-- ============================================================

-- Check if tier downgraded to 'free' after refund
-- Run this query ~5 minutes after processing refund in Stripe Dashboard

SELECT
  id,
  email,
  subscription_tier,
  stripe_customer_id,
  stripe_subscription_id,
  subscription_status,
  updated_at
FROM user_profiles
WHERE email LIKE '%livetest%';

-- Expected Result (after refund):
-- subscription_tier: free
-- stripe_customer_id: cus_... (PRESERVED - not deleted)
-- stripe_subscription_id: sub_... (PRESERVED - for audit trail)
-- subscription_status: canceled

.print ''
.print '--------------------------------------------------------'
.print 'Post-Refund Downgrade Check Complete'
.print 'Expected: tier=free, status=canceled, Stripe IDs preserved'
.print '--------------------------------------------------------'
.print ''

-- ============================================================
-- PART 5: Data Preservation Verification
-- ============================================================

-- Verify RSU entries are NOT deleted after downgrade
-- User data should be preserved even after cancellation

SELECT
  up.email,
  COUNT(rsu.id) as rsu_entry_count,
  up.subscription_tier,
  up.subscription_status
FROM user_profiles up
LEFT JOIN rsu_entries rsu ON rsu.user_id = up.id
WHERE up.email LIKE '%livetest%'
GROUP BY up.id;

-- Expected Result (after downgrade):
-- rsu_entry_count: 5 or more (SAME as before, not deleted)
-- subscription_tier: free
-- subscription_status: canceled

.print ''
.print '--------------------------------------------------------'
.print 'Data Preservation Check Complete'
.print 'Expected: All RSU entries still exist (count unchanged)'
.print '--------------------------------------------------------'
.print ''

-- ============================================================
-- PART 6: Audit Trail
-- ============================================================

-- Full audit trail for test account
-- Shows complete history of subscription changes

SELECT
  id,
  email,
  subscription_tier,
  subscription_status,
  stripe_customer_id,
  stripe_subscription_id,
  created_at,
  updated_at
FROM user_profiles
WHERE email LIKE '%livetest%';

.print ''
.print '--------------------------------------------------------'
.print 'Audit Trail Complete'
.print 'Review: created_at vs updated_at timestamps'
.print '--------------------------------------------------------'
.print ''

-- ============================================================
-- HELPER QUERIES (copy and customize as needed)
-- ============================================================

-- Query by specific user ID (replace X with actual ID)
-- SELECT * FROM user_profiles WHERE id = X;

-- Query by Stripe customer ID
-- SELECT * FROM user_profiles WHERE stripe_customer_id = 'cus_XXXXX';

-- Query by Stripe subscription ID
-- SELECT * FROM user_profiles WHERE stripe_subscription_id = 'sub_XXXXX';

-- Count all Pro users (sanity check)
-- SELECT COUNT(*) as pro_user_count FROM user_profiles WHERE subscription_tier = 'pro';

-- List all RSU entries for a specific user
-- SELECT * FROM rsu_entries WHERE user_id = X ORDER BY vest_date DESC;
