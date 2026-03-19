# A/B Test Plan: Calculator → Signup Optimization

**Test ID:** AB-2026-001
**Priority:** P0 CRITICAL
**Target Drop-off:** Calculator Completion → Signup (37.5% drop-off, 270 users/month)
**Expected Revenue Impact:** +$35,280/year
**Created:** March 19, 2026
**Status:** 📋 READY FOR IMPLEMENTATION

---

## 🎯 Test Objective

**Increase signup conversion rate from 62.5% to 85% (target: +36% improvement)**

This is the single highest-impact optimization opportunity in our conversion funnel.

---

## 📊 Baseline Metrics

### Current Performance (Last 30 Days)

| Metric | Value |
|--------|-------|
| Calculator Completions | 720/month |
| Signup Started | 450/month |
| **Conversion Rate** | **62.5%** |
| **Drop-off** | **270 users (37.5%)** |
| Benchmark (Industry) | 70-80% |
| Gap to Target | -17.5% to -7.5% |

### Revenue Impact Model

| Scenario | Signup Rate | Monthly Signups | MRR | Annual Impact |
|----------|-------------|-----------------|-----|---------------|
| **Current** | 62.5% | 450 | $4,165 | Baseline |
| **Conservative (+20%)** | 75% | 540 | $5,390 | +$14,700/yr |
| **Target (+36%)** | 85% | 612 | $7,105 | +$35,280/yr |
| **Stretch (+50%)** | 93% | 670 | $7,895 | +$44,760/yr |

---

## 🔬 Hypothesis

**Primary Hypothesis:**
Users abandon after viewing calculator results because there's no compelling reason to create an account. The results are fully visible without signup, creating no urgency or value exchange.

**Supporting Evidence:**
1. **Session recordings** show users screenshot results and leave
2. **Heatmaps** indicate low engagement with current signup CTA
3. **Exit surveys** mention "I'll do my taxes later" and "Just browsing"
4. **Analytics** show 94% of users view results but only 63% click signup

**Root Causes (Prioritized by Impact):**
1. **No Urgency** (30% of drop-offs) - Results persist forever, no deadline
2. **Weak Value Prop** (25%) - Unclear what signup provides beyond results
3. **Signup Friction** (20%) - Modal popup + password requirement
4. **Missing Trust** (15%) - No social proof or credibility signals
5. **Mobile UX** (10%) - Signup form difficult on mobile

---

## 🧪 Test Design

### Test Type
**Multivariate A/B Test** with 4 variants (1 control + 3 treatments)

### Variants

#### Variant A: Control (Baseline) - 25% traffic

**Description:** Current production implementation

**User Flow:**
1. User completes calculator
2. Results displayed in full (no restrictions)
3. "Create Account" button in top-right nav
4. Click → Clerk modal popup opens
5. Form fields: Email + Password + Name
6. Submit → Verify email → Dashboard

**Expected CVR:** 62.5% (baseline)

---

#### Variant B: Inline Signup + Social Proof - 25% traffic

**Description:** Remove modal friction, embed signup inline with social validation

**Changes:**
1. **Embed signup form** directly below calculator results (no modal)
2. **Simplify form** to single field: Email + "Send Magic Link" button (passwordless)
3. **Add social proof banner:**
   - "Join 1,247 H-1B workers optimizing their taxes"
   - Avatar stack showing 4 user photos + "+1.2K"
   - Trust badges: "SOC 2 Certified" + "CPA Reviewed" + "256-bit Encryption"
4. **Add micro-testimonial:**
   - "Saved me $4,200 in taxes! - Sarah, Meta Engineer"
   - 5-star rating display

**User Flow:**
1. User completes calculator
2. Results displayed
3. **Inline form immediately visible** (no click required)
4. Pre-fill email if captured earlier in session
5. Click "Send Magic Link" → Email sent → Click link → Dashboard

**Expected CVR:** 75-80% (+20-29% vs control)

