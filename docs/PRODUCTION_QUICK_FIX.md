# ⚡️ Production Deployment Quick Fix - IMMEDIATE ACTIONS

**Current Status:** ❌ taxbridgecpa.com is DOWN + Vercel deployment is STALE

---

## 🔥 URGENT: Do These NOW (30 minutes)

### 1. Fix Custom Domain (10 min)
```bash
# In Vercel Dashboard:
1. Go to Settings → Domains
2. Click "Add Domain"
3. Enter: taxbridgecpa.com
4. Copy the DNS records Vercel provides
5. Go to your domain registrar (GoDaddy/Namecheap/etc)
6. Add CNAME record: taxbridgecpa.com → cname.vercel-dns.com
7. Wait 5-30 minutes for DNS propagation
8. Test: curl -I https://taxbridgecpa.com
```

### 2. Deploy Latest Code (5 min)
```bash
# In Vercel Dashboard:
1. Go to Deployments
2. Click "Redeploy" on latest commit (769757d)
3. OR: Trigger new deploy from GitHub main branch
4. Wait 2-3 minutes for build
5. Verify: https://cross-border-tax.vercel.app/pricing returns 200 OK
```

### 3. Activate Stripe Production (15 min)
```bash
# In Stripe Dashboard:
1. Toggle to "Production" mode (top right)
2. Go to Developers → API Keys
3. Copy "Publishable key" (starts with pk_live_)
4. Click "Reveal live key token" → Copy "Secret key" (starts with sk_live_)

# In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Edit STRIPE_SECRET_KEY → paste sk_live_...
3. Edit NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY → paste pk_live_...
4. Click "Save"
5. Redeploy the app (Deployments → Redeploy)

# Create Products:
1. Stripe Dashboard → Products → Add Product
   - Name: "Pro Plan"
   - Price: $49 USD (one-time)
   - Copy the price ID (starts with price_)
2. Add STRIPE_PRO_PRICE_ID to Vercel env vars
3. Repeat for Enterprise ($299)
```

---

## ✅ Smoke Test (10 min)

After deployment, test these flows:

### Test 1: Domain Resolution
```bash
curl -I https://taxbridgecpa.com
# Expected: HTTP/2 200
```

### Test 2: Calculator Loads
```bash
# Visit: https://taxbridgecpa.com/dashboard
# Expected: See calculator form, no errors
```

### Test 3: Pricing Page
```bash
# Visit: https://taxbridgecpa.com/pricing
# Expected: See Pro ($49) and Enterprise ($299) plans
```

### Test 4: Stripe Checkout (CRITICAL)
```bash
# 1. Visit: https://taxbridgecpa.com/pricing
# 2. Click "Get Pro" button
# 3. Stripe checkout should open
# 4. Use test card: 4242 4242 4242 4242 (any future date, any CVC)
# 5. Complete checkout
# 6. Expected: Success message, user upgraded to Pro
```

---

## ⚠️  Current Blockers

| Blocker | Status | Action |
|---------|--------|--------|
| Domain DNS not resolving | 🔴 DOWN | Add domain in Vercel + update DNS |
| Stale deployment (/pricing 404) | 🔴 CRITICAL | Redeploy latest commit |
| Stripe in test mode | 🔴 REVENUE BLOCKER | Switch to production keys |
| Environment vars are placeholders | 🔴 CRITICAL | Update in Vercel dashboard |

---

## 📋 Full Environment Variables Needed

**Copy these to Vercel Dashboard → Settings → Environment Variables:**

### Stripe (CRITICAL - Required for revenue)
- `STRIPE_SECRET_KEY` = `sk_live_...` (from Stripe dashboard)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...`
- `STRIPE_WEBHOOK_SECRET` = `whsec_...` (after creating webhook)
- `STRIPE_PRO_PRICE_ID` = `price_...` (from product creation)
- `STRIPE_ENTERPRISE_PRICE_ID` = `price_...`

### Clerk Auth (CRITICAL - Required for login)
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` = `pk_live_...`
- `CLERK_SECRET_KEY` = `sk_live_...`

### Optional (Can add later)
- `ANTHROPIC_API_KEY` (AI advisor)
- `SENDGRID_API_KEY` (emails)
- `NEXT_PUBLIC_SENTRY_DSN` (error tracking)
- `NEXT_PUBLIC_POSTHOG_KEY` (analytics)

---

## 🎯 Success = All Green

- ✅ https://taxbridgecpa.com loads homepage
- ✅ https://taxbridgecpa.com/dashboard shows calculator
- ✅ https://taxbridgecpa.com/pricing shows plans
- ✅ Stripe checkout completes successfully
- ✅ User can sign up/log in
- ✅ No console errors

---

## 🆘 If Something Fails

### Domain still not resolving after 1 hour?
- Check DNS propagation: https://dnschecker.org
- Use Vercel URL as temporary: https://cross-border-tax.vercel.app
- Contact domain registrar support

### Stripe checkout fails?
- Verify keys start with `pk_live_` and `sk_live_` (NOT `pk_test_`)
- Check Stripe Dashboard → Logs for errors
- Ensure webhook endpoint created: https://taxbridgecpa.com/api/stripe/webhook

### Build fails?
- Check Vercel deployment logs
- Verify all required env vars are set
- Test locally: `npm run build`

---

**Full detailed report:** [PRODUCTION_DEPLOYMENT_STATUS_REPORT.md](./PRODUCTION_DEPLOYMENT_STATUS_REPORT.md)
