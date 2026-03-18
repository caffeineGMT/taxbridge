# LinkedIn Post Visual Asset Specification

## Asset Name
`tax-savings-breakdown-12k.png`

## Dimensions
- **Size**: 1200 x 628 px (LinkedIn optimal image size)
- **Format**: PNG (for crisp text)
- **Resolution**: 72 DPI (web-optimized)

---

## Design Layout

### Overall Style
- Clean, modern, professional
- White background (#FFFFFF)
- Subtle border: 2px solid #E5E7EB
- 32px padding on all sides
- Drop shadow: 0 4px 6px rgba(0, 0, 0, 0.1)

### Typography
- **Heading**: Inter Bold, 32px, #111827
- **Section Labels**: Inter Semibold, 18px, #6B7280
- **Numbers**: Inter Bold, 24px
  - Negative (wrong): #EF4444 (red)
  - Positive (optimized): #10B981 (green)
- **Body text**: Inter Regular, 16px, #6B7280

---

## Content Structure

```
┌───────────────────────────────────────────────────────────┐
│                                                           │
│   Your Cross-Border RSU Tax Savings                       │  ← Heading (Inter Bold 32px, #111827)
│                                                           │
│   ┌─────────────────────────────────────────────────┐    │
│   │  ❌ Without Foreign Tax Credit (Filing Wrong)   │    │  ← Section label (18px, semibold)
│   │                                                 │    │
│   │  US Taxes Paid:          $28,000               │    │  ← Numbers (24px bold, #EF4444 red)
│   │  Canada Taxes Paid:      $24,000               │    │
│   │  ─────────────────────────────────              │    │
│   │  Total Tax Burden:       $52,000 ❌            │    │  ← Large X emoji
│   │                                                 │    │
│   └─────────────────────────────────────────────────┘    │
│                                                           │
│   ┌─────────────────────────────────────────────────┐    │
│   │  ✅ With Foreign Tax Credit (Optimized)         │    │  ← Section label (18px, semibold)
│   │                                                 │    │
│   │  US Taxes Paid:          $16,000               │    │  ← Numbers (24px bold, #10B981 green)
│   │  Canada Taxes Paid:      $24,000               │    │
│   │  ─────────────────────────────────              │    │
│   │  Total Tax Burden:       $40,000 ✅            │    │  ← Large checkmark emoji
│   │                                                 │    │
│   └─────────────────────────────────────────────────┘    │
│                                                           │
│   ┌─────────────────────────────────────────────────┐    │
│   │                                                 │    │
│   │       💰 Tax Savings: $12,000                   │    │  ← Highlighted (32px bold, #2563EB blue)
│   │                                                 │    │
│   └─────────────────────────────────────────────────┘    │
│                                                           │
│   Based on $80K RSU vesting, H-1B holder moving to CA    │  ← Footer (14px, #9CA3AF gray)
│                                                           │
│                                      [TaxBridge logo]     │  ← Logo 60x60px, bottom-right
└───────────────────────────────────────────────────────────┘
```

---

## Color Palette

### From TaxBridge Design System

| Element | Color Code | Usage |
|---------|------------|-------|
| Primary Blue | `#2563EB` | Savings amount, accents |
| Success Green | `#10B981` | Optimized scenario, checkmarks |
| Error Red | `#EF4444` | Wrong scenario, losses |
| Text Primary | `#111827` | Heading, main text |
| Text Secondary | `#6B7280` | Labels, supporting text |
| Text Tertiary | `#9CA3AF` | Footer note |
| Background | `#FFFFFF` | Main background |
| Surface | `#F9FAFB` | Section cards |
| Border | `#E5E7EB` | Dividers, outlines |

---

## Detailed Specs

### Heading
- **Text**: "Your Cross-Border RSU Tax Savings"
- **Font**: Inter Bold
- **Size**: 32px
- **Color**: #111827
- **Position**: Top center, 48px from top

### Section 1: Without FTC (Wrong Way)
- **Background**: #FEF2F2 (very light red tint)
- **Border**: 2px solid #FCA5A5 (light red)
- **Border-radius**: 8px
- **Padding**: 24px
- **Position**: 120px from top

**Content:**
```
❌ Without Foreign Tax Credit (Filing Wrong)

US Taxes Paid:          $28,000
Canada Taxes Paid:      $24,000
─────────────────────────────────
Total Tax Burden:       $52,000 ❌
```

### Section 2: With FTC (Optimized)
- **Background**: #F0FDF4 (very light green tint)
- **Border**: 2px solid #86EFAC (light green)
- **Border-radius**: 8px
- **Padding**: 24px
- **Position**: 320px from top

**Content:**
```
✅ With Foreign Tax Credit (Optimized)

US Taxes Paid:          $16,000
Canada Taxes Paid:      $24,000
─────────────────────────────────
Total Tax Burden:       $40,000 ✅
```

### Section 3: Savings Highlight
- **Background**: Linear gradient (#EFF6FF to #DBEAFE)
- **Border**: 2px solid #2563EB
- **Border-radius**: 12px
- **Padding**: 32px
- **Position**: 520px from top
- **Text-align**: Center

**Content:**
```
💰 Tax Savings: $12,000
```
- **Font**: Inter Bold, 32px
- **Color**: #2563EB (primary blue)

### Footer Note
- **Text**: "Based on $80K RSU vesting, H-1B holder moving to Canada"
- **Font**: Inter Regular, 14px
- **Color**: #9CA3AF
- **Position**: Bottom, 16px from bottom
- **Text-align**: Center

### Logo
- **File**: TaxBridge logo (create simple text-based logo if needed)
- **Size**: 60 x 60 px
- **Position**: Bottom-right corner, 24px from edges
- **Opacity**: 100%

---

## Export Settings

### Figma / Design Tool
1. Create 1200 x 628 px artboard
2. Use Inter font family (Google Fonts)
3. Set up 8px grid system
4. Use spacing: 16px, 24px, 32px, 48px
5. Export as PNG (@2x for retina, then downscale to 1200x628)

### Optimization
- Run through TinyPNG for compression
- Target file size: <300KB (LinkedIn optimal)
- Ensure text is sharp at 100% zoom
- Test on mobile preview (most LinkedIn users are mobile)

---

## Alternative Versions

### A/B Test Variant 1: Simplified
- Remove section backgrounds
- Just show two columns side-by-side
- Bigger savings number (48px)
- More white space

### A/B Test Variant 2: Percentage Focus
- Show "23% tax savings" instead of dollar amount
- Add pie chart visual
- More data-viz oriented

### A/B Test Variant 3: Personal Touch
- Include small profile photo
- Add quote: "I overpaid $12K. Don't make my mistake."
- More human, less corporate

---

## Production Timeline

1. **Design Draft** (1 hour)
   - Create in Figma or Canva
   - Use exact specs above
   - Get V1 done quickly

2. **Review & Iterate** (30 min)
   - Check mobile preview
   - Verify all numbers are accurate
   - Ensure brand consistency

3. **Export & Optimize** (15 min)
   - Export PNG at correct size
   - Compress with TinyPNG
   - Upload to LinkedIn as test

4. **Finalize** (15 min)
   - Confirm looks good in LinkedIn preview
   - Save to `/public/images/social/` directory
   - Ready for Tuesday 8 AM launch

**Total Time**: ~2 hours

---

## Tools

**Option 1: Figma** (Recommended)
- Professional design tool
- Perfect text rendering
- Easy to iterate
- Free tier sufficient

**Option 2: Canva**
- Faster setup
- Templates available
- Export quality may be lower
- Use "Custom Dimensions" → 1200 x 628

**Option 3: Code (HTML/CSS + Screenshot)**
- Build as HTML/CSS
- Take screenshot with headless browser
- Most accurate to design system
- Overkill for simple image

---

## File Location

Save final asset to:
```
/Users/michaelguo/hivemind-projects/cross-border-tax/public/images/social/tax-savings-breakdown-12k.png
```

This allows easy embedding in LinkedIn post upload.

---

## Quality Checklist

Before publishing, verify:
- [ ] Image is exactly 1200 x 628 px
- [ ] File size < 300KB
- [ ] All numbers are accurate ($28K, $24K, $52K, $16K, $40K, $12K)
- [ ] Colors match TaxBridge brand (#2563EB, #10B981, #EF4444)
- [ ] Text is crisp and readable on mobile
- [ ] No typos in any text
- [ ] Logo is visible but not distracting
- [ ] Looks good in LinkedIn preview (test upload as draft)
- [ ] Accessible: sufficient color contrast (WCAG AA minimum)