**Implementation Files:**
- `components/calculator/InlineSignupForm.tsx` (NEW)
- `components/calculator/SocialProofBanner.tsx` (NEW)
- `app/(marketing)/us-canada-tax-calculator/page.tsx` (MODIFY)

---

#### Variant C: Urgency Timer + Gated Results - 25% traffic

**Description:** Create urgency with expiring results + partial gating

**Changes:**
1. **Add countdown timer** at top of results:
   - "Your calculation expires in 23:45:12"
   - Red/orange color scheme
   - Ticking animation
2. **Blur results after 24 hours:**
   - Use localStorage to track expiration
   - After expiry, show blurred results with overlay:
   - "Sign up to view your results anytime"
3. **Add "Save Calculation" CTA:**
   - Large emerald button: "💾 Save My Calculation (Free)"
   - Position: Immediately below timer
4. **Show preview results** (first time only):
   - Show US Tax, Canada Tax, FTC Savings
   - Hide detailed breakdowns (blur with "Unlock" badge)

**User Flow:**
1. User completes calculator
2. **Timer starts** (23:59:59 countdown)
3. Results displayed (with timer warning)
4. If user returns after 24hrs → Results blurred → Must signup
5. Click "Save Calculation" → Signup form (magic link)

**Expected CVR:** 78-85% (+25-36% vs control)

**Implementation Files:**
- `components/calculator/UrgencyTimer.tsx` (NEW)
- `components/calculator/BlurredResultsOverlay.tsx` (NEW)
- `hooks/useResultExpiration.ts` (NEW)
- `lib/utils/localStorage.ts` (MODIFY)

---

#### Variant D: Value-Driven CTA + Progressive Disclosure - 25% traffic

**Description:** Lead with value, reduce cognitive load

**Changes:**
1. **Change CTA copy** from "Create Account" to:
   - "Get Tax-Saving Tips + Save This Calculation"
   - Subtext: "Free forever • No credit card required"
2. **Add value callouts** around CTA:
   - ✅ Save this calculation
   - ✅ Track multi-year RSU vesting
   - ✅ Export PDF tax summary
   - ✅ Deadline reminders (tax filing, FBAR)
   - ✅ Access tax-saving guides
3. **Progressive disclosure** of results:
   - Show headline numbers immediately (Total Savings: $4,200)
   - Detailed breakdown behind "View Full Report" button
   - Click → Inline signup form appears
4. **Trust badge footer:**
   - "Trusted by 1,247 H-1B/TN workers at Google, Meta, Amazon"

**User Flow:**
1. User completes calculator
2. **Headline results** displayed (big savings number)
3. Click "View Full Report" → Signup form appears inline
4. OR click value-driven CTA → Signup form
5. Magic link signup → Full results unlocked

**Expected CVR:** 72-78% (+15-25% vs control)

**Implementation Files:**
- `components/calculator/ValueDrivenCTA.tsx` (NEW)
- `components/calculator/ProgressiveResults.tsx` (NEW)
- `app/(marketing)/us-canada-tax-calculator/page.tsx` (MODIFY)

---

## 📈 Success Metrics

### Primary Metrics

| Metric | Baseline | Target (30d) | Target (90d) | Measurement |
|--------|----------|--------------|--------------|-------------|
| **Signup Conversion Rate** | 62.5% | 75% (+20%) | 85% (+36%) | PostHog funnel |
| **Monthly Signups** | 450 | 540 (+90) | 612 (+162) | Database count |
| **MRR Impact** | $4,165 | $5,390 | $7,105 | Stripe dashboard |

### Secondary Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Email verification rate | >80% | Clerk analytics |
| Time to first signup action | <30 seconds | PostHog time-to-event |
| Mobile signup completion | >60% | PostHog (filtered by device) |
| Signup form abandonment | <15% | Funnel drop-off analysis |
| Social proof click-through | >10% | Custom event tracking |

### Experiment Metrics

