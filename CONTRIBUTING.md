# Contributing to TaxBridge

Thank you for contributing to TaxBridge! This document outlines the workflow and standards for all engineers.

---

## ⚠️ CRITICAL: Deployment Workflow

**READ THIS BEFORE YOUR FIRST COMMIT**

### The Golden Rule

**GitHub = Staging | Vercel = Production | Manual Deployment Only**

You are responsible for:
1. ✅ Writing production-quality code
2. ✅ Ensuring zero build errors
3. ✅ Pushing working code to GitHub

You are NOT responsible for:
1. ❌ Deploying to Vercel
2. ❌ Managing production environments
3. ❌ Running hosting platform CLI commands

### Required Workflow (No Exceptions)

```bash
# 1. Make your changes
# ... write code ...

# 2. REQUIRED: Verify build passes with zero errors
npm run build

# If build fails → fix all errors → try again
# If build passes → proceed to step 3

# 3. Run linter
npm run lint

# 4. Run relevant tests
npm test                    # Unit tests
npm run test:e2e           # E2E tests (if UI changes)

# 5. Commit with descriptive message
git add -A
git commit -m "feat: Add tax calculation for TN visa holders"

# 6. Push to GitHub
git push origin main

# 7. STOP - Do NOT deploy to Vercel
# Michael handles production deployment manually
```

### Automated Pre-Commit Checks

The project enforces these checks before allowing commits:
- ✅ `npm run build` must pass (TypeScript compilation)
- ✅ `npm run lint` must pass (ESLint)
- ✅ No console.log statements in production code
- ✅ No TODO comments in critical paths

### What Happens After You Push?

1. Your code is now on GitHub (staging)
2. Michael reviews the changes
3. Michael runs production health checks
4. Manual deployment to Vercel
5. Post-deployment monitoring (Sentry, PostHog, Stripe)

---

## 🏗️ Development Standards

### Code Quality Requirements

**TypeScript:**
- ✅ Strict mode enabled
- ✅ No `any` types (use `unknown` or specific types)
- ✅ All props properly typed
- ✅ No TypeScript errors (build must pass)

**ESLint:**
- ✅ All ESLint rules must pass
- ✅ No unused variables
- ✅ Consistent formatting
- ✅ Accessibility linting enabled

**Testing:**
- ✅ Unit tests for business logic (tax calculations, validation)
- ✅ E2E tests for critical user flows (signup, payment, calculations)
- ✅ Minimum 80% coverage for core modules

### File Organization

```
/app
  /(auth)              # Auth-protected routes
  /api                 # API routes
  /[feature]           # Feature-based routing
    /page.tsx          # Main page component
    /loading.tsx       # Loading skeleton
    /error.tsx         # Error boundary

/components
  /ui                  # Reusable UI components (shadcn)
  /[feature]           # Feature-specific components

/lib
  /db                  # Database operations
  /tax                 # Tax calculation engine
  /stripe              # Payment processing
  /utils               # Shared utilities
  /validators          # Zod schemas

/tests
  /e2e                 # Playwright E2E tests
```

### Component Standards

**React Components:**
```typescript
// ✅ Good: Server component by default
export default async function TaxCalculator() {
  const data = await fetchData()
  return <div>{data}</div>
}

// ✅ Good: Client component when needed
'use client'
export default function InteractiveForm() {
  const [state, setState] = useState()
  return <form>...</form>
}

// ❌ Bad: Unnecessary 'use client'
'use client'  // Not needed!
export default function StaticContent() {
  return <div>Static content</div>
}
```

**Props Types:**
```typescript
// ✅ Good: Explicit interface
interface TaxFormProps {
  initialData: TaxData
  onSubmit: (data: TaxData) => Promise<void>
}

// ❌ Bad: Inline props
export default function TaxForm({ initialData, onSubmit }: { initialData: any, onSubmit: any }) {
```

### Tax Calculation Standards

**Critical: Tax calculations must be:**
- ✅ Tested with real-world scenarios
- ✅ Verified against IRS/CRA documentation
- ✅ Peer-reviewed before merging
- ✅ Include unit tests with expected outputs

