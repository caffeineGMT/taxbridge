# [P0-CRITICAL] Clerk Production Keys - Action Plan

**Date:** March 19, 2026 at 3:04pm
**Due:** 8pm TODAY (5 hours remaining)
**Blocker:** Requires manual configuration by Michael
**Time Needed:** 30 minutes

---

## 🚨 The Problem

Site returns 500 errors because Vercel has placeholder Clerk keys:
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_YOUR_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY=sk_live_YOUR_CLERK_SECRET_KEY`  
- `CLERK_WEBHOOK_SECRET=whsec_YOUR_CLERK_WEBHOOK_SECRET`

Users cannot sign up, log in, or access protected routes.

---

## ✅ What You Need to Do (30 minutes)

### 1. Get Clerk Production Keys (5 min)

```
https://dashboard.clerk.com
→ Developers → API Keys
→ Toggle to "Production" mode
→ Copy: pk_live_... and sk_live_...
```

### 2. Create Webhook (5 min)

```
Clerk Dashboard → Webhooks → Add Endpoint
URL: https://taxbridge.vercel.app/api/webhooks/clerk
Events: user.*, session.*
→ Copy: whsec_...
```

### 3. Update Vercel Environment Variables (10 min)

```
https://vercel.com/caffeineGMT/taxbridge/settings/environment-variables

Add 3 variables (Production scope only):
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_live_...
- CLERK_SECRET_KEY = sk_live_...
- CLERK_WEBHOOK_SECRET = whsec_...
```

### 4. Redeploy (3 min)

```
https://vercel.com/caffeineGMT/taxbridge/deployments
→ Latest deployment → ⋯ → Redeploy
→ Wait 2-5 minutes
```

### 5. Verify (7 min)

```bash
npm run verify:clerk

# Manual test:
# Visit https://taxbridge.vercel.app
# Click "Sign Up" → Clerk widget should load without errors
```

---

## 📸 Evidence Required

1. Screenshot: Clerk dashboard (production keys)
2. Screenshot: Vercel environment variables (3 keys set)
3. Screenshot: Verification script output
4. Screenshot: Production site with auth working

Save to: `docs/screenshots/clerk-2026-03-19/`

Commit message must include: `+ VERIFICATION`

---

## 📚 Full Documentation

- `docs/CLERK_PRODUCTION_ACTIVATION_GUIDE.md` (comprehensive guide)
- `docs/CLERK_KEY_REPLACEMENT_GUIDE.md` (detailed steps)
- `docs/CLERK_TASK_COMPLETION_SUMMARY.md` (this sprint's work)

---

## ✅ Success = All These True

- [ ] 3 Vercel environment variables updated (Production scope)
- [ ] Keys start with pk_live_, sk_live_, whsec_ (NOT pk_test_)
- [ ] npm run verify:clerk passes
- [ ] Production site returns HTTP 200 (NOT 500)
- [ ] Can sign up and log in on https://taxbridge.vercel.app
- [ ] Screenshots captured and committed
- [ ] Commit includes + VERIFICATION tag

---

**This is a manual task. I (Alfie) cannot access Clerk or Vercel dashboards.**
**All documentation is ready. You can start immediately.** 🪶

**Next Tasks After This:**
- [P0] Replace Stripe Production Keys (DUE: 9pm)
- [P0] Replace PostHog Production Key (DUE: 8pm)
- [P1] End-to-End Revenue Test (DUE: 10pm)
