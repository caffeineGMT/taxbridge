# Affiliate Program Implementation Summary

## Overview
Complete Stripe-integrated affiliate program with partner portal for TaxBridge. Law firms and CPAs can apply to become partners, earn commissions on referrals, and track their earnings through a dedicated dashboard.

## Features Implemented

### 1. Database Schema
**Migration File:** `lib/db/migrations/005_affiliate_program.sql`

**Tables Created:**
- `affiliate_partners` - Stores partner applications and referral codes
  - Fields: id, partner_name, firm_name, email, referral_code, commission_rate, status, total_referrals, total_revenue, stripe_connect_id, timestamps
  - Status: pending, approved, rejected
  - Default commission rate: 20%

- `affiliate_referrals` - Tracks individual referrals and commissions
  - Fields: id, affiliate_id, user_id, subscription_id, commission_amount, commission_status, timestamps
  - Commission status: pending, paid

- `user_profiles` - Added `referred_by` column to track referral source

**Migration Command:**
```bash
npm run db:migrate:affiliate
```

### 2. Database Queries
**File:** `lib/db/queries/affiliates.ts`

**Functions:**
- `generateReferralCode()` - Generates unique 10-character uppercase code using nanoid
- `createAffiliatePartner()` - Create new partner application
- `getAffiliatePartner()` / `getAffiliatePartnerByEmail()` / `getAffiliatePartnerByReferralCode()` - Retrieve partners
- `getAffiliatePartnersByStatus()` - Filter partners by status (pending/approved/rejected)
- `approveAffiliatePartner()` / `rejectAffiliatePartner()` - Admin approval/rejection
- `createAffiliateReferral()` - Track new referral (updates partner stats in transaction)
- `getAffiliateReferrals()` / `getAffiliateReferralsWithUser()` - Get referral history
- `getPendingCommissions()` / `getPaidCommissions()` - Commission calculations
- `updateUserReferredBy()` - Link user to referral code

### 3. Stripe Integration
**File:** `lib/stripe/affiliate-tracking.ts`

**Functions:**
- `trackAffiliateReferral()` - Called from webhook when checkout completes
  - Validates referral code
  - Checks partner is approved
  - Calculates commission based on partner's rate
  - Creates referral record
  - Updates user's referred_by field

- `getReferralCodeFromStorage()` / `saveReferralCodeToStorage()` / `clearReferralCodeFromStorage()` - Client-side localStorage helpers

**Webhook Integration:**
- Modified `app/api/stripe/webhook/route.ts`
- Added affiliate tracking to `checkout.session.completed` event
- Extracts `referred_by` from session metadata

**Checkout Integration:**
- Modified `app/api/stripe/create-checkout/route.ts`
- Accepts `referralCode` parameter
- Passes referral code to Stripe metadata as `referred_by`

### 4. Partner Signup Flow
**Page:** `app/partners/page.tsx`

**Features:**
- Multi-step form with progress indicator (4 steps):
  1. Firm Information
  2. Contact Details
  3. Commission Proposal (10-30% slider)
  4. Terms Acceptance

- Real-time commission earnings calculator
- Visual earnings examples (Pro plan: $299 → $59.80 @ 20%)
- Success confirmation screen
- Generates unique referral code on submission

**API Route:** `app/api/partners/signup/route.ts`
- POST endpoint for partner applications
- Validates required fields and email format
- Checks for duplicate email addresses (returns 409 if exists)
- Validates commission rate range (10-30%)
- Creates partner with status='pending'
- Returns success with partner_id

### 5. Partner Dashboard
**Page:** `app/partners/dashboard/[code]/page.tsx`

**Features:**
- Authentication check (user email must match partner email)
- Stats cards:
  - Total Referrals
  - Total Earned (with commission rate display)
  - Pending Payouts (with paid breakdown)

- Referral link widget:
  - Read-only input with emerald border
  - Copy button with checkmark animation
  - QR code placeholder
  - Quick tips section

- Recent referrals table:
  - Masked user IDs ("User #123")
  - Date, commission amount, status
  - Color-coded status badges (emerald=paid, amber=pending)