Example test coverage:
```typescript
describe('calculateUSTax', () => {
  it('calculates correctly for H-1B with RSUs < $100k', () => {
    expect(calculateUSTax({ income: 80000, rsus: 20000, visa: 'H1B' }))
      .toEqual({ federal: 18450, state: 4200 })
  })

  it('handles 83(b) election correctly', () => {
    // Test 83(b) election taxation
  })
})
```

---

## 🧪 Testing Requirements

### Unit Tests (Vitest)

**Required for:**
- Tax calculation functions
- Form validation logic
- Utility functions
- API route handlers

```bash
# Run tests
npm test

# Watch mode during development
npm run test:watch

# Visual UI
npm run test:ui
```

### E2E Tests (Playwright)

**Required for:**
- User signup flow
- Payment processing (Stripe)
- Tax calculator interactions
- Form submissions
- Mobile responsive behavior

```bash
# All browsers
npm run test:e2e

# Specific browser
npm run test:e2e:chrome
npm run test:e2e:firefox
npm run test:e2e:safari

# Mobile
npm run test:e2e:mobile
```

**E2E Test Checklist:**
- ✅ Happy path (successful flow)
- ✅ Error handling (invalid inputs)
- ✅ Edge cases (boundary values)
- ✅ Mobile responsiveness
- ✅ Accessibility (keyboard navigation)

---

## 🎨 UI/UX Standards

### Design System

- **Components:** Radix UI + shadcn
- **Styling:** Tailwind CSS
- **Icons:** Lucide React
- **Fonts:** Inter (sans-serif)

### Accessibility (WCAG 2.1 AA)

**Required:**
- ✅ Semantic HTML (`<nav>`, `<main>`, `<article>`)
- ✅ ARIA labels for interactive elements
- ✅ Keyboard navigation (Tab, Enter, Esc)
- ✅ Color contrast ratio ≥ 4.5:1
- ✅ Focus indicators visible
- ✅ Screen reader tested

**Example:**
```typescript
// ✅ Good: Accessible button
<button
  aria-label="Calculate taxes"
  className="focus:ring-2 focus:ring-blue-500"
>
  Calculate
</button>

// ❌ Bad: Non-semantic, no ARIA
<div onClick={handleClick}>
  Click here
</div>
```

### Mobile Responsiveness

**Requirements:**
- ✅ Touch targets ≥ 44×44px
- ✅ Responsive breakpoints (sm, md, lg, xl)
- ✅ Mobile keyboard support (`inputMode` attributes)
- ✅ Tested on real devices (iOS + Android)

---

## 💳 Payment/Stripe Standards

### Critical Payment Rules

**NEVER:**
- ❌ Test payment flows with production Stripe keys
- ❌ Skip webhook signature verification
- ❌ Log sensitive payment data (card numbers, CVVs)
- ❌ Store card details (use Stripe tokens only)

**ALWAYS:**
- ✅ Use test mode for development (`pk_test_`, `sk_test_`)
- ✅ Verify webhook signatures
- ✅ Handle payment failures gracefully
- ✅ Log payment events to Sentry (without PII)
- ✅ Test subscription lifecycle (trial → paid → cancel)

```typescript
// ✅ Good: Webhook verification
const signature = headers.get('stripe-signature')
const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

// ❌ Bad: No verification
const event = JSON.parse(body)  // Insecure!
```

---

## 🗄️ Database Standards

### Schema Migrations

**Always:**
- ✅ Create migration scripts (`scripts/migrate-*.ts`)
- ✅ Test migrations on copy of production data
- ✅ Include rollback procedure
- ✅ Document breaking changes

```bash
# Create migration
npm run db:migrate:my-feature

# Test migration
cp data/taxbridge.db data/taxbridge.backup.db
npm run db:migrate:my-feature
```

### Query Standards

```typescript
// ✅ Good: Parameterized queries
db.prepare('SELECT * FROM users WHERE id = ?').get(userId)

// ❌ Bad: SQL injection risk
db.prepare(`SELECT * FROM users WHERE id = ${userId}`).get()
```

---

## 📊 Analytics & Monitoring

### PostHog Event Tracking

**Required events:**
- `signup_completed`
- `payment_initiated`
- `payment_completed`
- `tax_calculation_completed`
- `trial_expired`

```typescript
// Track events
posthog.capture('tax_calculation_completed', {
  income: 80000,
  visa_type: 'H1B',
  calculation_time_ms: 150
})
```

