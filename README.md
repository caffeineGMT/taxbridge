# TaxBridge - US-Canada Cross-Border Tax Calculator

Production-quality tax calculation tool for H-1B/TN visa workers with RSUs working across US-Canada borders.

**Revenue Target:** $1M ARR

---

## 🚨 DEPLOYMENT WORKFLOW - READ THIS FIRST

**GitHub is STAGING. Vercel is PRODUCTION. Manual deployment only.**

### Every Engineer Must Follow:

1. ✅ **Write code** → Make your changes
2. ✅ **Verify build** → `npm run build` (MUST pass with ZERO errors)
3. ✅ **Fix errors** → Address all TypeScript/ESLint issues before committing
4. ✅ **Commit** → `git add -A && git commit -m "descriptive message"`
5. ✅ **Push to GitHub** → `git push origin main`
6. ⛔ **STOP** → Michael handles Vercel production deployment manually

### Absolute Rules:

- ❌ **NEVER** run `vercel`, `vercel deploy`, or any Vercel CLI commands
- ❌ **NEVER** auto-deploy to hosting platforms
- ❌ **NEVER** skip build verification (`npm run build` must pass)
- ✅ **ALWAYS** push working, error-free code to GitHub
- ✅ **ALWAYS** verify builds before committing

**Why?** Production deployment requires health checks, rollback protection, and revenue monitoring. Broken deployments = lost revenue.

See [CLAUDE.md](./CLAUDE.md) for complete deployment rules.

---

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Initialize database
npm run db:init

# Run development server
npm run dev

# Verify build (run before every commit!)
npm run build
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📋 Available Scripts

### Development
- `npm run dev` - Start dev server
- `npm run build` - **REQUIRED before every commit** - verify production build
- `npm run lint` - ESLint checks
- `npm run start` - Production server (local)

### Testing
- `npm test` - Run unit tests (Vitest)
- `npm run test:e2e` - End-to-end tests (Playwright)
- `npm run test:e2e:chrome` - Chrome browser tests
- `npm run test:e2e:firefox` - Firefox browser tests
- `npm run test:e2e:mobile` - Mobile device tests

### Database
- `npm run db:init` - Initialize SQLite database
- `npm run db:migrate` - Run migrations
- See `package.json` for all migration scripts

### Stripe/Payment
- `npm run stripe:quickstart` - Production Stripe setup
- `npm run verify:stripe` - Verify Stripe integration
- `npm run test:payment-flow` - Test payment flows

### Marketing/Launch
- `npm run launch:dashboard` - Product Hunt dashboard
- `npm run reddit:dashboard` - Reddit campaign monitoring
- `npm run seo:generate` - Generate SEO content

---

## 🏗️ Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Auth:** Clerk
- **Payments:** Stripe
- **Database:** SQLite (development) → PostgreSQL (production)
- **Analytics:** PostHog + Vercel Analytics
- **Error Tracking:** Sentry
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI
- **Testing:** Vitest + Playwright
- **Deployment:** Vercel (manual only)

---

## 📁 Project Structure

```
/app                    # Next.js App Router pages
/components            # React components
  /ui                  # Reusable UI components (shadcn)
/lib                   # Core business logic
  /db                  # Database schemas and queries
  /tax                 # Tax calculation engine
  /stripe              # Stripe integration
  /cron                # Scheduled jobs
/scripts               # Automation scripts
/tests                 # E2E tests (Playwright)
/public                # Static assets
```

---

## 🔒 Environment Variables

Create `.env.local`:

```bash
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Stripe
STRIPE_SECRET_KEY=sk_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# SendGrid
SENDGRID_API_KEY=SG...

# PostHog Analytics
NEXT_PUBLIC_POSTHOG_KEY=phc_...
NEXT_PUBLIC_POSTHOG_HOST=https://us.i.posthog.com

# Sentry
SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_DSN=https://...

# Database
DATABASE_URL=file:./data/taxbridge.db
```

---

## 🧪 Testing

### Unit Tests
```bash
npm test                  # Run once
npm run test:watch        # Watch mode
npm run test:ui           # Visual UI
```

### E2E Tests
```bash
npm run test:e2e          # All browsers
npm run test:e2e:chrome   # Chrome only
npm run test:e2e:mobile   # Mobile devices
```

**Coverage Requirements:**
- Critical user flows (signup, payment, tax calculation)
- Payment processing end-to-end
- Mobile responsiveness
- Cross-browser compatibility

---

## 🎯 Revenue-Critical Features

### Payment Flow
- Stripe integration with test/production modes
- Trial period management
- Subscription lifecycle
- Abandoned cart recovery

### Tax Calculation Engine
- US federal tax calculations
- Canada federal/provincial tax
- RSU taxation (83(b) election support)
- Cross-border scenarios (H-1B, TN visa)

### Analytics & Monitoring
- PostHog event tracking
- Sentry error monitoring
- Stripe revenue dashboards
- A/B testing infrastructure

---

## 🐛 Debugging

### Build Errors
```bash
# Always run this before committing
npm run build

# If it fails, fix ALL errors before pushing
# TypeScript errors = no commit
# ESLint errors = no commit
```

### Database Issues
```bash
# Reset database
rm data/taxbridge.db
npm run db:init
```

### Payment Testing
```bash
# Verify Stripe integration
npm run verify:stripe

# Test full payment flow
npm run test:payment-flow
```

---

## 📈 Production Quality Standards

- ✅ Zero build errors (TypeScript + ESLint)
- ✅ All E2E tests passing
- ✅ Mobile responsive (tested on real devices)
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Lighthouse score > 90
- ✅ Sentry error monitoring configured
- ✅ PostHog analytics tracking key events
- ✅ Stripe webhook handling with retries

**Remember:** Real customers. Real money. Production-quality only.

---

## 🚀 Deployment (Manual Only)

**Engineers:** You are NOT responsible for deployment. Your job ends at pushing error-free code to GitHub.

**Michael's Deployment Checklist:**
1. Pull latest from `main`
2. Run `npm run build` locally
3. Run E2E tests (`npm run test:e2e`)
4. Deploy to Vercel production
5. Verify health checks
6. Monitor Sentry for errors
7. Check Stripe webhooks
8. Monitor PostHog for traffic

---

## 📞 Support

- **Bugs:** Create GitHub issue
- **Questions:** Check CLAUDE.md or ask in team chat
- **Deployment Issues:** Contact Michael

---

## 📝 License

Proprietary - TaxBridge © 2026
