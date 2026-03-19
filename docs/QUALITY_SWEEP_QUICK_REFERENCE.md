# Product Quality Sweep - Quick Reference

## Test Commands

```bash
# Run all accessibility tests
npm run test:e2e -- tests/accessibility/

# Run mobile responsiveness tests
npm run test:e2e -- tests/mobile/

# Run cross-browser tests
npm run test:e2e -- tests/cross-browser/

# Run specific browser
npm run test:e2e:chrome  # Chromium
npm run test:e2e:firefox # Firefox
npm run test:e2e:safari  # WebKit (Safari)

# Run mobile device tests
npm run test:e2e:mobile  # All mobile devices
```

## Manual Testing Checklist

### iOS Safari (Real Device Required)
- [ ] Open https://taxbridge.app on iPhone 13+
- [ ] Test calculator input with mobile keyboard
- [ ] Verify touch targets ≥44x44px
- [ ] Test navigation and scrolling
- [ ] Test form submission
- [ ] Verify no horizontal scroll
- [ ] Test landscape mode
- [ ] Test safe area insets (notch)

### Android Chrome (Real Device Required)
- [ ] Open https://taxbridge.app on Android device
- [ ] Test calculator input
- [ ] Verify touch targets
- [ ] Test all interactive elements
- [ ] Test landscape mode

### Safari macOS
- [ ] Test gradient rendering
- [ ] Test backdrop-blur effects
- [ ] Test keyboard navigation (Tab/Shift+Tab)
- [ ] Test VoiceOver screen reader (Cmd+F5)

### Firefox Desktop
- [ ] Test layout consistency
- [ ] Test form interactions
- [ ] Test JavaScript execution

### Screen Reader Testing
- [ ] VoiceOver (macOS): Cmd+F5
- [ ] NVDA (Windows): Free download
- [ ] JAWS (Windows): Commercial
- [ ] Verify all content is announced
- [ ] Verify form labels are read
- [ ] Verify error messages are announced

### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Verify visible focus indicators
- [ ] Ensure all actions available via keyboard
- [ ] Test escape to close modals
- [ ] Test arrow keys in dropdowns

## Critical Issues to Fix

1. **Add Skip Link** (Severity: HIGH)
   ```tsx
   // Add to app/layout.tsx
   <a href="#main-content" className="sr-only focus:not-sr-only">
     Skip to main content
   </a>
   ```

2. **Add Mobile Navigation** (Severity: HIGH)
   - Implement hamburger menu for screens < 768px

3. **Verify Form Labels** (Severity: HIGH)
   - All inputs must have associated `<label>` or `aria-label`

4. **Test Color Contrast** (Severity: MEDIUM)
   - Use https://webaim.org/resources/contrastchecker/
   - Minimum ratio: 4.5:1 (WCAG AA)

5. **Add Image Alt Text** (Severity: MEDIUM)
   - All `<img>` must have `alt` attribute
   - Decorative images: `alt=""` or `role="presentation"`

## Test Results Summary

| Test Suite | Tests | Status |
|------------|-------|--------|
| Accessibility | 35 | ✅ Created |
| Mobile | 45+ | ✅ Created |
| Cross-Browser | 30+ | ✅ Created |
| Manual QA | - | ⏳ Pending |

## Quick Fixes

### 1. Add Skip Link
```tsx
// app/layout.tsx - Add before header
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-white focus:text-black focus:px-4 focus:py-2 focus:rounded">
  Skip to main content
</a>
```

### 2. Ensure Form Labels
```tsx
// Before
<input type="text" />

// After
<label htmlFor="rsu-income">RSU Income</label>
<input type="text" id="rsu-income" />

// Or with aria-label
<input type="text" aria-label="RSU Income" />
```

### 3. Add Image Alt Text
```tsx
// Before
<img src="/logo.png" />

// After (meaningful image)
<img src="/logo.png" alt="TaxBridge logo" />

// After (decorative image)
<img src="/decoration.png" alt="" role="presentation" />
```

### 4. Add Backdrop Filter Fallback
```css
/* tailwind.config.js or CSS */
.backdrop-blur-sm {
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}
```

### 5. Safe Area Insets (iOS Notch)
```tsx
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
      }
    }
  }
}

// Usage
<header className="pt-safe-top">
```

## Tools

### Accessibility Testing
- **axe DevTools**: Browser extension for automated a11y checks
- **WAVE**: Web accessibility evaluation tool
- **Lighthouse**: Built into Chrome DevTools (Accessibility score)
- **Screen Readers**: VoiceOver (macOS), NVDA (Windows), JAWS (Windows)

### Color Contrast
- **WebAIM Contrast Checker**: https://webaim.org/resources/contrastchecker/
- **Colorblindly**: Browser extension to simulate color blindness

### Mobile Testing
- **BrowserStack**: Real device testing (paid)
- **Chrome DevTools**: Device emulation (free)
- **Safari Responsive Design Mode**: Cmd+Opt+R

### Cross-Browser Testing
- **BrowserStack**: Automated cross-browser testing
- **Sauce Labs**: Alternative to BrowserStack
- **Playwright**: Automated testing (already set up)

## Next Steps

1. ✅ Test suite created (110+ tests)
2. ⏳ Fix dev server auth issues
3. ⏳ Run automated tests
4. ⏳ Perform manual device testing
5. ⏳ Fix critical accessibility issues
6. ⏳ Document results
7. ⏳ Create follow-up tasks

## Documentation

- **Full Report**: `docs/PRODUCT_QUALITY_SWEEP_REPORT.md`
- **Test Files**:
  - `tests/accessibility/accessibility.spec.ts`
  - `tests/mobile/mobile-responsiveness.spec.ts`
  - `tests/cross-browser/cross-browser.spec.ts`