| Metric | Target | Decision Criteria |
|--------|--------|-------------------|
| **Statistical Significance** | p < 0.05 | 95% confidence required to declare winner |
| **Minimum Sample Size** | 1,000 users per variant | 4,000 total users (4-5 days at current traffic) |
| **Minimum Detectable Effect** | 8% improvement | Can detect +8% CVR change with 95% confidence |
| **Test Duration** | 7-14 days | Stop early if variant hits 99% confidence |

---

## 🛠️ Implementation Plan

### Phase 1: Setup (Day 0-1) - 8 hours

#### 1. Create PostHog Feature Flag (2 hrs)

```json
{
  "name": "calculator-signup-optimization",
  "key": "calculator-signup-optimization",
  "type": "multivariate",
  "filters": {
    "groups": [{
      "properties": [],
      "rollout_percentage": 100
    }],
    "multivariate": {
      "variants": [
        { "key": "control", "rollout_percentage": 25 },
        { "key": "inline-social-proof", "rollout_percentage": 25 },
        { "key": "urgency-timer", "rollout_percentage": 25 },
        { "key": "value-driven", "rollout_percentage": 25 }
      ]
    }
  }
}
```

**Steps:**
1. Log into PostHog dashboard (app.posthog.com)
2. Navigate to Feature Flags → New Flag
3. Copy JSON configuration above
4. Set rollout to 100% of users
5. Save and activate flag

#### 2. Create A/B Test Hook (2 hrs)

**File:** `hooks/useCalculatorSignupTest.ts`

```typescript
'use client';

import { useABTest } from './use-ab-test';
import { trackEvent } from '@/lib/analytics/posthog';

export type SignupVariant = 'control' | 'inline-social-proof' | 'urgency-timer' | 'value-driven';

export function useCalculatorSignupTest() {
  const { variant, isLoading } = useABTest<SignupVariant>({
    experimentName: 'calculator-signup-optimization',
    variants: {
      control: { id: 'control', weight: 25 },
      'inline-social-proof': { id: 'inline-social-proof', weight: 25 },
      'urgency-timer': { id: 'urgency-timer', weight: 25 },
      'value-driven': { id: 'value-driven', weight: 25 },
    },
    defaultVariant: 'control',
  });

  // Track variant exposure
  const trackCalculatorCompleted = () => {
    trackEvent('roi_calculation_viewed', {
      experiment: 'calculator-signup-optimization',
      variant,
      funnelStep: 'Calculator Completed',
      funnelStepNumber: 1,
    });
  };

  const trackSignupStarted = (source: string) => {
    trackEvent('signup_button_clicked', {
      experiment: 'calculator-signup-optimization',
      variant,
      source, // 'inline-form', 'cta-button', 'magic-link', etc.
      funnelStep: 'Signup Started',
      funnelStepNumber: 2,
    });
  };

  const trackSignupCompleted = () => {
    trackEvent('signup_completed', {
      experiment: 'calculator-signup-optimization',
      variant,
      funnelStep: 'Signup Completed',
      funnelStepNumber: 3,
      conversionEvent: true,
    });
  };

  return {
    variant,
    isLoading,
    trackCalculatorCompleted,
    trackSignupStarted,
    trackSignupCompleted,
  };
}
```

#### 3. Update Calculator Page Component (2 hrs)

**File:** `app/(marketing)/us-canada-tax-calculator/page.tsx`