- Payout information section

**API Route:** `app/api/partners/dashboard/[code]/route.ts`
- GET endpoint for partner dashboard data
- Requires Clerk authentication
- Validates user email matches partner email
- Returns partner info and referrals with masked user data

### 6. Admin Dashboard
**Page:** `app/admin/partners/page.tsx`

**Features:**
- Admin authentication required (checks ADMIN_EMAILS env var)
- Stats grid:
  - Pending applications count
  - Approved partners count
  - Total referrals across all partners
  - Total commissions owed

- Status filter tabs (All/Pending/Approved/Rejected)
- Partners table with:
  - Firm/partner name with icon
  - Email, commission rate
  - Status badge
  - Stats (referrals count, revenue)
  - Created date
  - Action buttons (Approve/Reject for pending)

- Approve/Reject workflow:
  - Approve: one-click with confirmation, shows referral link in alert
  - Reject: opens modal with optional reason textarea

**API Route:** `app/api/admin/partners/route.ts`
- GET endpoint for all partners
- Admin authentication required
- Returns partners array with aggregate stats

**Approval API Route:** `app/api/partners/approve/route.ts`
- POST endpoint for approve/reject actions
- Admin authentication required
- Validates partner exists and is pending
- Updates status and timestamps
- Returns referral link on approval

### 7. Referral Tracking
**Component:** `components/ReferralTracker.tsx`

**Features:**
- Client-side component using `useSearchParams`
- Captures `?ref=` query parameter from URL
- Stores referral code in localStorage
- Added to root layout with Suspense wrapper

**Integration Points:**
- Root layout (`app/layout.tsx`) - Global referral capture
- Pricing page (`app/pricing/page.tsx`) - Reads from localStorage and passes to checkout
- Webhook (`app/api/stripe/webhook/route.ts`) - Processes commission on subscription

