# TaxBridge Brand Assets

**Version:** 1.0.0
**Generated:** March 19, 2026

---

## Asset Inventory

### Logo Files

| File | Format | Size | Purpose |
|------|--------|------|---------|
| `logo.svg` | SVG | 200x60px | Primary logo for website |
| `favicon.svg` | SVG | 512x512px | Modern browser favicon (scalable) |
| `og-image.svg` | SVG | 1200x630px | Social sharing image (Twitter, Facebook, LinkedIn) |

### Favicon Set (To Generate)

The following PNG assets should be generated from `favicon.svg`:

| File | Size | Purpose |
|------|------|---------|
| `favicon.ico` | Multi-size ICO | Legacy browsers (16x16, 32x32, 48x48) |
| `favicon-16x16.png` | 16x16px | Browser tab icon |
| `favicon-32x32.png` | 32x32px | Browser tab icon (retina) |
| `apple-touch-icon.png` | 180x180px | iOS home screen icon |
| `android-chrome-192x192.png` | 192x192px | Android home screen |
| `android-chrome-512x512.png` | 512x512px | Android splash screen |

### OG Image Set (To Generate)

| File | Size | Purpose |
|------|------|---------|
| `og-image.png` | 1200x630px | Convert `og-image.svg` to PNG for maximum compatibility |

---

## Logo Usage Guidelines

### Primary Logo (`logo.svg`)

**When to use:**
- Website header/navigation
- Email signatures
- Documents and presentations
- Any context where full brand name is needed

**Minimum width:** 120px (do not scale smaller)
**Clearspace:** 16px on all sides
**Background:** Works best on dark backgrounds (slate-950, slate-900)

**Code example:**
```tsx
import Image from 'next/image';

<Image
  src="/logo.svg"
  alt="TaxBridge"
  width={200}
  height={60}
  priority
/>
```

### Favicon (`favicon.svg`)

**When to use:**
- Browser tabs
- Bookmarks
- PWA icons (when PNG variants are generated)

**Features:**
- Scalable SVG (works at any size)
- Calculator icon represents tax calculation functionality
- Gradient matches brand colors (emerald→blue)

### OG Image (`og-image.svg` / `og-image.png`)

**When to use:**
- Social media sharing (Twitter, Facebook, LinkedIn, Slack)
- Blog post previews
- Link previews in messaging apps

**Specifications:**
- **Size:** 1200x630px (2:1 aspect ratio, per Facebook/Twitter guidelines)
- **Format:** PNG (better compatibility) or SVG (smaller file size)
- **Content:** Logo, tagline, key features, URL

**Meta tag implementation:**
```tsx
// Already in app/layout.tsx
<meta property="og:image" content="/og-image.png" />
<meta name="twitter:image" content="/og-image.png" />
```

---

## Asset Generation Steps

### 1. Convert SVG Favicon to PNG Set

Use a tool like ImageMagick, Sharp, or an online converter:

```bash
# Using ImageMagick (if installed)
convert favicon.svg -resize 16x16 favicon-16x16.png
convert favicon.svg -resize 32x32 favicon-32x32.png
convert favicon.svg -resize 180x180 apple-touch-icon.png
convert favicon.svg -resize 192x192 android-chrome-192x192.png
convert favicon.svg -resize 512x512 android-chrome-512x512.png

# Generate multi-size ICO
convert favicon-16x16.png favicon-32x32.png favicon.ico
```

**Online alternative:** [favicon.io](https://favicon.io/) or [RealFaviconGenerator](https://realfavicongenerator.net/)

### 2. Convert OG Image to PNG

```bash
# Using ImageMagick
convert og-image.svg -resize 1200x630 og-image.png
```

**Online alternative:** Any SVG to PNG converter

### 3. Add Favicon Links to Layout

Update `app/layout.tsx` `<head>` section:

```tsx
<head>
  {/* Favicons */}
  <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
  <link rel="manifest" href="/site.webmanifest" />

  {/* Theme color for browser chrome */}
  <meta name="theme-color" content="#10b981" />

  {/* Preconnect for faster load */}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
</head>
```

---

## Logo Variations

### 1. Solid Color Versions

For contexts where gradients don't work (single-color printing, small sizes):

**Emerald version (primary):**
```svg
<text fill="#10b981">TaxBridge</text>
```

**White version (for colored backgrounds):**
```svg
<text fill="#ffffff">TaxBridge</text>
```

**Black version (for light backgrounds):**
```svg
<text fill="#0f172a">TaxBridge</text>
```

### 2. Icon-Only Version

For extremely small sizes (e.g., mobile tabs):
- Use the calculator icon from `favicon.svg`
- Minimum size: 24x24px

---

## Brand Colors in Assets

All assets use the official TaxBridge brand colors:

| Color Name | Hex | Usage in Assets |
|------------|-----|-----------------|
| Emerald-500 | `#10b981` | Primary gradient start, feature icons |
| Emerald-400 | `#34d399` | Text gradient (lighter variant) |
| Blue-600 | `#3b82f6` | Primary gradient end, accent |
| Slate-950 | `#0f172a` | Background |
| Slate-50 | `#f1f5f9` | Text |
| Slate-400 | `#94a3b8` | Secondary text |

---

## File Checklist

### ✅ Created
- [x] `/public/logo.svg`
- [x] `/public/favicon.svg`
- [x] `/public/og-image.svg`
- [x] `/public/site.webmanifest`

### ⏳ To Generate (from SVG sources)
- [ ] `/public/favicon.ico`
- [ ] `/public/favicon-16x16.png`
- [ ] `/public/favicon-32x32.png`
- [ ] `/public/apple-touch-icon.png`
- [ ] `/public/android-chrome-192x192.png`
- [ ] `/public/android-chrome-512x512.png`
- [ ] `/public/og-image.png` (convert from SVG)

### ⏳ To Update
- [ ] Add favicon links to `app/layout.tsx`
- [ ] Update OG image reference to `.png` (if PNG generated)
- [ ] Test all favicons across browsers (Chrome, Safari, Firefox, Edge)

---

## Testing Checklist

### Favicon Testing
- [ ] Chrome desktop: Shows favicon in tab
- [ ] Safari desktop: Shows favicon in tab
- [ ] Firefox desktop: Shows favicon in tab
- [ ] Edge desktop: Shows favicon in tab
- [ ] iOS Safari: Shows apple-touch-icon when added to home screen
- [ ] Android Chrome: Shows android-chrome icon when added to home screen

### OG Image Testing
- [ ] Twitter: Paste URL, verify image preview
- [ ] Facebook: Paste URL, verify image preview (use [Debugger](https://developers.facebook.com/tools/debug/))
- [ ] LinkedIn: Paste URL, verify image preview
- [ ] Slack: Paste URL, verify unfurl preview

---

## Maintenance

**Owner:** Engineering Team
**Review Cadence:** Annual (or when brand colors change)

**Version Control:**
- Keep SVG sources in `/public/` for easy updates
- Regenerate PNG assets if logo changes
- Update `site.webmanifest` if app name or colors change

---

## Design Tool Integration

### Figma
To import these assets into Figma for design work:
1. Drag `logo.svg` into Figma canvas
2. Ungroup and extract gradient definition
3. Create color styles from brand colors
4. Save as reusable component

### Adobe Illustrator
SVG files open directly in Illustrator for editing.

---

**Questions?** Contact the engineering team or refer to `/docs/DESIGN_SYSTEM.md` for full brand guidelines.