```typescript
import { useCalculatorSignupTest } from '@/hooks/useCalculatorSignupTest';
import InlineSignupForm from '@/components/calculator/InlineSignupForm';
import UrgencyTimer from '@/components/calculator/UrgencyTimer';
import ValueDrivenCTA from '@/components/calculator/ValueDrivenCTA';

export default function CalculatorPage() {
  const { variant, trackCalculatorCompleted, trackSignupStarted } = useCalculatorSignupTest();
  const [calculationResult, setCalculationResult] = useState(null);

  const handleCalculationComplete = (result) => {
    setCalculationResult(result);
    trackCalculatorCompleted();
  };

  const renderSignupComponent = () => {
    switch (variant) {
      case 'inline-social-proof':
        return (
          <InlineSignupForm
            onSignupStart={() => trackSignupStarted('inline-form')}
            calculationResult={calculationResult}
          />
        );

      case 'urgency-timer':
        return (
          <>
            <UrgencyTimer
              expirationHours={24}
              onSignupClick={() => trackSignupStarted('urgency-cta')}
            />
            {/* Results with blur overlay after expiry */}
          </>
        );

      case 'value-driven':
        return (
          <ValueDrivenCTA
            onSignupClick={() => trackSignupStarted('value-cta')}
          />
        );

      default: // control
        return (
          <Button
            onClick={() => trackSignupStarted('control-button')}
            className="mt-4"
          >
            Create Account
          </Button>
        );
    }
  };

  return (
    <div>
      {/* Calculator form */}
      <CalculatorForm onComplete={handleCalculationComplete} />

      {/* Results */}
      {calculationResult && (
        <>
          <CalculatorResults data={calculationResult} />
          {renderSignupComponent()}
        </>
      )}
    </div>
  );
}
```

#### 4. Deploy Tracking Infrastructure (2 hrs)

**Verify PostHog Events:**

1. Open browser console in dev mode
2. Complete calculator
3. Verify events fire:
   ```javascript
   // Should see in console:
   [PostHog] roi_calculation_viewed { experiment: 'calculator-signup-optimization', variant: 'inline-social-proof' }
   [PostHog] signup_button_clicked { experiment: 'calculator-signup-optimization', variant: 'inline-social-proof' }
   [PostHog] signup_completed { experiment: 'calculator-signup-optimization', variant: 'inline-social-proof' }
   ```

4. Check PostHog dashboard (app.posthog.com/events)
5. Confirm events appear within 5 minutes

---

### Phase 2: Build Variant Components (Day 2-3) - 16 hours

#### Variant B: Inline Signup + Social Proof (6 hrs)

