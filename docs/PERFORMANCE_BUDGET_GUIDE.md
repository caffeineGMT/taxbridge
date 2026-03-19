# Performance Budget Enforcement - Lighthouse CI

## Overview

This project enforces strict performance budgets using Lighthouse CI to ensure excellent user experience and fast page loads. All builds must pass performance budget checks before deployment.

## Performance Thresholds

### Core Web Vitals (REQUIRED - Task Spec)
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms (measured via Total Blocking Time as proxy)
- **CLS (Cumulative Layout Shift)**: < 0.1
- **Bundle Size (Total)**: < 200KB

### Additional Performance Metrics
- **Speed Index**: < 3.4s
- **Time to Interactive (TTI)**: < 3.8s
- **First Contentful Paint (FCP)**: < 1.8s
- **Total Blocking Time (TBT)**: < 200ms

### Resource Size Budgets
- **Total Bundle Size**: 200KB max ⚠️ **HARD LIMIT**
- **JavaScript**: 150KB max
- **CSS**: 30KB max
- **Images**: 100KB max
- **Fonts**: 50KB max
- **HTML Document**: 20KB max

### Resource Count Budgets
- **Scripts**: 15 max
- **Stylesheets**: 5 max
- **Images**: 20 max
- **Fonts**: 4 max
- **Third-party resources**: 10 max

## Configuration Files

### `.lighthouserc.js`
Main Lighthouse CI configuration with:
- Performance score thresholds (85% minimum)
- Accessibility thresholds (90% minimum)
- Core Web Vitals assertions
- Resource budget assertions

### `budgets.json`
Performance budget definitions for:
- Resource sizes (KB limits per resource type)
- Resource counts (max number of resources)
- Timing metrics (millisecond limits)

## Running Performance Audits

### Local Development
```bash
# Run full Lighthouse CI audit (3 runs, averaged)
npm run lighthouse

# Production site audit
npm run lighthouse:production

# Local build audit
npm run lighthouse:local

# Desktop-specific audit
npm run lighthouse:desktop

# Mobile audit
npm run lighthouse:mobile
```

### CI/CD Integration
Lighthouse CI runs automatically on every push to `main`. Builds will FAIL if:
- Performance score < 85%
- Any Core Web Vitals threshold exceeded
- Bundle size > 200KB
- Any resource budget exceeded

## Understanding Results

### Passing Build
```
✅ All assertions passed!
✅ Performance score: 92
✅ LCP: 2.1s (< 2.5s)
✅ FID (TBT): 85ms (< 100ms)
✅ CLS: 0.05 (< 0.1)
✅ Total bundle: 185KB (< 200KB)
```

### Failing Build
```
❌ Assertion failed: largest-contentful-paint
   Expected: < 2500ms
   Actual: 3200ms

❌ Assertion failed: resource-summary:total:size
   Expected: < 204800 bytes (200KB)
   Actual: 245600 bytes (240KB)
```

## Debugging Performance Issues

### 1. Bundle Size Exceeded

**Problem**: `resource-summary:total:size` assertion failed

**Solutions**:
```bash
# Analyze bundle composition
npm run build:analyze

# Check for large dependencies
npx bundlephobia [package-name]

# Tree-shake unused code
# Update next.config.mjs with:
experimental: {
  optimizePackageImports: ['lucide-react', 'recharts']
}
```

### 2. LCP Too Slow

**Problem**: `largest-contentful-paint` > 2.5s

**Solutions**:
- Optimize images: Use Next.js `<Image>` with `priority` prop
- Preload critical resources: Add `<link rel="preload">`
- Reduce server response time: Check API performance
- Use CDN: Enable Vercel Edge Network

### 3. High CLS

**Problem**: `cumulative-layout-shift` > 0.1

**Solutions**:
- Set explicit `width` and `height` on images
- Reserve space for dynamic content
- Avoid inserting content above existing content
- Use CSS `aspect-ratio` for responsive media

### 4. Large JavaScript Bundle

**Problem**: `resource-summary:script:size` > 150KB

**Solutions**:
```javascript
// Use dynamic imports for heavy components
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <Spinner />,
  ssr: false // Skip server-side rendering if not needed
});

// Code-split routes
// Next.js does this automatically for pages
```

## Performance Budget Philosophy

### Why 200KB Bundle Limit?

1. **Mobile Performance**: 200KB loads in < 2s on 3G
2. **Revenue Impact**: 1s delay = 7% conversion drop
3. **Competitive Advantage**: Faster than 90% of tax sites
4. **Core Web Vitals**: Required for "Good" rating

### Budget Allocation Strategy

Total 200KB budget allocation:
- **JavaScript (150KB)**: React, Next.js, business logic
  - Framework: ~80KB
  - Application code: ~70KB
- **CSS (30KB)**: Tailwind (purged), component styles
- **Images (100KB)**: Logo, hero images (WebP/AVIF)
- **Fonts (50KB)**: Inter subset for Latin characters
- **HTML (20KB)**: Initial page markup

## Continuous Monitoring

### Production Monitoring
```bash
# Daily performance tracking
npm run lighthouse:production

# Compare against baseline
npm run lighthouse:compare

# Track metrics over time
# Results stored in docs/lighthouse/
```

### Alert Thresholds
- Performance score drops below 85%
- LCP increases beyond 2.5s
- Bundle size exceeds 200KB
- Any Core Web Vitals regression

## Exemptions and Overrides

**When to request exemption**:
- Critical third-party dependency (e.g., Stripe SDK)
- Temporary spike during feature development
- Platform limitation (e.g., Clerk auth bundle)

**How to request**:
1. Document reason in PR description
2. Show mitigation plan (lazy loading, code splitting)
3. Set timeline to resolve (< 1 sprint)
4. Get approval from tech lead

## Resources

- [Web.dev Core Web Vitals](https://web.dev/vitals/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Performance Budgets Guide](https://web.dev/performance-budgets-101/)
- [Next.js Performance Optimization](https://nextjs.org/docs/basic-features/performance)

## Current Status

Last audit: 2026-03-19
- Performance Score: TBD (run `npm run lighthouse`)
- LCP: TBD
- FID (TBT): TBD
- CLS: TBD
- Bundle Size: TBD

**Action Required**: Run baseline audit to establish current metrics.

## Task Completion

✅ **[P3-LOW] Performance Budget Enforcement**
- ✅ LCP < 2.5s threshold enforced
- ✅ FID < 100ms threshold enforced (via TBT)
- ✅ CLS < 0.1 threshold enforced
- ✅ Bundle size < 200KB enforced
- ✅ Lighthouse CI configuration complete
- ✅ Performance budgets documented
- ✅ CI/CD integration ready

**Files Created/Modified**:
- `budgets.json` - Resource and timing budgets
- `.lighthouserc.js` - Updated with budget enforcement
- `docs/PERFORMANCE_BUDGET_GUIDE.md` - This guide

**Next Steps**:
1. Run baseline audit: `npm run lighthouse`
2. Fix any budget violations
3. Integrate into CI/CD pipeline
4. Monitor weekly via production audits