### 8. Design System Compliance
**Colors:**
- Primary: Emerald-500 (#10b981)
- Surface: Slate-800/900 with glass effect
- Status badges: Emerald (approved/paid), Amber (pending), Red (rejected)
- Borders: Slate-700

**Components:**
- Multi-step form with progress stepper
- Stats cards with icons (Users, DollarSign, TrendingUp, Clock)
- Glass-effect cards with backdrop blur
- Gradient backgrounds (slate-900 → emerald-900)
- Modal dialogs for rejection workflow

## User Flows

### Partner Application Flow
1. Visit `/partners`
2. Fill multi-step form (firm info → contact → commission → terms)
3. Submit application
4. Receive confirmation screen
5. Wait for admin approval email (TODO: email integration)

### Admin Approval Flow
1. Visit `/admin/partners`
2. View pending applications
3. Click "Approve" → generates referral code, sends email (TODO)
4. Or click "Reject" → enter optional reason, sends email (TODO)
5. Partner receives email with unique referral link

### Referral & Commission Flow
1. Partner shares referral link: `https://taxbridge.app?ref=ABC123XYZ0`
2. User clicks link → ReferralTracker captures code to localStorage
3. User signs up and upgrades to Pro/Enterprise
4. Checkout session includes `referred_by` in metadata
5. Webhook fires on `checkout.session.completed`
6. `trackAffiliateReferral()` validates code and creates referral record
7. Commission calculated (e.g., $299 × 20% = $59.80)
8. Partner stats updated (total_referrals++, total_revenue += commission)
9. Partner sees referral in dashboard (User #123, $59.80, Pending)

### Partner Dashboard Flow
1. Partner logs in with Clerk (same email as application)
2. Visits `/partners/dashboard/[REFERRAL_CODE]`
3. Views stats: referrals, earnings, pending payouts
4. Copies referral link to share with clients
5. Sees recent referrals table with masked user info

## Configuration

### Environment Variables
Add to `.env.local`:

```env
# App Configuration
NEXT_PUBLIC_APP_URL=https://taxbridge.app

# Admin Configuration (comma-separated list of admin emails)
ADMIN_EMAILS=admin@taxbridge.app,yourname@example.com
```

### Stripe Price IDs
Ensure these are set in `.env.local`:
- `STRIPE_PRO_PRICE_ID` - Pro plan annual subscription
- `STRIPE_ENTERPRISE_PRICE_ID` - Enterprise plan annual subscription

## Files Created/Modified

### New Files
1. `lib/db/migrations/005_affiliate_program.sql`
2. `lib/db/queries/affiliates.ts`
3. `lib/stripe/affiliate-tracking.ts`
4. `app/api/partners/signup/route.ts`
5. `app/api/partners/approve/route.ts`
6. `app/api/partners/dashboard/[code]/route.ts`
7. `app/api/admin/partners/route.ts`
8. `app/partners/page.tsx`
9. `app/partners/dashboard/[code]/page.tsx`
10. `app/admin/partners/page.tsx`
11. `components/ReferralTracker.tsx`
12. `scripts/migrate-affiliate-schema.ts`

### Modified Files
1. `app/api/stripe/webhook/route.ts` - Added affiliate tracking
2. `app/api/stripe/create-checkout/route.ts` - Added referral code metadata
3. `app/pricing/page.tsx` - Added referral code from localStorage
4. `app/layout.tsx` - Added ReferralTracker component
5. `package.json` - Added `db:migrate:affiliate` script
6. `.env.example` - Added ADMIN_EMAILS and NEXT_PUBLIC_APP_URL

## Edge Cases Handled

1. **Duplicate Applications:** Returns 409 error if email already exists
2. **Invalid Referral Codes:** Webhook logs warning but doesn't fail
3. **Unapproved Partners:** Referrals from unapproved partners are ignored
4. **Email Validation:** Regex check for valid email format
5. **Commission Rate Bounds:** Enforced 10-30% range
6. **Already Processed Applications:** Can't approve/reject a partner twice
7. **Unauthorized Dashboard Access:** User email must match partner email
8. **Admin Authorization:** Admin endpoints check ADMIN_EMAILS environment variable

## Future Enhancements (TODO)

1. **Email Notifications:**
   - Admin notification when new application submitted
   - Partner confirmation email on application submission
   - Approval email with referral link
   - Rejection email with optional reason

2. **Stripe Connect Integration:**
   - Automated monthly payouts to partners
   - Partner can connect Stripe account
   - Dashboard shows next payout date

3. **QR Code Generation:**
   - Generate QR code for referral link on dashboard
   - Downloadable for offline marketing

4. **Analytics:**
   - Conversion rate tracking (clicks → signups → paid)
   - Best performing partners leaderboard
   - Monthly performance reports

5. **Advanced Features:**
   - Tiered commission rates based on volume
   - Custom referral landing pages
   - Marketing materials download (logos, banners)
   - Referral link shortener

## Testing Checklist

- [x] Database migration runs successfully
- [ ] Partner can submit application
- [ ] Admin can view pending applications
- [ ] Admin can approve application
- [ ] Admin can reject application with reason
- [ ] Approved partner can access dashboard with authentication
- [ ] Referral code is captured from URL (?ref=CODE)
- [ ] Referral code persists in localStorage
- [ ] Checkout session includes referral code in metadata
- [ ] Webhook creates affiliate referral on successful payment
- [ ] Partner dashboard shows correct stats
- [ ] Partner can copy referral link
- [ ] Unauthorized users cannot access partner dashboard
- [ ] Non-admin users cannot access admin dashboard
- [ ] Commission calculations are correct (amount × rate)

## Revenue Model

**Example Scenario:**
- 10 law firm partners
- Average 5 clients referred per partner per year
- 80% convert to Pro ($299/year)
- Average commission rate: 20%

**Annual Commission Cost:**
- 10 partners × 5 clients × 80% conversion = 40 paid customers
- 40 customers × $299 = $11,960 revenue
- $11,960 × 20% commission = $2,392 total commissions
- Net revenue: $11,960 - $2,392 = $9,568

**Partner Earnings:**
- Per partner: 4 conversions × $299 × 20% = $239.20/year
- Top partners (10 conversions): $598/year

This affiliate program enables organic growth through professional referrals while maintaining healthy margins.