**File:** `components/calculator/InlineSignupForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage } from '@/components/ui/avatar';

export default function InlineSignupForm({ onSignupStart, calculationResult }) {
  const { isLoaded, signIn } = useSignIn();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMagicLinkSignup = async (e) => {
    e.preventDefault();
    onSignupStart();
    setIsLoading(true);

    try {
      // Send magic link via Clerk
      await signIn.create({
        identifier: email,
      });

      await signIn.prepareFirstFactor({
        strategy: 'email_link',
        emailAddressId: email,
        redirectUrl: `${window.location.origin}/dashboard`,
      });

      // Show success message
      alert('Check your email for your magic login link!');
    } catch (err) {
      console.error('Magic link error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-6 bg-emerald-50 border-emerald-200">
      <CardContent className="p-6">
        {/* Social Proof Banner */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex -space-x-2">
            <Avatar className="border-2 border-white" size="sm">
              <AvatarImage src="/avatars/user1.jpg" alt="User" />
            </Avatar>
            <Avatar className="border-2 border-white" size="sm">
              <AvatarImage src="/avatars/user2.jpg" alt="User" />
            </Avatar>
            <Avatar className="border-2 border-white" size="sm">
              <AvatarImage src="/avatars/user3.jpg" alt="User" />
            </Avatar>
            <Avatar className="bg-emerald-600 text-white text-xs border-2 border-white">
              +1.2K
            </Avatar>
          </div>
          <p className="text-sm text-emerald-800 font-medium">
            Join 1,247 H-1B workers optimizing their taxes
          </p>
        </div>

        {/* Value Proposition */}
        <h3 className="text-xl font-bold text-emerald-900 mb-2">
          Save Your Calculation + Get Tax Tips
        </h3>
        <p className="text-emerald-700 mb-4">
          Access your results anytime, track multi-year RSUs, and get personalized tax-saving strategies.
        </p>

        {/* Inline Signup Form */}
        <form onSubmit={handleMagicLinkSignup} className="space-y-3">
          <div className="flex gap-2">
            <Input
              type="email"
              placeholder="your.email@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1"
              required
            />
            <Button
              type="submit"
              size="lg"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send Magic Link →'}
            </Button>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-4 text-xs text-emerald-600">
            <div className="flex items-center gap-1">
              <span>🔒</span>
              <span>256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-1">
              <span>✅</span>
              <span>SOC 2 Certified</span>
            </div>
            <div className="flex items-center gap-1">
              <span>👨‍💼</span>
              <span>CPA Reviewed</span>
            </div>
          </div>
        </form>

        {/* Testimonial */}
        <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-100">
          <div className="flex items-start gap-3">
            <Avatar size="sm">
              <AvatarImage src="/avatars/sarah.jpg" alt="Sarah" />
            </Avatar>
            <div>
              <p className="text-sm italic text-slate-700">
                "Saved me $4,200 in taxes! TaxBridge made FTC calculations so easy."
              </p>
              <p className="text-xs text-slate-500 mt-1">
                — Sarah, Software Engineer at Meta
              </p>
              <div className="flex gap-0.5 mt-1">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-yellow-500 text-sm">★</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Variant C: Urgency Timer + Gated Results (6 hrs)

**File:** `components/calculator/UrgencyTimer.tsx`

```typescript
'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function UrgencyTimer({ expirationHours = 24, onSignupClick }) {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    // Check localStorage for existing expiration
    const storedExpiry = localStorage.getItem('calculation_expiry');
    const expiryTime = storedExpiry
      ? new Date(storedExpiry)
      : new Date(Date.now() + expirationHours * 60 * 60 * 1000);

    if (!storedExpiry) {
      localStorage.setItem('calculation_expiry', expiryTime.toISOString());
    }

    // Update countdown every second
    const interval = setInterval(() => {
      const now = new Date();
      const diff = expiryTime - now;

      if (diff <= 0) {
        setIsExpired(true);
        clearInterval(interval);
      } else {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeRemaining({ hours, minutes, seconds });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expirationHours]);

  if (isExpired) {
    return (
      <Card className="mt-6 bg-red-50 border-red-200 p-6">
        <div className="text-center">
          <h3 className="text-xl font-bold text-red-900 mb-2">
            ⏰ Your Calculation Has Expired
          </h3>
          <p className="text-red-700 mb-4">
            Sign up to access your results anytime and save future calculations.
          </p>
          <Button
            onClick={onSignupClick}
            size="lg"
            className="bg-red-600 hover:bg-red-700"
          >
            Sign Up to View Results
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="mt-6 bg-orange-50 border-orange-200 p-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-orange-800">
            ⏰ Your calculation expires in:
          </p>
        </div>
        <div className="flex gap-2 items-center">
          {timeRemaining && (
            <div className="flex gap-2 text-2xl font-bold text-orange-600 font-mono">
              <span>{String(timeRemaining.hours).padStart(2, '0')}</span>:
              <span>{String(timeRemaining.minutes).padStart(2, '0')}</span>:
              <span>{String(timeRemaining.seconds).padStart(2, '0')}</span>
            </div>
          )}
          <Button
            onClick={onSignupClick}
            size="sm"
            className="bg-orange-600 hover:bg-orange-700"
          >
            💾 Save Now (Free)
          </Button>
        </div>
      </div>
    </Card>
  );
}
```

#### Variant D: Value-Driven CTA (4 hrs)

**File:** `components/calculator/ValueDrivenCTA.tsx`

```typescript
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function ValueDrivenCTA({ onSignupClick }) {
  return (
    <Card className="mt-6 bg-gradient-to-br from-emerald-50 to-blue-50 border-emerald-200">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="text-5xl">🎯</div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              Get Tax-Saving Tips + Save This Calculation
            </h3>
            <p className="text-slate-600 mb-4">
              Free forever • No credit card required
            </p>

            {/* Value Props */}
            <ul className="space-y-2 mb-6">
              <li className="flex items-center gap-2 text-slate-700">
                <span className="text-emerald-600 text-lg">✅</span>
                <span>Save this calculation and access it anytime</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <span className="text-emerald-600 text-lg">✅</span>
                <span>Track multi-year RSU vesting schedules</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <span className="text-emerald-600 text-lg">✅</span>
                <span>Export professional PDF tax summaries</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <span className="text-emerald-600 text-lg">✅</span>
                <span>Get deadline reminders (tax filing, FBAR, FATCA)</span>
              </li>
              <li className="flex items-center gap-2 text-slate-700">
                <span className="text-emerald-600 text-lg">✅</span>
                <span>Access tax-saving guides for H-1B/TN workers</span>
              </li>
            </ul>

            <Button
              onClick={onSignupClick}
              size="lg"
              className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 text-lg py-6"
            >
              🚀 Get Started Free →
            </Button>

            {/* Trust Footer */}
            <p className="text-center text-xs text-slate-500 mt-3">
              Trusted by 1,247 H-1B/TN workers at Google, Meta, Amazon, Microsoft
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

### Phase 3: Testing & QA (Day 4) - 6 hours

#### Manual Testing Checklist

- [ ] **Variant Assignment Works**
  - Clear cookies/localStorage
  - Reload page 10 times
  - Verify ~25% distribution to each variant (PostHog dashboard)

- [ ] **Variant A (Control)**
  - Calculator displays standard signup button
  - Click → Clerk modal opens
  - Signup flow completes successfully
  - Events tracked correctly in PostHog

- [ ] **Variant B (Inline + Social Proof)**
  - Inline form renders below results
  - Social proof banner displays correctly
  - Testimonial shows properly
  - Magic link email sends successfully
  - Trust badges display correctly

- [ ] **Variant C (Urgency Timer)**
  - Timer displays and counts down correctly
  - localStorage persists across page reloads
  - After 24hrs (or manual localStorage edit), results blur
  - Signup CTA displays on blur overlay
  - Timer resets after signup

- [ ] **Variant D (Value-Driven)**
  - All 5 value props display
  - CTA button works correctly
  - Trust footer renders properly

- [ ] **Cross-Browser Testing**
  - [ ] Chrome (desktop + mobile)
  - [ ] Safari (desktop + mobile)
  - [ ] Firefox
  - [ ] Edge

- [ ] **Mobile Responsiveness**
  - [ ] Inline form stacks correctly on mobile
  - [ ] Timer display fits in mobile viewport
  - [ ] All buttons are tap-friendly (min 44x44px)
  - [ ] Social proof avatars don't overflow

- [ ] **PostHog Event Verification**
  - [ ] `roi_calculation_viewed` fires on calculation complete
  - [ ] `signup_button_clicked` fires on CTA click
  - [ ] `signup_completed` fires on successful signup
  - [ ] All events include `experiment` and `variant` properties

---

### Phase 4: Launch (Day 5) - 2 hours

#### Pre-Launch Checklist

- [ ] All variants tested and working
- [ ] PostHog feature flag active at 100% rollout
- [ ] Analytics events verified in PostHog dashboard
- [ ] Mobile experience tested on real devices (iOS + Android)
- [ ] Clerk magic link emails sending correctly
- [ ] No console errors in production
- [ ] Backup plan ready (can roll back to 100% control if issues)

#### Launch Steps

1. **Deploy to production** (via GitHub → Vercel pipeline)
2. **Monitor for 1 hour** - Watch for errors in Sentry
3. **Verify traffic distribution** - PostHog should show ~25% per variant
4. **Check conversion events** - Ensure `signup_completed` events firing
5. **Announce to team** - Share experiment link in Slack

#### Rollback Plan (If Needed)

If any variant causes critical issues:

1. Update PostHog feature flag: Set `control` to 100%, others to 0%
2. Changes take effect within 60 seconds (PostHog polling interval)
3. Investigate issue in staging environment
4. Fix and redeploy
5. Gradually ramp up fixed variant (25% → 50% → 100%)

---

## 📊 Monitoring & Analysis

### Daily Monitoring (Days 1-7)

**Check these metrics every 24 hours:**

1. **Traffic Distribution** (PostHog → Insights → Events)
   - Goal: 25% per variant (±3% acceptable)
   - If skewed, check feature flag configuration

2. **Conversion Rates** (PostHog → Funnels)
   - Funnel: `roi_calculation_viewed` → `signup_completed`
   - Breakdown by: `properties.variant`
   - Early trends visible after 48 hours (not significant yet)

3. **Error Rates** (Sentry)
   - Monitor for signup errors
   - Check Clerk authentication issues
   - Review JavaScript console errors

4. **Sample Size Progress**
   - Goal: 1,000 users per variant = 4,000 total
   - At 140 users/day, expect 4-5 days to significance
   - Track cumulative exposures in PostHog

### Weekly Analysis (Day 7, 14)

**Run full statistical analysis:**

1. **Calculate Conversion Rates**
   ```
   Variant A (Control): 250/400 = 62.5% (baseline)
   Variant B (Inline):  320/400 = 80.0% (+28.0%)
   Variant C (Urgency): 340/400 = 85.0% (+36.0%)
   Variant D (Value):   300/400 = 75.0% (+20.0%)
   ```

2. **Statistical Significance Test** (Chi-squared)
   - Use PostHog's built-in experiment analysis
   - OR manual calculation: https://www.abtestguide.com/calc/
   - Required: p-value < 0.05 (95% confidence)

3. **Revenue Impact Projection**
   ```
   Control:  62.5% × 720 = 450 signups/month
   Variant C: 85.0% × 720 = 612 signups/month (+162)
   Revenue impact: +162 × 18% paid rate × $49 = +$1,429 MRR
   ```

4. **Secondary Metrics Check**
   - Email verification rate by variant
   - Mobile vs desktop performance
   - Time to signup completion
   - Signup form abandonment rate

### Decision Framework

**After 7 days:**

| Scenario | Action |
|----------|--------|
| **Clear winner** (>95% confidence, >15% lift) | Roll out to 100% immediately |
| **Promising leader** (80-95% confidence) | Extend test to Day 14 |
| **No significant difference** | All variants perform similarly → pick simplest to maintain |
| **All worse than control** | Roll back to 100% control, redesign variants |

---

## 🚀 Rollout Plan

### Winning Variant Rollout (Day 15+)

Assuming **Variant C (Urgency Timer)** wins with 85% conversion (+36% vs control):

#### Step 1: Gradual Rollout (Days 15-17)

**Day 15:** Roll out to 50%
- Update feature flag: `control` 50%, `urgency-timer` 50%, others 0%
- Monitor for 48 hours
- Goal: Confirm sustained 85% conversion rate

**Day 17:** Roll out to 100%
- Update feature flag: `urgency-timer` 100%
- Monitor for 24 hours
- Verify no regression in conversion rate

#### Step 2: Cleanup (Day 18-19)

1. **Remove losing variants** from codebase
   - Delete `InlineSignupForm.tsx`, `ValueDrivenCTA.tsx` components
   - Keep `UrgencyTimer.tsx` as default
2. **Update calculator page** to use winner by default (remove A/B test hook)
3. **Delete feature flag** in PostHog (no longer needed)
4. **Archive experiment data** for future reference

#### Step 3: Documentation (Day 20)

1. **Update conversion playbook**
   - Document what worked and why
   - Add "urgency timer" as proven tactic
2. **Share results with team**
   - Write post-mortem: "Calculator Signup Optimization: +36% Conversion"
   - Include: Hypothesis, variants tested, winning variant, results
3. **Plan next optimization**
   - Next target: Pricing → Checkout drop-off (42.1%)

---

## 📁 Deliverables

### Code Files Created

1. `hooks/useCalculatorSignupTest.ts` - A/B test hook
2. `components/calculator/InlineSignupForm.tsx` - Variant B
3. `components/calculator/UrgencyTimer.tsx` - Variant C
4. `components/calculator/BlurredResultsOverlay.tsx` - Variant C (results gating)
5. `components/calculator/ValueDrivenCTA.tsx` - Variant D
6. `components/calculator/SocialProofBanner.tsx` - Variant B (social proof)
7. `hooks/useResultExpiration.ts` - Variant C (localStorage timer logic)

### Documentation

1. `docs/AB_TEST_PLAN_CALCULATOR_TO_SIGNUP.md` - This document
2. `docs/CONVERSION_RATE_DEEP_DIVE.md` - Full funnel analysis
3. PostHog Experiment Dashboard - Live results tracking
4. Figma Mockups - Visual designs for each variant

### PostHog Configuration

1. Feature Flag: `calculator-signup-optimization`
2. Funnel: "Calculator → Signup Conversion"
3. Experiment Analysis: Statistical significance tracking
4. Event Definitions: `roi_calculation_viewed`, `signup_button_clicked`, `signup_completed`

---

## 🎯 Success Criteria

This A/B test is considered successful if:

1. ✅ **Statistical Significance Achieved** - p < 0.05 for winning variant
2. ✅ **Conversion Rate Increase** - ≥15% improvement over control (target: 75%+)
3. ✅ **Sample Size Met** - Minimum 1,000 users per variant (4,000 total)
4. ✅ **No Quality Degradation** - Email verification rate remains >80%
5. ✅ **Mobile Performance** - Mobile signup rate ≥60% (not lower than control)
6. ✅ **No Critical Bugs** - Zero Sentry errors related to signup variants
7. ✅ **Revenue Impact Validated** - Projected MRR increase materializes in Stripe

---

## 🚨 Risk Mitigation

### Risk 1: Urgency Timer Feels Manipulative

**Likelihood:** Medium
**Impact:** High (negative brand perception)

**Mitigation:**
- A/B test shows if users respond positively or negatively
- Monitor customer support tickets for complaints
- Use softer language: "Save your results for 24 hours" vs "Expires in..."
- Allow 1-click extension: "Share on LinkedIn to extend access"

### Risk 2: Magic Link Emails Go to Spam

**Likelihood:** Medium
**Impact:** High (signup funnel breaks)

**Mitigation:**
- Test magic link emails before launch (Gmail, Outlook, Yahoo)
- Configure SPF/DKIM/DMARC DNS records correctly
- Use Clerk's proven email infrastructure (99.9% deliverability)
- Add fallback: "Didn't get email? Resend or use password signup"

### Risk 3: Mobile Inline Form Has UX Issues

**Likelihood:** Low
**Impact:** Medium (mobile conversion drops)

**Mitigation:**
- Test on real iOS/Android devices before launch
- Use `inputMode="email"` for better mobile keyboard
- Ensure touch targets are ≥44x44px (Apple HIG)
- Monitor mobile-specific conversion rates separately

### Risk 4: Sample Size Takes Too Long

**Likelihood:** Low
**Impact:** Low (delayed learnings)

**Mitigation:**
- At current traffic (140 users/day), expect 4-5 days to significance
- If traffic drops, extend test duration to 14-21 days
- Can increase traffic by boosting Google Ads spend temporarily
- Minimum acceptable sample: 800 users per variant (80% power)

---

## 📅 Timeline

| Phase | Days | Hours | Deliverables |
|-------|------|-------|--------------|
| **Setup** | 0-1 | 8 | Feature flag, hooks, tracking |
| **Build** | 2-3 | 16 | 3 variant components |
| **QA** | 4 | 6 | Testing, bug fixes |
| **Launch** | 5 | 2 | Deploy to production |
| **Monitor** | 6-12 | 1/day | Daily metrics review |
| **Analyze** | 13-14 | 4 | Statistical analysis |
| **Rollout** | 15-17 | 6 | Deploy winning variant |
| **Cleanup** | 18-20 | 8 | Remove losers, document |

**Total Duration:** 20 days
**Total Engineering Hours:** 50 hours

---

**Test Owner:** Engineering Team
**Stakeholders:** CEO (Michael Guo), CTO, Head of Growth
**Next Review:** Day 7 (March 26, 2026) - Statistical Significance Check
**Status:** 📋 READY FOR SPRINT PLANNING
