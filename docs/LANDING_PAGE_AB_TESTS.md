# Landing Page A/B Testing - March 2026 Sprint

**GOAL:** Increase landing page → signup conversion rate by 15%+ within 1 week
**TRAFFIC TARGET:** 1,000+ visitors per variant minimum
**TIMELINE:** March 19-26, 2026 (7 days)
**STATUS:** ✅ Live and running

---

## 📊 Overview

We are running **6 simultaneous A/B tests** on the landing page:

### Legacy Tests (Still running):
1. ✅ **Headline variations** - Generic vs. pain-focused vs. outcome-focused
2. ✅ **CTA button copy/color** - 4 variants testing urgency, value prop, social proof
3. ✅ **Trust signals placement** - Above hero, below CTA, inline with features

### NEW Priority Tests (March 2026):
4. ✅ **Headline ROI emphasis** - Testing $ saved messaging strength
5. ✅ **Video demo vs static hero** - Testing video engagement vs static content
6. ✅ **Pricing visibility** - Testing upfront pricing vs hidden pricing

---

## 🎯 Test #1: Headline ROI Emphasis

**HYPOTHESIS:** Specific dollar amounts create stronger conversion intent than generic "save money" messaging.

**FILE:** `hooks/use-enhanced-landing-tests.ts` - `useHeadlineROITest()`

### Variants (4 total, 25% traffic each):

| Variant | Headline | Savings Amount | ShowsBadge |
|---------|----------|----------------|------------|
| **Control** | "Simplify Your Cross-Border Tax Filing" | — | No |
| **Moderate** | "Save $2,500+ on Your Cross-Border Taxes" | $2,500 | Yes |
| **Aggressive** | "Tech Workers Save $5,000-$15,000 Annually" | $5,000-$15,000 | Yes |
| **Urgency** | "Your RSUs Cost You $8,000 Last Year" | $8,000 | Yes |

### PostHog Events Tracked:
```typescript
trackEvent('landing_page_viewed', {
  funnelStep: 'Landing',
  funnelStepNumber: 1,
  headlineROIVariant: 'control' | 'moderate-savings' | 'aggressive-savings' | 'urgency-savings',
  showsSavingsAmount: true | false,
  savingsAmount: '$2,500' | '$5,000-$15,000' | '$8,000' | '',
});
```

### Success Metrics:
- **Primary:** Conversion rate (landing → signup)
- **Secondary:** Time on page, scroll depth, CTA click rate
- **Guardrail:** Bounce rate (should not increase >5%)

### Expected Winners:
- **Hypothesis:** "Aggressive" or "Urgency" variants will win
- **Rationale:** Specific, high dollar amounts create stronger perceived value
- **Risk:** May alienate users with lower incomes or smaller RSU grants

---

## 🎬 Test #2: Video Demo vs Static Hero

**HYPOTHESIS:** Video demonstration increases engagement and trust, leading to higher conversion rates despite potential loading impact.

**FILE:** `hooks/use-enhanced-landing-tests.ts` - `useHeroMediaTest()`

### Variants (4 total, 25% traffic each):

| Variant | Media Type | Behavior | Description |
|---------|------------|----------|-------------|
| **Static** | Static image | None | Default hero with gradient background |
| **Autoplay** | Video | Muted autoplay | 90-second demo video autoplays on load |
| **Click-to-play** | Video | Click to start | Thumbnail with play button, user-initiated |
| **Animated Stats** | Animated | Counter animation | Animated statistics showcase |

### PostHog Events Tracked:
```typescript
// Page view
trackEvent('landing_page_viewed', {
  heroMediaVariant: 'static' | 'video-autoplay' | 'video-click' | 'animated-stats',
  mediaType: 'static' | 'video' | 'animated',
});

// Video engagement
trackEvent('page_viewed', {
  heroMediaVariant: variant,
  mediaType: 'video',
  videoAction: 'played' | 'completed',
  videoEngagement: 'high',
});
```

### Success Metrics:
- **Primary:** Conversion rate (landing → signup)
- **Secondary:** Video play rate, video completion rate, time on page
- **Guardrail:** Page load time (should stay <3s), bounce rate

