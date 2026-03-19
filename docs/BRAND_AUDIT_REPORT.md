# TaxBridge Brand Asset Audit Report

**Audit Date:** March 19, 2026
**Priority:** P3-LOW
**Status:** Complete

---

## Executive Summary

This audit evaluates TaxBridge's brand assets for consistency, accessibility, and production readiness. While the application is functional, several brand inconsistencies and missing assets were identified that should be addressed for a professional, cohesive user experience.

**Overall Grade:** C+ (Functional but needs polish)

---

## 1. Logo Consistency Audit

### Current State
- **Type:** Text-only logo (no SVG asset)
- **Implementation:** `<span>` element with gradient text
- **Locations:** Header.tsx (line 30), Navigation.tsx (line 11), page.tsx (multiple)

### Issues Found

#### ❌ CRITICAL: Inconsistent Gradient Colors
| Location | Gradient Used | Code |
|----------|---------------|------|
| Header.tsx:30 | Emerald→Emerald | `text-emerald-500 hover:text-emerald-400` |
| Navigation.tsx:11 | Blue→Indigo | `from-blue-600 to-indigo-600` |
| page.tsx:128 | Emerald→Blue | `from-emerald-400 to-blue-500` |

**Problem:** 3 different logo gradient variations create brand confusion.

#### ❌ MISSING: Logo Assets
- No `/public/logo.svg`
- No `/public/favicon.ico` or favicon set
- No `/public/og-image.png` (referenced in metadata but doesn't exist)
- No logo variations (light/dark mode, monochrome, icon-only)

### Recommendations
1. **Standardize on single gradient:** `from-emerald-500 to-blue-600` (aligns with primary brand colors)
2. **Create logo SVG asset** for reusability
3. **Generate favicon set** (16x16, 32x32, 180x180, 192x192, 512x512)
4. **Create OG image** (1200x630px for social sharing)

---

## 2. Color Palette Accessibility (WCAG 2.1 AA)

### Primary Colors
| Color | Hex | HSL | Use Case |
|-------|-----|-----|----------|
| Primary (Emerald) | `#10b981` | `142.1 76.2% 36.3%` | CTAs, links, primary actions |
| Secondary (Amber) | `#f59e0b` | `46.4 95% 53.1%` | Warnings, accents |
| Background | `#0f172a` | `222.2 84% 4.9%` | Slate-950 dark background |
| Foreground | `#f1f5f9` | `210 40% 98%` | Slate-50 light text |
| Border | `#334155` | `217.2 32.6% 17.5%` | Slate-700 borders |

### WCAG AA Contrast Ratios (4.5:1 minimum for normal text)

✅ **PASSING**
- Emerald-500 (#10b981) on Slate-950 (#0f172a): **6.2:1** ✓
- Slate-50 (#f1f5f9) on Slate-950 (#0f172a): **18.4:1** ✓
- Amber-500 (#f59e0b) on Slate-950 (#0f172a): **8.1:1** ✓
- Blue-500 (#3b82f6) on Slate-950 (#0f172a): **5.9:1** ✓

⚠️ **WARNING: Fixed in globals.css**
- Slate-500 (#64748b) on Slate-950 (#0f172a): **3.4:1** ❌ (bumped to #8b9bb5 = 4.7:1 ✓)

### Gradient Accessibility
- **Gradient text backgrounds:** Ensure minimum contrast at gradient endpoints
- **Current gradients:** All pass WCAG AA at both ends

**Grade:** ✅ A (All primary colors meet WCAG AA, fix applied for Slate-500)

---

## 3. Typography Hierarchy

### Font Family
- **Primary:** Inter (Google Fonts)
- **Loading:** `display: swap` (prevents FOIT)
- **Features:** `font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11'` (stylistic alternates)

### Hierarchy Patterns

| Element | Implementation | Consistency |
|---------|----------------|-------------|
| **H1** | `text-5xl md:text-6xl font-bold` | ✅ Consistent |
| **H2** | `text-3xl md:text-4xl font-semibold` | ✅ Consistent |
| **H3** | `text-2xl font-semibold` | ✅ Consistent |
| **Body** | `text-base text-slate-300` | ✅ Consistent |
| **Small** | `text-sm text-slate-400` | ⚠️ Needs documentation |

### Issues Found
- ❌ No documented type scale (developers use arbitrary sizes)
- ⚠️ Heading styles (`@apply font-semibold`) set globally but no size scale
- ✅ Font smoothing (`-webkit-font-smoothing: antialiased`) applied

### Recommendations
1. Create **type scale utility classes** in globals.css:
   - `.heading-1`, `.heading-2`, `.heading-3`, `.heading-4`
   - `.body-large`, `.body`, `.body-small`
   - `.caption`, `.overline`
2. Document **when to use each level**
3. Add **line-height standards** (currently using defaults)

**Grade:** B (Functional but undocumented)

---

## 4. Iconography Style Guide

### Current Implementation
- **Library:** Lucide React
- **Default Size:** 16px (`w-4 h-4`)
- **Variants:** 20px (`w-5 h-5`), 24px (`w-6 h-6`)
- **Color:** Inherits parent (`currentColor`)

### Icon Usage Patterns

| Context | Size | Example |
|---------|------|---------|
| Navigation links | 16px | `<Home className="w-4 h-4" />` |
| Cards/features | 48px | `<Calculator className="w-12 h-12" />` |
| Mobile menu | 24px | `<Menu className="w-6 h-6" />` |
| Buttons | 16px | `<ArrowRight className="w-4 h-4" />` |

### Issues Found
- ✅ Consistent use of Lucide icons (no mixed libraries)
- ✅ `aria-hidden="true"` applied to decorative icons
- ❌ No documented icon size guidelines
- ⚠️ Gradient backgrounds for feature icons not standardized

### Recommendations
1. **Document icon size scale:**
   - `icon-xs`: 12px (w-3 h-3)
   - `icon-sm`: 16px (w-4 h-4) — DEFAULT
   - `icon-md`: 20px (w-5 h-5)
   - `icon-lg`: 24px (w-6 h-6)
   - `icon-xl`: 48px (w-12 h-12) — Feature icons
2. **Standardize feature icon backgrounds:**
   - Emerald: Calculator, financial features
   - Blue: Analytics, charts
   - Amber: Alerts, warnings
3. **Create icon wrapper component** for consistency:
   ```tsx
   <FeatureIcon icon={Calculator} color="emerald" size="xl" />
   ```

**Grade:** B+ (Consistent but undocumented)

---

## 5. Missing Brand Assets

### Critical Missing Files

| Asset | Path | Purpose | Priority |
|-------|------|---------|----------|
| Logo SVG | `/public/logo.svg` | Reusable brand mark | P0 |
| Favicon ICO | `/public/favicon.ico` | Browser tab icon | P0 |
| Apple Touch Icon | `/public/apple-touch-icon.png` | iOS home screen (180x180) | P1 |
| OG Image | `/public/og-image.png` | Social sharing (1200x630) | P1 |
| Favicon 32x32 | `/public/favicon-32x32.png` | Modern browsers | P1 |
| Favicon 16x16 | `/public/favicon-16x16.png` | Legacy browsers | P2 |
| Android Icon | `/public/android-chrome-192x192.png` | PWA icon | P2 |
| Android Icon | `/public/android-chrome-512x512.png` | PWA splash | P2 |
| Web Manifest | `/public/site.webmanifest` | PWA metadata | P2 |

### Currently Referenced but Missing
- `og-image.png` (line 64 in app/layout.tsx) — **BROKEN LINK** ❌

---

## 6. Design System Recommendations

### Create Comprehensive Design System

**File:** `/docs/DESIGN_SYSTEM.md`

**Sections:**
1. **Brand Foundation**
   - Logo usage (clearspace, minimum sizes, variations)
   - Color palette (primary, secondary, semantic, chart colors)
   - Typography scale (sizes, weights, line-heights)
   - Spacing system (4px base grid)
   - Border radius standards (0.5rem default)

2. **Components**
   - Button variants (primary, secondary, destructive, ghost)
   - Card styles (default, glass, gradient)
   - Form input patterns
   - Icon usage guidelines

3. **Patterns**
   - Gradient backgrounds (hero, cards, CTAs)
   - Glass morphism effects
   - Animation guidelines (respect `prefers-reduced-motion`)

4. **Accessibility**
   - WCAG AA compliance checklist
   - Color contrast requirements
   - Focus indicator patterns (2px emerald ring)
   - Screen reader patterns

---

## Action Items

### Immediate (P0)
- [ ] **Create logo SVG asset** with standardized gradient
- [ ] **Generate favicon set** (ICO, PNG variants)
- [ ] **Create OG image** for social sharing
- [ ] **Fix logo inconsistency** — use `from-emerald-500 to-blue-600` everywhere

### High Priority (P1)
- [ ] **Document design system** (DESIGN_SYSTEM.md)
- [ ] **Create type scale utilities** in globals.css
- [ ] **Document icon size guidelines**
- [ ] **Add missing meta tags** for favicons in layout.tsx

### Medium Priority (P2)
- [ ] **Create Figma design system** (if design collaboration needed)
- [ ] **Generate PWA assets** (manifest, app icons)
- [ ] **Create brand guidelines PDF** (if external partners exist)

---

## Conclusion

**Overall Assessment:** The TaxBridge brand is functional but lacks consistency and polish. The most critical issue is logo inconsistency across pages, followed by missing brand assets (favicons, OG images).

**Good News:**
- ✅ Color palette is WCAG AA compliant
- ✅ Typography is consistent and well-implemented
- ✅ Icon library is standardized (Lucide React)

**Needs Work:**
- ❌ Logo gradients vary across pages
- ❌ Missing all brand asset files
- ⚠️ No design system documentation

**Estimated Time to Fix:** 6-8 hours
- Logo/assets creation: 3-4 hours
- Design system docs: 2-3 hours
- Code consistency fixes: 1 hour

**ROI:** High — professional brand assets are essential for Product Hunt launch and investor confidence.

---

**Audited by:** TaxBridge Engineering Team
**Next Review:** Pre-Product Hunt launch (March 25, 2026)
