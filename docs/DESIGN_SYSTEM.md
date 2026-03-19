# TaxBridge Design System

**Version:** 1.0.0
**Last Updated:** March 19, 2026
**Status:** Production

---

## Table of Contents

1. [Brand Foundation](#brand-foundation)
2. [Color Palette](#color-palette)
3. [Typography](#typography)
4. [Spacing System](#spacing-system)
5. [Components](#components)
6. [Patterns](#patterns)
7. [Accessibility](#accessibility)
8. [Usage Examples](#usage-examples)

---

## Brand Foundation

### Logo

**Primary Logo:** Text-only wordmark with gradient
- **Text:** "TaxBridge"
- **Gradient:** `from-emerald-500 to-blue-600` (linear, left to right)
- **Font:** Inter, Bold (700 weight)
- **Minimum Size:** 120px wide (do not scale below)
- **Clearspace:** 16px on all sides minimum

**Logo Variations:**
1. **Primary (Gradient)** — Use on dark backgrounds (default)
2. **Solid Emerald** — Use in small sizes or single-color contexts
3. **White** — Use on colored backgrounds when gradient isn't visible

**Usage Rules:**
```tsx
// ✅ Correct: Standard gradient
<Link href="/" className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-blue-600">
  TaxBridge
</Link>

// ✅ Correct: Solid color fallback
<span className="text-emerald-500 font-bold">TaxBridge</span>

// ❌ Incorrect: Inconsistent gradient
<span className="bg-gradient-to-r from-blue-600 to-indigo-600">TaxBridge</span>
```

---

## Color Palette

### Primary Colors

| Name | Token | Hex | HSL | Usage |
|------|-------|-----|-----|-------|
| **Primary (Emerald)** | `--primary` | `#10b981` | `142.1 76.2% 36.3%` | CTAs, links, primary actions, success states |
| **Accent (Blue)** | `--accent` | `#3b82f6` | `217.2 91.2% 59.8%` | Secondary CTAs, info states, analytics |
| **Warning (Amber)** | `--warning` | `#f59e0b` | `46.4 95% 53.1%` | Warnings, alerts, important notices |
| **Error (Red)** | `--destructive` | `#ef4444` | `0 84.2% 60.2%` | Errors, destructive actions, validation |

### Neutral Colors

| Name | Token | Tailwind | Hex | Usage |
|------|-------|----------|-----|-------|
| **Background** | `--background` | `slate-950` | `#0f172a` | Page background |
| **Surface** | `--card` | `slate-900` | `#1e293b` | Cards, elevated surfaces |
| **Border** | `--border` | `slate-700` | `#334155` | Borders, dividers |
| **Text Primary** | `--foreground` | `slate-50` | `#f1f5f9` | Main text, headings |
| **Text Secondary** | `--muted-foreground` | `slate-400` | `#94a3b8` | Secondary text, descriptions |

### Semantic Colors

| Context | Color | Tailwind Class | Use Case |
|---------|-------|----------------|----------|
| Success | Emerald-500 | `text-emerald-500` | Successful calculations, completed actions |
| Info | Blue-500 | `text-blue-500` | Informational messages, tooltips |
| Warning | Amber-500 | `text-amber-500` | Tax warnings, expiration notices |
| Error | Red-500 | `text-red-500` | Form errors, failed operations |

### Chart Colors

For tax comparison charts and data visualization:

| Chart Element | Variable | Color | Usage |
|---------------|----------|-------|-------|
| Chart 1 | `--chart-1` | Emerald-500 | Canada tax data |
| Chart 2 | `--chart-2` | Blue-500 | US tax data |
| Chart 3 | `--chart-3` | Amber-500 | FTC savings |
| Chart 4 | `--chart-4` | Red-500 | Total tax burden |
| Chart 5 | `--chart-5` | Purple-500 | Multi-year trends |

### Gradients

**Primary Gradient (Hero, CTAs):**
```css
background: linear-gradient(to right, #10b981, #3b82f6);
/* Tailwind: bg-gradient-to-r from-emerald-500 to-blue-600 */
```

**Background Gradient (Page backgrounds):**
```css
background: linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a);
/* Tailwind: bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 */
```

**Feature Icon Gradients:**
- **Calculator/Financial:** `from-emerald-500 to-emerald-600`
- **Analytics/Charts:** `from-blue-500 to-blue-600`
- **Alerts/Warnings:** `from-amber-500 to-amber-600`

### WCAG AA Compliance

All color combinations meet **WCAG 2.1 AA standards** (4.5:1 contrast minimum):

| Foreground | Background | Ratio | Status |
|------------|------------|-------|--------|
| Emerald-500 | Slate-950 | 6.2:1 | ✅ Pass |
| Slate-50 | Slate-950 | 18.4:1 | ✅ Pass |
| Blue-500 | Slate-950 | 5.9:1 | ✅ Pass |
| Amber-500 | Slate-950 | 8.1:1 | ✅ Pass |
| Slate-400 | Slate-950 | 4.7:1 | ✅ Pass (fixed) |

---

## Typography

### Font Family

**Primary Font:** [Inter](https://fonts.google.com/specimen/Inter) (Google Fonts)
- **Weights Used:** 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold)
- **Loading Strategy:** `display: swap` (prevents FOIT)
- **OpenType Features:** `font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11'`

### Type Scale

| Level | Class Name | Size | Weight | Line Height | Usage |
|-------|-----------|------|--------|-------------|-------|
| **H1** | `.heading-1` | `3rem / 4rem` (48px / 64px) | 700 | 1.2 | Page titles |
| **H2** | `.heading-2` | `2.25rem / 3rem` (36px / 48px) | 600 | 1.3 | Section headers |
| **H3** | `.heading-3` | `1.875rem / 2.25rem` (30px / 36px) | 600 | 1.4 | Subsection headers |
| **H4** | `.heading-4` | `1.5rem` (24px) | 600 | 1.5 | Card headers |
| **H5** | `.heading-5` | `1.25rem` (20px) | 600 | 1.5 | List headers |
| **Body Large** | `.body-large` | `1.125rem` (18px) | 400 | 1.6 | Hero descriptions |
| **Body** | `.body` | `1rem` (16px) | 400 | 1.6 | Default text |
| **Body Small** | `.body-small` | `0.875rem` (14px) | 400 | 1.5 | Captions, metadata |
| **Caption** | `.caption` | `0.75rem` (12px) | 500 | 1.4 | Labels, badges |

### Responsive Typography

Headlines scale on mobile:
```tsx
// H1: 3rem on desktop, 2.25rem on mobile
className="text-5xl md:text-6xl font-bold"

// H2: 2.25rem on desktop, 1.875rem on mobile
className="text-3xl md:text-4xl font-semibold"
```

### Implementation (Tailwind)

```css
/* Add to globals.css @layer utilities */
.heading-1 {
  @apply text-5xl md:text-6xl font-bold leading-tight;
}

.heading-2 {
  @apply text-3xl md:text-4xl font-semibold leading-snug;
}

.heading-3 {
  @apply text-2xl md:text-3xl font-semibold leading-normal;
}

.heading-4 {
  @apply text-xl font-semibold leading-normal;
}

.body-large {
  @apply text-lg leading-relaxed;
}

.body {
  @apply text-base leading-relaxed;
}

.body-small {
  @apply text-sm leading-normal;
}

.caption {
  @apply text-xs font-medium leading-tight;
}
```

---

## Spacing System

**Base Unit:** 4px (0.25rem)
**Grid:** 8px (0.5rem) for layout, 4px for fine-tuning

### Spacing Scale (Tailwind)

| Token | Pixels | Rem | Usage |
|-------|--------|-----|-------|
| `0` | 0px | 0 | No spacing |
| `1` | 4px | 0.25rem | Icon gaps, fine adjustments |
| `2` | 8px | 0.5rem | Tight padding, icon spacing |
| `3` | 12px | 0.75rem | Small gaps |
| `4` | 16px | 1rem | Default spacing, card padding |
| `6` | 24px | 1.5rem | Medium spacing |
| `8` | 32px | 2rem | Section spacing |
| `12` | 48px | 3rem | Large spacing |
| `16` | 64px | 4rem | Extra large spacing |
| `24` | 96px | 6rem | Section dividers |

### Layout Spacing

```tsx
// Card padding
<Card className="p-6">  // 24px padding

// Section spacing
<section className="py-16">  // 64px vertical padding

// Component gaps
<div className="flex gap-4">  // 16px gap between items
```

---

## Components

### Buttons

#### Primary Button
**Usage:** Main CTAs, form submissions, critical actions
```tsx
<Button className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white hover:from-emerald-700 hover:to-blue-700 transition-all shadow-lg">
  Calculate Tax
</Button>
```

#### Secondary Button
**Usage:** Secondary actions, cancel buttons
```tsx
<Button variant="secondary" className="bg-slate-800 text-slate-200 hover:bg-slate-700">
  Learn More
</Button>
```

#### Ghost Button
**Usage:** Tertiary actions, links in button form
```tsx
<Button variant="ghost" className="text-emerald-500 hover:bg-emerald-500/10">
  Skip for now
</Button>
```

#### Destructive Button
**Usage:** Delete, remove, dangerous actions
```tsx
<Button variant="destructive" className="bg-red-600 text-white hover:bg-red-700">
  Delete Account
</Button>
```

### Cards

#### Default Card
```tsx
<Card className="bg-slate-900 border border-slate-800 p-6">
  <CardHeader>
    <CardTitle>Tax Summary</CardTitle>
  </CardHeader>
  <CardContent>
    {/* Content */}
  </CardContent>
</Card>
```

#### Glass Card (Glassmorphism)
```tsx
<Card className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm p-6">
  {/* Content */}
</Card>
```

#### Gradient Card (Featured)
```tsx
<Card className="bg-gradient-to-br from-emerald-500/10 to-blue-600/10 border border-emerald-500/30 p-6">
  {/* Highlighted content */}
</Card>
```

### Form Inputs

#### Text Input
```tsx
<Input
  type="text"
  placeholder="Enter amount"
  className="bg-slate-800 border-slate-700 text-slate-100 focus:border-emerald-500 focus:ring-emerald-500"
/>
```

#### Currency Input
```tsx
<CurrencyInput
  label="RSU Value"
  value={value}
  onChange={setValue}
  prefix="$"
  className="bg-slate-800 border-slate-700"
/>
```

### Badges

```tsx
// Success badge
<Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
  Active
</Badge>

// Warning badge
<Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30">
  Expiring Soon
</Badge>

// Info badge
<Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
  Pro
</Badge>
```

---

## Patterns

### Background Gradients

**Page Background:**
```tsx
<div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
  {/* Page content */}
</div>
```

**Grid Pattern Overlay:**
```tsx
<div
  className="absolute inset-0 opacity-10"
  style={{
    backgroundImage: `
      repeating-linear-gradient(0deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px),
      repeating-linear-gradient(90deg, transparent, transparent 80px, rgba(255,255,255,0.05) 80px, rgba(255,255,255,0.05) 81px)
    `,
  }}
/>
```

### Gradient Text

```tsx
<h1 className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
  Cross-Border Tax Made Simple
</h1>
```

### Glass Morphism

```tsx
<div className="bg-slate-900/50 border border-slate-800 backdrop-blur-sm rounded-xl p-6">
  {/* Content */}
</div>
```

### Feature Icons

**Gradient background with icon:**
```tsx
<div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
  <Calculator className="w-6 h-6 text-white" />
</div>
```

**Color coding:**
- Emerald: Financial, calculators
- Blue: Analytics, reports
- Amber: Warnings, deadlines

---

## Iconography

### Icon Library
**Library:** [Lucide React](https://lucide.dev/)
**Style:** Outline (stroke-based icons)
**Stroke Width:** 2px (default)

### Icon Sizes

| Size | Tailwind | Pixels | Use Case |
|------|----------|--------|----------|
| **XS** | `w-3 h-3` | 12px | Badges, tight spaces |
| **SM** | `w-4 h-4` | 16px | **Default** — Navigation, buttons, inline icons |
| **MD** | `w-5 h-5` | 20px | Form labels, card headers |
| **LG** | `w-6 h-6` | 24px | Mobile menu, large buttons |
| **XL** | `w-12 h-12` | 48px | Feature cards, hero sections |

### Common Icons

| Icon | Component | Usage |
|------|-----------|-------|
| Home | `<Home />` | Dashboard, home page |
| Calculator | `<Calculator />` | Tax calculator |
| DollarSign | `<DollarSign />` | RSU entry, financial |
| FileText | `<FileText />` | Forms, documents |
| TrendingUp | `<TrendingUp />` | Multi-year trends |
| Crown | `<Crown />` | Pro/Enterprise tier |
| Gift | `<Gift />` | Referrals, rewards |
| AlertCircle | `<AlertCircle />` | Warnings, alerts |
| CheckCircle | `<CheckCircle />` | Success states |

### Accessibility

Always include `aria-hidden="true"` for decorative icons:
```tsx
<Home className="w-4 h-4" aria-hidden="true" />
<span>Dashboard</span>
```

For icon-only buttons, use `aria-label`:
```tsx
<button aria-label="Close dialog">
  <X className="w-4 h-4" />
</button>
```

---

## Accessibility

### WCAG 2.1 AA Compliance

#### Color Contrast
- **Normal text:** 4.5:1 minimum
- **Large text (18pt+):** 3:1 minimum
- All TaxBridge colors meet AA standards ✅

#### Focus Indicators
**Standard focus ring:**
```tsx
className="focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950"
```

**Utility class:**
```css
.focus-ring {
  @apply focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-slate-950;
}
```

#### Touch Targets
**Minimum size:** 44x44px (WCAG 2.1 AAA)
```tsx
<button className="min-h-[44px] min-w-[44px] p-2">
  <Menu className="w-6 h-6" />
</button>
```

#### Skip Links
Always include skip-to-content link:
```tsx
<SkipLink />  // Already implemented in layout.tsx
```

#### Screen Readers
- Use semantic HTML (`<nav>`, `<main>`, `<article>`)
- Provide `aria-label` for navigation landmarks
- Mark decorative icons with `aria-hidden="true"`
- Use `sr-only` class for screen-reader-only text

```tsx
<span className="sr-only">Loading...</span>
<Spinner className="w-4 h-4" aria-hidden="true" />
```

#### Reduced Motion
Respect `prefers-reduced-motion`:
```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Usage Examples

### Hero Section

```tsx
<section className="py-24 px-6">
  <div className="max-w-4xl mx-auto text-center">
    <h1 className="heading-1 mb-6">
      <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-blue-500">
        Cross-Border Tax
      </span>
      {' '}Made Simple
    </h1>
    <p className="body-large text-slate-300 mb-8">
      Calculate US and Canada taxes on your RSU income in seconds.
      Optimize Foreign Tax Credits automatically.
    </p>
    <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white">
      Get Started Free
    </Button>
  </div>
</section>
```

### Feature Card

```tsx
<Card className="bg-slate-900 border-slate-800 p-6 hover:border-emerald-500/30 transition-all">
  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mb-4">
    <Calculator className="w-6 h-6 text-white" aria-hidden="true" />
  </div>
  <h3 className="heading-4 mb-2">Tax Calculator</h3>
  <p className="body-small text-slate-400">
    Accurate tax estimates for H-1B and TN visa workers
  </p>
</Card>
```

### Form Input

```tsx
<div className="space-y-2">
  <label htmlFor="income" className="body font-medium text-slate-200">
    Annual Salary
  </label>
  <CurrencyInput
    id="income"
    value={income}
    onChange={setIncome}
    className="bg-slate-800 border-slate-700 text-slate-100 focus-ring"
  />
  <p className="body-small text-slate-400">
    Enter your base salary before RSU compensation
  </p>
</div>
```

---

## Implementation Checklist

### Phase 1: Brand Assets (P0)
- [ ] Create logo SVG (`/public/logo.svg`)
- [ ] Generate favicon set (ICO, PNG variants)
- [ ] Create OG image for social sharing
- [ ] Add favicon links to `app/layout.tsx`

### Phase 2: Design System (P1)
- [ ] Add type scale utility classes to `globals.css`
- [ ] Document component variants in Storybook (if needed)
- [ ] Create icon size utility classes
- [ ] Standardize gradient usage across all components

### Phase 3: Figma (P2)
- [ ] Create Figma design system library
- [ ] Add color styles
- [ ] Add text styles
- [ ] Add component variants

---

## Maintenance

**Owner:** Engineering Team
**Review Cadence:** Quarterly
**Version Control:** Increment version on breaking changes

**Changelog:**
- **v1.0.0** (2026-03-19): Initial design system documentation

---

**Questions?** Contact the engineering team or open an issue in the project repo.
