# Lighthouse Performance Documentation

This directory contains Lighthouse performance audit reports and tools for monitoring Core Web Vitals.

## 📁 Files

### Reports
- **`lighthouse-baseline.report.json`** - Current production baseline (JSON format)
- **`lighthouse-baseline.report.html`** - Current production baseline (HTML format)
- **`lighthouse-regression-check.report.json`** - Latest regression check (JSON)
- **`lighthouse-regression-check.report.html`** - Latest regression check (HTML, viewable in browser)
- **`lighthouse-baseline.report.json.old-YYYY-MM-DD`** - Archived baselines

### Documentation
- **`PERFORMANCE-REGRESSION-REPORT-YYYY-MM-DD.md`** - Detailed regression analysis reports

## 🚦 Current Performance Status (March 19, 2026)

### ✅ ALL GREEN - EXCELLENT PERFORMANCE

| Metric | Current | Threshold | Status |
|--------|---------|-----------|--------|
| **Performance Score** | 92% | ≥90% | 🟢 PASS |
| **LCP (Largest Contentful Paint)** | 1.165s | <2.5s | 🟢 PASS |
| **FID (First Input Delay)** | 16ms | <100ms | 🟢 PASS |
| **CLS (Cumulative Layout Shift)** | 0.000642 | <0.1 | 🟢 PASS |

### Other Scores
- **Accessibility:** 95%
- **Best Practices:** 100%
- **SEO:** 100%

## 🔧 Scripts

### Compare Baseline vs Latest
```bash
npm run lighthouse:compare
# or
./scripts/lighthouse-compare.sh
```

### Run New Production Audit
```bash
npm run lighthouse:production
```

### Run Local Development Audit
```bash
npm run lighthouse:local
```

## 📊 Core Web Vitals Thresholds

### Performance Score
- ✅ **Good:** ≥90%
- ⚠️ **Needs Improvement:** 50-89%
- 🔴 **Poor:** <50%

### Largest Contentful Paint (LCP)
- ✅ **Good:** <2.5s
- ⚠️ **Needs Improvement:** 2.5s-4.0s
- 🔴 **Poor:** >4.0s

### First Input Delay (FID)
- ✅ **Good:** <100ms
- ⚠️ **Needs Improvement:** 100ms-300ms
- 🔴 **Poor:** >300ms

### Cumulative Layout Shift (CLS)
- ✅ **Good:** <0.1
- ⚠️ **Needs Improvement:** 0.1-0.25
- 🔴 **Poor:** >0.25

## 🎯 Performance Monitoring Best Practices

### 1. Run Lighthouse Before Every Deployment
```bash
# In your CI/CD pipeline
npm run lighthouse:production
```

### 2. Check for Regressions
If any metric exceeds thresholds:
- **LCP > 2.5s** → Investigate image optimization, critical CSS
- **FID > 100ms** → Check for JavaScript blocking main thread
- **CLS > 0.1** → Review layout shift sources (images without dimensions, dynamic content)

### 3. Monitor Real User Metrics (RUM)
- **Vercel Analytics** - Built-in Core Web Vitals tracking
- **Google Search Console** - Core Web Vitals report (affects SEO ranking)
- **PostHog Session Replay** - User experience monitoring

### 4. Set Performance Budgets
Update `lighthouserc.json` or `lighthouserc.yml` to enforce limits:
```yaml
assert:
  assertions:
    largest-contentful-paint:
      - error
      - maxNumericValue: 2500  # 2.5s hard limit
```

## 🔍 Investigating Performance Issues

### LCP (Largest Contentful Paint) Too High
1. Check image optimization - use Next.js `<Image>` component
2. Preload critical resources - `<link rel="preload">`
3. Reduce server response time (TTFB)
4. Use CDN (Cloudflare/Vercel Edge)
5. Implement critical CSS inlining

### FID (First Input Delay) Too High
1. Reduce JavaScript bundle size - code splitting
2. Defer non-critical JavaScript - `defer` or `async`
3. Remove unused dependencies
4. Use web workers for heavy computations
5. Optimize third-party scripts

### CLS (Cumulative Layout Shift) Issues
1. Add explicit width/height to images and videos
2. Reserve space for ads/embeds
3. Avoid inserting content above existing content
4. Use `font-display: swap` carefully
5. Preload web fonts

## 📈 Historical Performance Trends

| Date | Performance | LCP | FID | CLS | Notes |
|------|-------------|-----|-----|-----|-------|
| 2026-03-19 | 92% | 1.165s | 16ms | 0.000642 | ✅ All green, improved from baseline |
| (Previous baseline) | 83% | 1.536s | N/A | 0.000642 | Initial baseline |

## 🚀 Performance Optimization Wins

Since initial baseline, we've achieved:
- ✅ **+9% Performance Score** (83% → 92%)
- ✅ **-24% LCP improvement** (1.536s → 1.165s)
- ✅ **-37% Speed Index improvement** (2.863s → 1.812s)
- ✅ **Perfect Best Practices score** (100%)
- ✅ **Perfect SEO score** (100%)

## 📚 Resources

- [Web.dev Core Web Vitals Guide](https://web.dev/vitals/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Next.js Performance Optimization](https://nextjs.org/docs/advanced-features/measuring-performance)
- [Google PageSpeed Insights](https://pagespeed.web.dev/)

## 🔄 Updating the Baseline

When performance improves significantly, update the baseline:
```bash
# Backup old baseline
cp docs/lighthouse/lighthouse-baseline.report.json \
   docs/lighthouse/lighthouse-baseline.report.json.old-$(date +%Y-%m-%d)

# Run new audit
npm run lighthouse:production

# Copy new audit as baseline
cp docs/lighthouse/lighthouse-regression-check.report.json \
   docs/lighthouse/lighthouse-baseline.report.json
```

## ⚠️ When to Create Fix Tasks

Create P0/P1 fix tasks if:
- **Performance Score drops below 90%**
- **LCP exceeds 2.5s**
- **FID exceeds 100ms**
- **CLS exceeds 0.1**
- **Any metric regresses by >20% vs baseline**

Current status: ✅ **No fix tasks needed** - all metrics are excellent!