### Sentry Error Tracking

**Required:**
- ✅ Capture exceptions in try-catch blocks
- ✅ Add context to error reports
- ✅ Set user context (no PII)
- ✅ Track performance

```typescript
// Good error handling
try {
  await processPayment()
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'payment' },
    extra: { amount: paymentAmount }
  })
  throw error
}
```

---

## 🚨 Common Mistakes to Avoid

### 1. Skipping Build Verification
```bash
# ❌ Bad: Commit without building
git commit -m "fix: typo"
git push

# ✅ Good: Always build first
npm run build  # Must pass!
git commit -m "fix: typo"
git push
```

### 2. Using Vercel CLI
```bash
# ❌ BAD - NEVER DO THIS
vercel deploy
vercel --prod

# ✅ Good: Just push to GitHub
git push origin main
# Michael handles deployment
```

### 3. Hardcoding Configuration
```typescript
// ❌ Bad: Hardcoded values
const stripeKey = 'pk_test_abc123'

// ✅ Good: Environment variables
const stripeKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

### 4. Ignoring TypeScript Errors
```bash
# ❌ Bad: Suppress errors
// @ts-ignore
const result = calculateTax(data)

# ✅ Good: Fix the types
const result: TaxResult = calculateTax(data)
```

### 5. Console Logs in Production
```typescript
// ❌ Bad: Debug logs everywhere
console.log('User data:', user)

// ✅ Good: Remove before commit or use logger
logger.info('User logged in', { userId: user.id })
```

---

## 📝 Commit Message Standards

### Format
```
type(scope): Brief description

Longer description if needed.

Closes #123
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `refactor`: Code restructuring
- `test`: Add/update tests
- `docs`: Documentation
- `style`: Formatting (no logic change)
- `chore`: Maintenance (deps, config)

### Examples
```bash
# ✅ Good
git commit -m "feat(tax): Add TN visa tax calculation"
git commit -m "fix(payment): Handle Stripe webhook retry logic"
git commit -m "test(calculator): Add edge cases for RSU taxation"

# ❌ Bad
git commit -m "fixed stuff"
git commit -m "WIP"
git commit -m "changes"
```

---

## 🎯 Pull Request Checklist

Before pushing to `main`:

- [ ] `npm run build` passes with zero errors
- [ ] `npm run lint` passes
- [ ] `npm test` passes (unit tests)
- [ ] `npm run test:e2e` passes (if UI changes)
- [ ] No `console.log` statements
- [ ] No TypeScript `any` types
- [ ] Accessibility checked (keyboard + screen reader)
- [ ] Mobile responsive (tested on real device)
- [ ] Error handling implemented
- [ ] Analytics events added (if new feature)
- [ ] Database migrations tested (if schema changes)
- [ ] Sentry error tracking configured

---

## 🆘 Getting Help

### Build Errors
1. Read the error message carefully
2. Check TypeScript types
3. Verify all imports exist
4. Check for circular dependencies

### Test Failures
1. Run specific test: `npm test -- calculator.test.ts`
2. Use watch mode: `npm run test:watch`
3. Add debug output: `console.log` in test only

### Deployment Questions
**Don't worry about deployment.** Focus on:
- ✅ Writing quality code
- ✅ Passing all checks
- ✅ Pushing to GitHub

Michael handles production deployment.

---

## 🎓 Learning Resources

### Next.js
- [Next.js App Router Docs](https://nextjs.org/docs)
- [Server vs Client Components](https://nextjs.org/docs/app/building-your-application/rendering)

### Stripe
- [Stripe Testing](https://stripe.com/docs/testing)
- [Webhook Best Practices](https://stripe.com/docs/webhooks/best-practices)

### Accessibility
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [Radix UI Accessibility](https://www.radix-ui.com/primitives/docs/overview/accessibility)

---

## 🚀 Ready to Contribute?

1. Read this document thoroughly
2. Set up development environment (`npm install`, `npm run db:init`)
3. Make your changes
4. **Run `npm run build`** (must pass!)
5. Push to GitHub
6. Let Michael handle deployment

**Remember:** Real customers, real money, production quality only.

---

Questions? Check [CLAUDE.md](./CLAUDE.md) or ask in team chat.
