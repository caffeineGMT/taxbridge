# Product Hunt Assets

This directory contains all assets for the TaxBridge Product Hunt launch.

## Directory Structure

```
product-hunt/
├── screenshots/          # Product screenshots (1280x800px)
│   ├── hero-dashboard.png
│   ├── ftc-optimizer.png
│   ├── forms-checklist.png
│   ├── pricing-page.png
│   └── pdf-export.png
└── README.md            # This file
```

## Generating Screenshots

### Method 1: Automated (Recommended if Puppeteer works)

Screenshots are automatically generated using Puppeteer.

1. Make sure the Next.js dev server is running:
   ```bash
   npm run dev
   ```

2. Run the screenshot capture script:
   ```bash
   npm run capture:screenshots
   ```

3. Screenshots will be saved to `public/product-hunt/screenshots/`

### Method 2: Manual Capture (Recommended for macOS)

If automated capture fails (Puppeteer issues on macOS), use the manual method:

**See full guide:** `/docs/manual-screenshot-guide.md`

**Quick Steps:**
1. Start dev server: `npm run dev`
2. Open Chrome DevTools (Cmd+Option+I)
3. Toggle Device Toolbar (Cmd+Shift+M)
4. Set to 1280x800 responsive mode
5. Navigate to each page and capture (Cmd+Shift+P → "Capture screenshot")
6. Move screenshots to `public/product-hunt/screenshots/`

**Pages to capture:**
- `/dashboard` (hero-dashboard.png)
- `/dashboard` scrolled to FTC section (ftc-optimizer.png)
- `/forms-checklist` (forms-checklist.png)
- `/pricing` (pricing-page.png)
- `/dashboard` export section (pdf-export.png)

## Product Hunt Specifications

- **Image Dimensions:** 1280x800px (16:10 aspect ratio)
- **File Format:** PNG
- **Max Screenshots:** 10 (we're using 5 high-quality ones)
- **First Screenshot:** Most important - this is what users see first!

## Upload Order

When uploading to Product Hunt, use this sequence:

1. **hero-dashboard.png** - Shows the main value proposition
2. **ftc-optimizer.png** - Demonstrates the FTC calculation feature
3. **forms-checklist.png** - Shows comprehensive tax forms coverage
4. **pricing-page.png** - Transparent pricing builds trust
5. **pdf-export.png** - Professional output for CPAs

## Demo Video

A 60-second Loom demo video is required for Product Hunt launch.

**See full guide:** `/docs/product-hunt-video-checklist.md`

**Quick Steps:**
1. Start dev server: `npm run dev`
2. Prepare demo data (2-3 RSU entries)
3. Sign up at https://loom.com
4. Record screen following the 5-section script
5. Get shareable Loom URL
6. Add to Product Hunt listing

**Recording Coverage (60 seconds):**
- 0-10s: Problem intro (landing page)
- 10-25s: Dashboard & RSU entry demo
- 25-40s: FTC optimizer feature
- 40-50s: Forms checklist & PDF export
- 50-60s: Pricing & CTA

## Tips

- First screenshot should be self-explanatory without reading text
- Show real data (not empty states)
- Highlight key features with subtle annotations if needed
- Keep UI clean and professional
- Mobile screenshots can be added later if needed
- Demo video should be conversational and authentic

---

**For full launch instructions, see:** `/docs/product-hunt-launch-kit.md`
