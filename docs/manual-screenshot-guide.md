# Manual Product Hunt Screenshot Guide

**Quick Method:** Use Chrome DevTools Device Mode for consistent 1280x800px screenshots

## Prerequisites

- Dev server running: `npm run dev`
- Chrome browser open
- Clean browser session (incognito recommended)

---

## Screenshot Setup (Chrome DevTools Method)

### Step 1: Open DevTools Device Mode

1. Open Chrome and navigate to `http://localhost:3000`
2. Press `Cmd + Option + I` (Mac) or `F12` (Windows) to open DevTools
3. Click the **Toggle Device Toolbar** icon (phone/tablet icon) or press `Cmd + Shift + M`
4. In the device dropdown at the top, select **"Responsive"**
5. Set dimensions to **1280 x 800** (Product Hunt recommended)
6. Set zoom to **100%** (important!)

### Step 2: Take Full-Page Screenshots

Chrome DevTools can capture full-page screenshots even in device mode:

1. With DevTools open, press `Cmd + Shift + P` (Mac) or `Ctrl + Shift + P` (Windows)
2. Type "screenshot" in the command palette
3. Select **"Capture screenshot"** (captures viewport only, good for most shots)
   - OR **"Capture full size screenshot"** (for pages with scroll content)

Screenshots auto-download to your Downloads folder.

---

## Required Screenshots (5 total)

### Screenshot 1: Hero Dashboard
**Filename:** `hero-dashboard.png`
**URL:** `http://localhost:3000/dashboard`
**Focus:** Main dashboard with RSU entries visible
**Viewport:** Above the fold, show header + 2-3 RSU entries

**Capture Instructions:**
1. Navigate to `/dashboard`
2. Ensure 2-3 demo RSU entries are visible (add them if needed)
3. Position viewport to show: TaxBridge logo, navigation, main dashboard heading, RSU table
4. Capture screenshot (Cmd+Shift+P → "Capture screenshot")
5. Rename to `hero-dashboard.png`

---

### Screenshot 2: FTC Optimizer
**Filename:** `ftc-optimizer.png`
**URL:** `http://localhost:3000/dashboard`
**Focus:** Foreign Tax Credit calculation with dual-country breakdown
**Viewport:** Scroll to tax summary section

**Capture Instructions:**
1. Stay on `/dashboard`
2. Scroll down to the tax summary/FTC calculation section
3. Ensure the dual-country tax breakdown is visible
4. Show: US tax, Canada tax, FTC credit amount, net savings
5. Capture screenshot
6. Rename to `ftc-optimizer.png`

---

### Screenshot 3: Forms Checklist
**Filename:** `forms-checklist.png`
**URL:** `http://localhost:3000/forms-checklist`
**Focus:** Required tax forms checklist (W-2, 1040, T1, T4, FBAR, 8938, 8833)
**Viewport:** Top of page showing heading + first 5-6 forms

**Capture Instructions:**
1. Navigate to `/forms-checklist`
2. Position viewport to show the page heading and checklist items
3. Ensure key forms are visible: W-2, Form 1040, T1, FBAR, Form 8833
4. Capture screenshot
5. Rename to `forms-checklist.png`

---

### Screenshot 4: Pricing Page
**Filename:** `pricing-page.png`
**URL:** `http://localhost:3000/pricing`
**Focus:** All 3 pricing tiers with Pro plan highlighted
**Viewport:** Show all three pricing cards if possible

**Capture Instructions:**
1. Navigate to `/pricing`
2. Position viewport to show all three pricing tiers (Free, Pro, Enterprise)
3. Ensure "Most Popular" badge is visible on Pro tier
4. Show pricing amounts clearly
5. Capture screenshot (may need "Capture full size screenshot" if cards don't fit)
6. Rename to `pricing-page.png`

---

### Screenshot 5: PDF Export Preview
**Filename:** `pdf-export.png`
**URL:** `http://localhost:3000/dashboard`
**Focus:** PDF export button or sample export
**Viewport:** Bottom of dashboard or dedicated export section

**Capture Instructions:**
1. Navigate to `/dashboard`
2. Scroll to where PDF export functionality is shown
3. If there's an export button/section, capture that
4. Alternative: Navigate to wherever PDF sample/preview is shown
5. Capture screenshot
6. Rename to `pdf-export.png`

---

## Post-Capture Checklist

After capturing all 5 screenshots:

- [ ] All images are 1280x800px (check file properties)
- [ ] Text is readable at 100% zoom
- [ ] No personal/sensitive information visible
- [ ] Screenshots show realistic demo data (not "Test User" or placeholder values)
- [ ] Color scheme and branding look professional
- [ ] First screenshot (hero-dashboard) is the most compelling

---

## Moving Screenshots to Project

```bash
# Create the output directory if it doesn't exist
mkdir -p /Users/michaelguo/hivemind-projects/cross-border-tax/public/product-hunt/screenshots/

# Move screenshots from Downloads (update path as needed)
mv ~/Downloads/hero-dashboard.png /Users/michaelguo/hivemind-projects/cross-border-tax/public/product-hunt/screenshots/
mv ~/Downloads/ftc-optimizer.png /Users/michaelguo/hivemind-projects/cross-border-tax/public/product-hunt/screenshots/
mv ~/Downloads/forms-checklist.png /Users/michaelguo/hivemind-projects/cross-border-tax/public/product-hunt/screenshots/
mv ~/Downloads/pricing-page.png /Users/michaelguo/hivemind-projects/cross-border-tax/public/product-hunt/screenshots/
mv ~/Downloads/pdf-export.png /Users/michaelguo/hivemind-projects/cross-border-tax/public/product-hunt/screenshots/
```

Or use Finder to drag files to: `/Users/michaelguo/hivemind-projects/cross-border-tax/public/product-hunt/screenshots/`

---

## Product Hunt Upload Order

When uploading to Product Hunt, use this order (most compelling first):

1. **hero-dashboard.png** - First impression, show the product in action
2. **ftc-optimizer.png** - Highlight the unique value prop (FTC calculation)
3. **pricing-page.png** - Transparency builds trust
4. **forms-checklist.png** - Show comprehensiveness
5. **pdf-export.png** - Professional export feature

---

## Alternative: Screenshot via macOS

If DevTools method doesn't work:

1. Set browser window to exact size using window managers (Rectangle, Magnet)
2. Navigate to each page
3. Press `Cmd + Shift + 4` → Press `Space` → Click window to capture
4. Crop to remove browser chrome if needed using Preview

---

## Troubleshooting

**Issue:** Screenshots are not 1280x800px
- **Fix:** Ensure DevTools Responsive mode is set to exactly 1280x800
- **Fix:** Ensure zoom is 100% (not 110% or 90%)

**Issue:** Text is blurry
- **Fix:** Use "Capture screenshot" not "Capture full size screenshot" for above-fold content
- **Fix:** Ensure your display is not scaled weirdly in System Preferences

**Issue:** Can't find screenshots
- **Fix:** Check `~/Downloads` folder - Chrome saves there by default
- **Fix:** Check Chrome settings → Downloads → Location

---

## Next Steps

After screenshots are ready:

1. ✅ Review all 5 screenshots for quality
2. ✅ Record 60-second Loom demo video (see `docs/demo-video-script.md`)
3. ✅ Upload screenshots to Product Hunt listing
4. ✅ Add Loom video URL to Product Hunt listing

**Ready to rock! 🚀**