### Expected Winners:
- **Hypothesis:** "Click-to-play" will win (balance of engagement + performance)
- **Rationale:** User-initiated video = higher intent, no autoplay annoyance
- **Risk:** Video production quality must be high; low quality hurts trust

### Video Requirements:
- **Location:** `/public/videos/taxbridge-demo.mp4`
- **Duration:** 90 seconds max
- **Size:** <5MB (optimized for web)
- **Format:** MP4 (H.264 codec)
- **Thumbnail:** `/public/images/video-thumbnail.jpg`

**NOTE:** Video file does NOT exist yet. Create or use placeholder.

---

## 💰 Test #3: Pricing Visibility

**HYPOTHESIS:** Upfront pricing reduces friction and pre-qualifies users, leading to higher quality conversions even if volume is lower.

**FILE:** `hooks/use-enhanced-landing-tests.ts` - `usePricingVisibilityTest()`

### Variants (4 total, 25% traffic each):

| Variant | Display Type | Placement | Description |
|---------|--------------|-----------|-------------|
| **Hidden** | None | — | No pricing on landing page (current default) |
| **Price Only** | Badge | Below hero | Simple "$79/year" badge with no details |
| **Full Card** | Pricing cards | Before features | Free vs. Pro comparison table |
| **Value Prop** | ROI comparison | After testimonials | "Without TaxBridge" vs. "With TaxBridge" cost breakdown |

### PostHog Events Tracked:
```typescript
// Page view
trackEvent('pricing_page_viewed', {
  pricingVisibilityVariant: 'hidden' | 'price-only' | 'full-pricing' | 'value-comparison',
  pricingDisplay: 'none' | 'price-only' | 'full-card' | 'value-prop',
  pricingPlacement: 'none' | 'hero-below' | 'before-features' | 'after-testimonials',
});

// Pricing click
trackEvent('upgrade_button_clicked', {
  pricingVisibilityVariant: variant,
  pricingDisplay: display,
  source: 'landing-page-inline',
});
```

### Success Metrics:
- **Primary:** Conversion rate (landing → paid signup)
- **Secondary:** Paid conversion rate, average revenue per user (ARPU)
- **Guardrail:** Total signup volume (may decrease but quality should increase)

### Expected Winners:
- **Hypothesis:** "Value Prop" will win (shows ROI, not just price)
- **Rationale:** $79 seems expensive until you see $8,000 savings
- **Risk:** May reduce total signups (price-sensitive users bounce early)

---

## 📈 PostHog Configuration

### Feature Flags Required:

Create these feature flags in PostHog dashboard:

```bash
# Test 1: Headline ROI
landing-headline-roi-test
  - control (25%)
  - moderate-savings (25%)
  - aggressive-savings (25%)
  - urgency-savings (25%)

# Test 2: Hero Media
landing-hero-media-test
  - static (25%)
  - video-autoplay (25%)
  - video-click (25%)
  - animated-stats (25%)

# Test 3: Pricing Visibility
landing-pricing-visibility-test
  - hidden (25%)
  - price-only (25%)
  - full-pricing (25%)
  - value-comparison (25%)
```

### Funnel Configuration:

1. **Landing → Signup Funnel:**
   - Step 1: `landing_page_viewed`
   - Step 2: `signup_button_clicked`
   - Step 3: `signup_completed`

2. **Landing → Paid Funnel:**
   - Step 1: `landing_page_viewed`
   - Step 2: `pricing_page_viewed`
   - Step 3: `upgrade_button_clicked`
   - Step 4: `checkout_completed`

### Dashboard Metrics:

**Create dashboard: "Landing Page A/B Tests - March 2026"**

Track for EACH variant:
- Total views
- Signup conversion rate (%)
- Paid conversion rate (%)
- Bounce rate (%)
- Time on page (avg)
- Scroll depth (% reaching footer)
- CTA click rate (%)

---

## 🚀 How to Analyze Results

