# Performance Budget Enforcement - Quick Reference

## ✅ Thresholds (All Must Pass)

| Metric | Threshold | Type |
|--------|-----------|------|
| **LCP (Largest Contentful Paint)** | < 2.5s | Core Web Vital |
| **FID (First Input Delay)** | < 100ms | Core Web Vital |
| **CLS (Cumulative Layout Shift)** | < 0.1 | Core Web Vital |
| **Total Bundle Size** | < 200KB | Budget |
| **JavaScript Bundle** | < 150KB | Budget |
| **CSS Bundle** | < 30KB | Budget |
| **Performance Score** | ≥ 85% | Overall |
| **Accessibility Score** | ≥ 90% | Overall |

## 🚀 Commands

```bash
# Run performance audit (recommended before commit)
npm run lighthouse

# Production site audit
npm run lighthouse:production

# Local build audit
npm run lighthouse:local

# Analyze bundle size
npm run build:analyze
```

## ❌ Common Failures

### Bundle Size Exceeded (> 200KB)
```bash
# 1. Analyze what's large
npm run build:analyze

# 2. Common fixes:
# - Dynamic import heavy components
# - Tree-shake unused exports
# - Replace large dependencies
# - Optimize images (WebP/AVIF)
```

### LCP Too Slow (> 2.5s)
```bash
# - Use Next.js Image with priority prop
# - Preload critical fonts/CSS
# - Optimize above-the-fold content
# - Check API response times
```

### High CLS (> 0.1)
```bash
# - Set explicit width/height on images
# - Reserve space for dynamic content
# - Don't insert content above viewport
# - Use aspect-ratio CSS property
```

## 📊 Budget Breakdown

**Total: 200KB**
- JS: 150KB (75%) - React, Next.js, app code
- Images: 100KB - Logos, icons (use WebP)
- Fonts: 50KB - Inter font subset
- CSS: 30KB - Tailwind (purged)
- HTML: 20KB - Initial markup

## 🔧 Configuration Files

- `.lighthouserc.js` - Main config + assertions
- `budgets.json` - Resource size/count budgets
- `docs/PERFORMANCE_BUDGET_GUIDE.md` - Full documentation

## 🎯 CI/CD Integration

Lighthouse CI runs on every push to `main`. Build FAILS if:
- Performance score < 85%
- Any Core Web Vitals exceeded
- Bundle size > 200KB
- Any resource budget exceeded

## 📈 Monitoring

```bash
# Daily check
npm run lighthouse:production

# Compare results
npm run lighthouse:compare

# Results location
docs/lighthouse/
```

## 🆘 Need Help?

1. Read full guide: `docs/PERFORMANCE_BUDGET_GUIDE.md`
2. Check bundle analyzer output
3. Review Lighthouse report HTML
4. Web.dev Core Web Vitals guide

## ✅ Pre-Commit Checklist

- [ ] Run `npm run build` (zero errors)
- [ ] Run `npm run lighthouse` (all assertions pass)
- [ ] Bundle < 200KB (check analyzer)
- [ ] No new large dependencies added
- [ ] Images optimized (WebP/AVIF)
- [ ] Dynamic imports for heavy components

---

**Last Updated**: 2026-03-19
**Status**: ✅ Enforced in CI/CD
