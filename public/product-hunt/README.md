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

Screenshots are automatically generated using Puppeteer.

### Prerequisites

1. Make sure the Next.js dev server is running:
   ```bash
   npm run dev
   ```

2. Run the screenshot capture script:
   ```bash
   npm run capture:screenshots
   ```

3. Screenshots will be saved to `public/product-hunt/screenshots/`

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

## Tips

- First screenshot should be self-explanatory without reading text
- Show real data (not empty states)
- Highlight key features with subtle annotations if needed
- Keep UI clean and professional
- Mobile screenshots can be added later if needed

---

**For full launch instructions, see:** `/docs/product-hunt-launch-kit.md`
