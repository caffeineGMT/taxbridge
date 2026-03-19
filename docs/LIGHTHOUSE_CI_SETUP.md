# Lighthouse CI Setup Guide

**Purpose:** Automated performance monitoring for TaxBridge
**Status:** ✅ CONFIGURED (GitHub Actions integration pending)

---

## Quick Start

### Run Lighthouse Locally

```bash
# Full audit on production
npm run lighthouse

# Desktop preset
npm run lighthouse:production

# Compare current vs baseline
npm run lighthouse:compare
```

### Run Against Local Development

```bash
# 1. Build the app
npm run build

# 2. Start production server
npm start

# 3. In another terminal, run Lighthouse
npm run lighthouse:local
```

---

## Configuration

### File: `.lighthouserc.js`

Lighthouse CI is configured with:
- **3 runs** per URL (median values used)
- **Desktop preset** by default
- **Core Web Vitals thresholds** enforced
- **Automatic report upload** to temporary public storage

### Performance Thresholds

```javascript
{
  // Category scores
  'categories:performance': 85/100 minimum
  'categories:accessibility': 90/100 minimum
  'categories:best-practices': 85/100 minimum
  'categories:seo': 90/100 minimum

  // Core Web Vitals
  LCP: < 2.5s (Largest Contentful Paint)
  FID: < 100ms (First Input Delay)
  CLS: < 0.1 (Cumulative Layout Shift)
  TBT: < 200ms (Total Blocking Time)
}
```

---

## URLs Tested

1. **Homepage:** `http://localhost:3000`
2. **Calculator:** `http://localhost:3000/tax-calculator`
3. **Pricing:** `http://localhost:3000/pricing`

Add more URLs in `.lighthouserc.js`:
```javascript
collect: {
  url: [
    'http://localhost:3000',
    'http://localhost:3000/dashboard', // Add new URL
  ]
}
```

---

## GitHub Actions Integration (Automated CI)

### File: `.github/workflows/lighthouse-ci.yml`

```yaml
name: Lighthouse CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build app
        run: npm run build

      - name: Run Lighthouse CI
        run: npm run lighthouse
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}

      - name: Upload artifacts
        uses: actions/upload-artifact@v4
        with:
          name: lighthouse-reports
          path: .lighthouseci/
```

**Setup:**
1. Copy workflow file to `.github/workflows/lighthouse-ci.yml`
2. Add `LHCI_GITHUB_APP_TOKEN` to GitHub Secrets (optional)
3. Push to trigger first run

---

## Lighthouse Server (Optional - Historical Data)

For long-term performance tracking:

1. **Deploy Lighthouse Server:**
   ```bash
   docker run -p 9001:9001 -v $(pwd)/lhci-data:/data patrickhulce/lhci-server
   ```

2. **Update `.lighthouserc.js`:**
   ```javascript
   upload: {
     target: 'lhci',
     serverBaseUrl: 'https://your-lhci-server.com',
     token: process.env.LHCI_SERVER_TOKEN
   }
   ```

3. **View historical trends** at `https://your-lhci-server.com`

---

## Interpreting Results

### Score Ranges

- **90-100:** ✅ EXCELLENT - Maintain current performance
- **50-89:** ⚠️ NEEDS IMPROVEMENT - Optimize critical metrics
- **0-49:** 🔴 POOR - Major performance issues

### Core Web Vitals Ratings

| Metric | Good | Needs Improvement | Poor |
|--------|------|-------------------|------|
| LCP | < 2.5s | 2.5-4.0s | > 4.0s |
| FID | < 100ms | 100-300ms | > 300ms |
| CLS | < 0.1 | 0.1-0.25 | > 0.25 |

---

## Troubleshooting

### Issue: "Chrome prevented page load"

**Solution:**
```bash
# Clear Lighthouse cache
rm -rf .lighthouseci/

# Run with verbose logging
npx lhci autorun --debug
```

### Issue: "Server timeout"

**Solution:**
```javascript
// Increase timeout in .lighthouserc.js
collect: {
  startServerReadyTimeout: 120000, // 2 minutes
}
```

### Issue: "Module not found"

**Solution:**
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

## Best Practices

### 1. Run Before Every Release

```bash
# Pre-release checklist
npm run build          # Ensure build passes
npm run lighthouse     # Verify performance
git push origin main   # Deploy if passing
```

### 2. Monitor Trends

- Run weekly audits on production
- Compare against baseline (March 19, 2026)
- Alert if performance drops >5%

### 3. Performance Budget Alerts

Set up alerts in `.lighthouserc.js`:
```javascript
assert: {
  assertions: {
    'categories:performance': ['error', { minScore: 0.85 }],
    // Blocks PR if performance < 85/100
  }
}
```

---

## Integration with CI/CD

### Prevent Performance Regressions

**Strategy:**
1. Run Lighthouse on every PR
2. Fail CI if performance < threshold
3. Require manual review if degraded
4. Auto-merge if passing

**Example GitHub Status Check:**
```
✅ Lighthouse CI: All checks passed
   Performance: 91/100
   Accessibility: 95/100
   Core Web Vitals: PASSING
```

---

## Monitoring Schedule

### Automated (Recommended)

- **On every PR:** Full Lighthouse audit
- **Daily (3am PST):** Production audit via cron
- **Weekly:** Comprehensive report sent to team

### Manual (Fallback)

```bash
# Monday morning check
npm run lighthouse:production

# Compare vs last week
npm run lighthouse:compare
```

---

## Metrics to Track

### Primary (Core Web Vitals)
- LCP (Largest Contentful Paint)
- FID (First Input Delay)
- CLS (Cumulative Layout Shift)

### Secondary
- TBT (Total Blocking Time)
- SI (Speed Index)
- TTI (Time to Interactive)

### Tertiary
- Transfer size (total KB)
- Number of requests
- Unused JavaScript %

---

## Cost Analysis

**Free Tier (Current Setup):**
- Local Lighthouse CLI: $0
- Temporary report storage: $0
- GitHub Actions (2,000 min/month): $0

**Premium Options:**
- Lighthouse Server (self-hosted): $5-20/month
- Calibre.app (SaaS monitoring): $99/month
- SpeedCurve: $150/month

**Recommendation:** Start with free tier, upgrade if daily monitoring needed.

---

## Resources

- [Lighthouse Documentation](https://developer.chrome.com/docs/lighthouse)
- [Core Web Vitals Guide](https://web.dev/vitals/)
- [Lighthouse CI GitHub](https://github.com/GoogleChrome/lighthouse-ci)
- [Next.js Performance Docs](https://nextjs.org/docs/advanced-features/measuring-performance)

---

## Support

**Issues?** Check:
1. `docs/LIGHTHOUSE_BASELINE_REPORT.md` - Current metrics
2. `.lighthouserc.js` - Configuration
3. GitHub Actions logs - CI/CD errors
4. Slack #engineering channel

**Contact:** CTO (Michael) for Lighthouse Server setup

---

**Last Updated:** March 19, 2026
**Next Review:** After mobile LCP fixes (March 21, 2026)
