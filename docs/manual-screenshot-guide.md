# Manual Screenshot Guide for Product Hunt

Due to headless browser compatibility issues on this system, here's a manual approach to capture high-quality screenshots.

## Quick Setup

### 1. Set Browser Window to Product Hunt Dimensions
1. Open Chrome/Firefox
2. Press `Cmd+Option+I` to open DevTools
3. Click the device toolbar icon (phone/tablet icon) or press `Cmd+Shift+M`
4. Select "Responsive" and set dimensions to **1280x800**
5. Navigate to `http://localhost:3000`

### 2. Capture Screenshots

For each screenshot below:
1. Navigate to the URL
2. Wait for page to fully load
3. Use Chrome DevTools: `Cmd+Shift+P` → "Capture screenshot"
4. Save as the specified filename in `/public/product-hunt/screenshots/`

---

## Screenshot List (5 total)

### Screenshot 1: hero-dashboard.png
**URL:** `/dashboard`
**Description:** Main dashboard with RSU entries and tax overview
**What to show:**
- Full dashboard view
- RSU entries table with 2-3 entries visible
- Tax summary prominently displayed
- Clean, professional layout

**Tips:**
- This is your HERO image - make it count!
- Show realistic demo data (Meta, Amazon, Google RSUs)
- Ensure all text is readable

---

### Screenshot 2: ftc-optimizer.png
**URL:** `/dashboard` (scroll to tax summary section)
**Description:** Foreign Tax Credit calculation results
**What to show:**
- Scroll down to the tax calculation section
- Highlight FTC breakdown showing US + Canada taxes
- Show the "Net Tax Saved" number prominently
- Dual-country taxation visualization

**Tips:**
- This is your key differentiator
- Make sure dollar amounts are visible
- Show the savings clearly (e.g., "$4,100 saved")

---

### Screenshot 3: forms-checklist.png
**URL:** `/forms-checklist`
**Description:** Required tax forms checklist
**What to show:**
- Complete checklist of forms (W-2, 1040, T1, T4, FBAR, 8938, 8833)
- Checkboxes visible
- Clean, organized layout

**Tips:**
- Shows comprehensiveness of the tool
- Demonstrates value beyond just calculations

---

### Screenshot 4: pricing-page.png
**URL:** `/pricing`
**Description:** Pricing tiers with Pro plan highlighted
**What to show:**
- All pricing tiers visible
- Pro tier with "Most Popular" badge
- Price clearly visible ($299/year)
- "Start 7-Day Free Trial" button

**Tips:**
- Transparency builds trust
- Show value proposition clearly

---

### Screenshot 5: pdf-export.png
**URL:** `/dashboard` (scroll to bottom)
**Description:** PDF export capability
**What to show:**
- Dashboard with "Export PDF" button visible
- Professional formatting

**Tips:**
- Shows professional output users can share with CPAs

---

## Quality Checklist

Before saving each screenshot:
- [ ] Dimensions are **1280x800px**
- [ ] No browser chrome visible
- [ ] All text is crisp and readable
- [ ] No personal information visible
- [ ] Demo data looks realistic
- [ ] UI is fully rendered

---

## Upload Order to Product Hunt

1. **hero-dashboard.png** (MOST IMPORTANT - first image)
2. ftc-optimizer.png
3. forms-checklist.png
4. pricing-page.png
5. pdf-export.png

**Ready to capture?** Open `http://localhost:3000` in Chrome DevTools responsive mode (1280x800)! 📸
