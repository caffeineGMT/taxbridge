#!/bin/bash
# SEO Health Check Script
# Verifies production SEO configuration

echo "======================================"
echo "SEO HEALTH CHECK - TaxBridge Production"
echo "======================================"
echo ""

echo "1. Checking production site status..."
SITE_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.taxbridge.app)
if [ "$SITE_STATUS" = "200" ]; then
  echo "   ✅ Site is live (HTTP $SITE_STATUS)"
else
  echo "   ❌ Site returned HTTP $SITE_STATUS"
fi
echo ""

echo "2. Checking sitemap accessibility..."
SITEMAP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.taxbridge.app/sitemap.xml)
if [ "$SITEMAP_STATUS" = "200" ]; then
  echo "   ✅ Sitemap accessible (HTTP $SITEMAP_STATUS)"
  SITEMAP_URLS=$(curl -s https://www.taxbridge.app/sitemap.xml | grep -c "<url>")
  echo "   📊 URLs in sitemap: $SITEMAP_URLS"
else
  echo "   🔴 CRITICAL: Sitemap returns HTTP $SITEMAP_STATUS (NOT FOUND)"
fi
echo ""

echo "3. Checking robots.txt..."
ROBOTS_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.taxbridge.app/robots.txt)
if [ "$ROBOTS_STATUS" = "200" ]; then
  echo "   ✅ robots.txt accessible (HTTP $ROBOTS_STATUS)"
else
  echo "   ❌ robots.txt returns HTTP $ROBOTS_STATUS"
fi
echo ""

echo "4. Checking blog content..."
BLOG_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://www.taxbridge.app/blog/h1b-rsu-tax-calculator-2026-guide)
if [ "$BLOG_STATUS" = "200" ]; then
  echo "   ✅ Blog article accessible (HTTP $BLOG_STATUS)"
else
  echo "   🔴 CRITICAL: Blog articles return HTTP $BLOG_STATUS (NOT FOUND)"
  echo "   📝 0/42 blog articles published"
fi
echo ""

echo "5. Checking Google Search Console verification..."
GSC_VAR=$(grep "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION" .env.production 2>/dev/null)
if [ -n "$GSC_VAR" ] && [ "$GSC_VAR" != "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=" ]; then
  echo "   ✅ GSC verification env var is set"
else
  echo "   🔴 CRITICAL: GSC verification NOT SET in .env.production"
fi
echo ""

echo "6. Checking alternate domain..."
TAXBRIDGECPA_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://taxbridgecpa.com 2>/dev/null || echo "ERROR")
if [ "$TAXBRIDGECPA_STATUS" = "200" ] || [ "$TAXBRIDGECPA_STATUS" = "301" ]; then
  echo "   ✅ taxbridgecpa.com accessible (HTTP $TAXBRIDGECPA_STATUS)"
else
  echo "   ⚠️  taxbridgecpa.com returns HTTP $TAXBRIDGECPA_STATUS (dead domain)"
fi
echo ""

echo "======================================"
echo "DIAGNOSIS SUMMARY"
echo "======================================"
echo ""

# Count critical issues
CRITICAL_ISSUES=0
if [ "$SITEMAP_STATUS" != "200" ]; then
  CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
fi
if [ "$BLOG_STATUS" != "200" ]; then
  CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
fi
if [ -z "$GSC_VAR" ] || [ "$GSC_VAR" = "NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=" ]; then
  CRITICAL_ISSUES=$((CRITICAL_ISSUES + 1))
fi

if [ $CRITICAL_ISSUES -eq 0 ]; then
  echo "✅ SEO Status: HEALTHY"
  echo "   All critical issues resolved!"
else
  echo "🔴 SEO Status: CRITICAL"
  echo "   $CRITICAL_ISSUES critical issue(s) found"
  echo ""
  echo "   See docs/SEO_TRAFFIC_ANALYSIS_2026-03-19.md for full report"
fi
echo ""
echo "======================================"
