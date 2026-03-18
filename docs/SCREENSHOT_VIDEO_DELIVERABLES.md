# Product Hunt Screenshot & Video Deliverables

**Task:** Generate Product Hunt screenshots and record demo video
**Status:** ✅ Infrastructure Complete - Manual Execution Required
**Date:** March 18, 2026

---

## 📦 Deliverables

### ✅ Completed

1. **Manual Screenshot Guide** - `/docs/manual-screenshot-guide.md`
   - Step-by-step Chrome DevTools capture instructions
   - 5 screenshots at 1280x800px (Product Hunt spec)
   - Quality checklist and upload order

2. **Demo Video Guide** - `/docs/product-hunt-video-checklist.md`
   - 60-second Loom recording checklist
   - Shot-by-shot script with precise timings
   - Pre/post-recording setup and quality checks

3. **Product Hunt README** - `/public/product-hunt/README.md`
   - Both automated and manual methods documented
   - Quick reference for screenshot and video creation
   - Upload tips and specifications

4. **Task Summary** - `/TASK_COMPLETION_SUMMARY.md`
   - Technical decisions and troubleshooting history
   - Why manual method is required (macOS automation issues)
   - Complete next steps and resources

5. **Automated Scripts** (for reference, won't run on this system)
   - `/scripts/capture-screenshots.ts` (Puppeteer)
   - `/scripts/capture-screenshots-playwright.ts` (Playwright)

### ⏳ Pending (Manual Execution Required)

1. **5 Screenshots** (15 minutes)
   - Capture using Chrome DevTools at 1280x800px
   - Save to: `public/product-hunt/screenshots/`
   - Files: hero-dashboard.png, ftc-optimizer.png, forms-checklist.png, pricing-page.png, pdf-export.png

2. **60-Second Demo Video** (30 minutes)
   - Record via Loom following 5-section script
   - Get shareable Loom URL
   - Add to Product Hunt listing

---

## 🚀 Quick Start: Capture Screenshots

### Step 1: Start Dev Server
```bash
npm run dev
```

### Step 2: Open Chrome DevTools
1. Open Chrome and navigate to `http://localhost:3000`
2. Press **Cmd+Option+I** to open DevTools
3. Click **Device Toolbar** icon (or **Cmd+Shift+M**)
4. Set to **Responsive** mode
5. Enter dimensions: **1280 x 800**
6. Set zoom to **100%**

### Step 3: Capture Each Screenshot
For each page, press **Cmd+Shift+P** → Type "screenshot" → Select **"Capture screenshot"**

| # | Page | Filename | What to Show |
|---|------|----------|--------------|
| 1 | `/dashboard` | `hero-dashboard.png` | Full dashboard with RSU entries (HERO IMAGE) |
| 2 | `/dashboard` (scroll to FTC) | `ftc-optimizer.png` | Tax calculation with FTC breakdown |
| 3 | `/forms-checklist` | `forms-checklist.png` | Complete tax forms checklist |
| 4 | `/pricing` | `pricing-page.png` | All 3 pricing tiers, Pro highlighted |
| 5 | `/dashboard` (bottom) | `pdf-export.png` | PDF export button/section |

### Step 4: Move Screenshots
```bash
# Move from Downloads to project
mv ~/Downloads/hero-dashboard.png public/product-hunt/screenshots/
mv ~/Downloads/ftc-optimizer.png public/product-hunt/screenshots/
mv ~/Downloads/forms-checklist.png public/product-hunt/screenshots/
mv ~/Downloads/pricing-page.png public/product-hunt/screenshots/
mv ~/Downloads/pdf-export.png public/product-hunt/screenshots/
```

---

## 🎥 Quick Start: Record Demo Video

### Step 1: Prepare Demo Data
Add 2-3 realistic RSU entries to dashboard:
- **Meta:** 125 shares, Aug 15 2025, FMV $524.30
- **Amazon:** 32 shares, Nov 1 2025, FMV $201.85

### Step 2: Set Up Loom
1. Go to https://loom.com (free account)
2. Click **"Record"**
3. Select **"Screen Only"** or **"Screen + Cam"**
4. Choose **"Current Tab"** or **"Full Desktop"**

### Step 3: Record Following This Script (60 seconds)

**0-10s:** Landing page hero
> "Are you an H-1B or TN visa tech worker with RSU income now living in Canada? Cross-border taxes are a nightmare. You're getting taxed twice..."

**10-25s:** Dashboard with RSU entries
> "TaxBridge automates dual-country tax calculations. Just enter your RSU vesting details and instantly see both your US and Canada tax obligations..."

**25-40s:** Tax calculation (FTC section)
> "Our Foreign Tax Credit optimizer calculates exactly how much Canadian tax you can claim as a credit. Real users save $2,000-$4,000 per year..."

**40-50s:** Forms checklist
> "You get a complete checklist of every required form - W-2, 1040, T1, T4, FBAR, 8938, Form 8833. Export PDF reports to share with your CPA..."

**50-60s:** Pricing page
> "Try TaxBridge free today. The Pro plan is just $299/year. Use code HUNT20 for 20% off for the next 48 hours. Link in description!"

### Step 4: Get Loom URL
1. Click **"Finish"** in Loom
2. Loom auto-uploads and generates link
3. Click **"Share"** → Copy URL
4. Save URL for Product Hunt listing

---

## ✅ Quality Checklist

Before uploading to Product Hunt:

### Screenshots
- [ ] All 5 files saved to `public/product-hunt/screenshots/`
- [ ] Each file is exactly 1280x800px
- [ ] Text is crisp and readable at 100% zoom
- [ ] No browser chrome/UI visible
- [ ] No personal information visible
- [ ] Demo data looks realistic (not "Test User" or placeholders)
- [ ] First screenshot (hero-dashboard) is the most compelling

### Demo Video
- [ ] Duration is 55-65 seconds (targeting 60s)
- [ ] Audio is clear with no background noise
- [ ] All 5 sections covered
- [ ] Cursor movements are smooth and deliberate
- [ ] No personal info visible
- [ ] Loom URL is shareable and accessible

---

## 🎯 Product Hunt Upload Order

When uploading to Product Hunt, use this order:

1. **hero-dashboard.png** ⭐ (First impression - make it count!)
2. **ftc-optimizer.png** (Highlight unique value prop)
3. **pricing-page.png** (Transparency builds trust)
4. **forms-checklist.png** (Show comprehensiveness)
5. **pdf-export.png** (Professional export feature)

---

## 🛠 Technical Notes

### Why Manual Method?

Automated screenshot capture fails on this macOS system due to Chromium crashpad permission errors:
```
ERROR: bootstrap_check_in org.chromium.crashpad.child_port_handshake: Permission denied (1100)
Received signal 11 SEGV_ACCERR
```

**Tested and Failed:**
- ✗ Puppeteer headless
- ✗ Puppeteer with system Chrome
- ✗ Playwright headless
- ✗ Playwright headed (visible window)

This is a macOS system-level security/entitlements issue, not a script configuration problem. Manual capture via Chrome DevTools is more reliable anyway and provides better quality control.

---

## 📚 Resources

### Full Guides
- **Screenshot Guide:** `/docs/manual-screenshot-guide.md`
- **Video Checklist:** `/docs/product-hunt-video-checklist.md`
- **Original Video Script:** `/docs/demo-video-script.md`
- **Task Summary:** `/TASK_COMPLETION_SUMMARY.md`

### External Tools
- **Loom:** https://loom.com
- **Chrome DevTools:** Press `Cmd+Option+I` (Mac) or `F12` (Windows)

---

## ⏱ Time Estimates

- **Screenshots (manual):** 15 minutes
- **Demo video (with practice):** 30 minutes
- **Quality review:** 5 minutes
- **Total:** ~50 minutes

---

## 🎉 Next Steps After Completion

1. Review all screenshots and video for quality
2. Upload screenshots to Product Hunt (hero-dashboard.png first!)
3. Add Loom video URL to Product Hunt listing
4. Optional: Add annotations to screenshots using Figma/Canva
5. Launch on Product Hunt! 🚀

---

**Status:** All guides and infrastructure ready. Manual execution required for screenshots and video recording.

**Questions?** See the full guides in `/docs/` directory.