### Minimum Sample Size:
- **1,000 visitors per variant** = 4,000 total visitors (250/day if running 7 days)
- Use statistical significance calculator: [Evan's Awesome A/B Tools](https://www.evanmiller.org/ab-testing/sample-size.html)
- **Confidence level:** 95%
- **Minimum detectable effect:** 10% (relative)

### Analysis Checklist (After 1 week):

#### For Each Test:
1. ✅ **Traffic Check:** Did all variants get 1,000+ visitors?
2. ✅ **Conversion Rate:** Which variant has highest landing → signup %?
3. ✅ **Statistical Significance:** Is p-value < 0.05?
4. ✅ **Paid Conversion:** Which variant drives most paid signups?
5. ✅ **Revenue Impact:** Which variant has highest ARPU?
6. ✅ **Guardrail Metrics:** Did bounce rate stay stable? Load time OK?

#### Winner Declaration:
- **Primary metric:** Landing → signup conversion rate
- **Secondary metric:** Paid conversion rate (more valuable than free signups)
- **Tiebreaker:** Revenue per visitor

#### Rollout Plan:
1. Declare winner after statistical significance achieved (7 days minimum)
2. Roll out winning variant to 100% of traffic
3. Update default values in hooks
4. Remove losing variants from codebase
5. Document learnings in `/docs/AB_TEST_RESULTS_MARCH_2026.md`

---

## 📁 Files Created

### Core Infrastructure:
- ✅ `hooks/use-enhanced-landing-tests.ts` - New A/B test hooks (3 tests)
- ✅ `components/landing/VideoHero.tsx` - Video hero component
- ✅ `components/landing/PricingPreview.tsx` - Pricing preview component
- ✅ `app/page.tsx` - Updated landing page with new tests

### Documentation:
- ✅ `docs/LANDING_PAGE_AB_TESTS.md` - This file

### Assets Needed (TODO):
- ⏳ `/public/videos/taxbridge-demo.mp4` - 90-second product demo video
- ⏳ `/public/images/video-thumbnail.jpg` - Video thumbnail image

---

## ⚠️ Warnings & Caveats

### 1. **Video File Missing**
The video demo file (`/public/videos/taxbridge-demo.mp4`) does **NOT exist yet**.
- **Impact:** Video variants will show fallback error message
- **Fix:** Record 90-second demo or use placeholder video

### 2. **Build Size Impact**
Video file will add ~5MB to build size.
- **Current build:** 898MB (already over budget)
- **Risk:** May push to 900MB+, causing OOM on Vercel
- **Mitigation:** Host video on CDN (Cloudinary/Vimeo) instead of `/public`

### 3. **Performance Impact**
Video autoplay may slow page load on mobile.
- **Guardrail:** Monitor page load time in PostHog
- **Kill switch:** If bounce rate increases >10%, disable video variants

### 4. **Statistical Power**
Running 6 simultaneous tests requires **6x more traffic** for same confidence.
- **Minimum:** 1,000 visitors × 4 variants × 3 tests = 12,000 total visitors needed
- **Current traffic:** ~500 visitors/day → Need 24 days for full confidence
- **Recommendation:** Prioritize Test #1 (Headline ROI) if traffic is low

### 5. **PostHog Feature Flags**
All tests use PostHog feature flags. If PostHog is down or not configured:
- Tests will fallback to client-side randomization
- Tracking will still work via `trackEvent()`
- Fallback weights are defined in hooks (25% each)

---

## 🎓 Key Learnings (Update after test completion)

**TO BE FILLED IN AFTER 1 WEEK**

### Test #1: Headline ROI
- **Winner:** TBD
- **Conversion Lift:** TBD
- **Insight:** TBD

### Test #2: Hero Media
- **Winner:** TBD
- **Conversion Lift:** TBD
- **Insight:** TBD

### Test #3: Pricing Visibility
- **Winner:** TBD
- **Conversion Lift:** TBD
- **Insight:** TBD

---

## 📞 Contact

**Owner:** CMO / Growth Team
**Engineer:** Michael Guo
**Started:** March 19, 2026
**Review:** March 26, 2026 (1 week checkpoint)
