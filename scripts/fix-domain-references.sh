#!/bin/bash
# Fix domain references from taxbridgecpa.com to taxbridge.app

echo "🔧 Fixing domain references: taxbridgecpa.com → taxbridge.app"
echo ""

# List of source files to update (excluding .next build directory)
FILES=(
  "app/(marketing)/cro-test/page.tsx"
  "app/analytics/reddit/page.tsx"
  "app/api/webhooks/calendly/route.ts"
  "app/blog/[slug]/page.tsx"
  "app/dashboard/revenue-analytics/page.tsx"
  "app/lp/calculator/layout.tsx"
  "app/lp/cross-border-tax/layout.tsx"
  "app/lp/guide/layout.tsx"
  "app/lp/h1b-rsu-calculator/layout.tsx"
  "app/lp/social/layout.tsx"
  "app/lp/software/layout.tsx"
  "app/lp/tn-visa-stock-tax/layout.tsx"
  "app/partners/application-submitted/page.tsx"
  "app/partners/dashboard/page.tsx"
  "app/robots.ts"
  "app/sitemap.ts"
  "lib/email/reengagement-templates.ts"
  "lib/email/templates/partnership-cpa.ts"
  "lib/email/templates/partnership-immigration-lawyer.ts"
  "lib/utm-generator.ts"
  "playwright.config.cross-browser.ts"
  "scripts/activate-hunt20-promo.ts"
  "scripts/activate-stripe-production-annual.ts"
  "scripts/immigration-lawyer-followups.ts"
  "scripts/immigration-lawyer-outreach.ts"
  "scripts/setup-posthog.ts"
  "scripts/stripe-activation-assistant.ts"
  "scripts/verify-seo-indexing.ts"
  "tests/cross-browser/calculator.spec.ts"
  "tests/cross-browser/forms.spec.ts"
  "tests/cross-browser/payments.spec.ts"
)

count=0
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    # Use sed to replace taxbridgecpa.com with taxbridge.app
    if grep -q "taxbridgecpa\.com" "$file"; then
      sed -i '' 's/taxbridgecpa\.com/taxbridge.app/g' "$file"
      echo "✅ Updated: $file"
      ((count++))
    fi
  fi
done

echo ""
echo "✅ Fixed $count files"
echo ""
echo "Next steps:"
echo "1. Run: npm run build"
echo "2. Verify: curl -I https://taxbridge.app"
echo "3. Commit: git add -A && git commit -m '[P0-CRITICAL] Fix domain references - taxbridgecpa.com → taxbridge.app'"
echo "4. Push: git push origin main"
