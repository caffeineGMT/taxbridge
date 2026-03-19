# Manual QA Testing Checklist - CEO Bug Hunt

**Production URL:** https://taxbridge.vercel.app
**Testing Date:** _______
**Tester:** _______

## 📱 Devices to Test

### Desktop Browsers
- [ ] Chrome (Latest)
- [ ] Safari (Latest)
- [ ] Firefox (Latest)
- [ ] Edge (Latest)

### Mobile Devices
- [ ] iPhone Safari (iOS 15+)
- [ ] Android Chrome
- [ ] iPad Safari (Portrait & Landscape)

---

## 🏠 Homepage Testing

### Visual/Layout
- [ ] Logo displays correctly
- [ ] Hero section is readable and aligned
- [ ] CTA buttons are visible and clickable
- [ ] Navigation menu works on mobile (hamburger menu)
- [ ] Footer displays correctly
- [ ] No horizontal scrolling on mobile
- [ ] Images load properly (no broken images)
- [ ] Text is readable on all screen sizes

### Functionality
- [ ] All navigation links work
- [ ] CTA buttons navigate to correct pages
- [ ] Scroll animations work smoothly
- [ ] Social media links work (if present)
- [ ] External links open in new tab

### Performance
- [ ] Page loads in < 3 seconds
- [ ] No JavaScript errors in console
- [ ] No layout shift when page loads

**Bugs Found:**
```
[Record bugs here]
```

---

## 🧮 Calculator Page Testing (`/us-canada-tax-calculator`)

### Visual/Layout
- [ ] Form displays correctly on mobile
- [ ] Input labels are readable
- [ ] Buttons are appropriately sized for touch
- [ ] Results section formats properly
- [ ] No text overflow on small screens

### Form Validation
- [ ] **Empty form submission** - Error messages appear
  - Submit without filling any fields
  - Expected: Validation errors for all required fields

- [ ] **Invalid inputs**
  - Try entering text in number fields: _______
  - Try entering negative income: _______
  - Try entering zero income: _______
  - Try extremely large numbers (999999999): _______

- [ ] **Field validation**
  - Income field accepts only numbers
  - RSU fields accept only numbers
  - Date fields show date picker
  - Province/state dropdowns work

### Calculation Logic
- [ ] **Test Case 1: Basic calculation**
  - Income: $100,000
  - RSU Value: $20,000
  - Province: BC
  - Result displays: _______
  - Tax breakdown shows: _______

- [ ] **Test Case 2: Zero RSUs**
  - Income: $100,000
  - RSU Value: $0
  - Result handles gracefully: _______

- [ ] **Test Case 3: High income**
  - Income: $300,000
  - RSU Value: $100,000
  - Calculator doesn't break: _______

### Functionality
- [ ] Submit button is clickable
- [ ] Loading state shows when calculating
- [ ] Results display after calculation
- [ ] "Calculate again" or "Reset" button works
- [ ] Results can be saved/printed (if feature exists)
- [ ] PostHog tracks calculator completion

**Bugs Found:**
```
[Record bugs here]
```

---

## 💳 Pricing Page Testing (`/pricing`)

### Visual/Layout
- [ ] Pricing cards display correctly
- [ ] Price amounts are clear and readable
- [ ] Feature lists are formatted properly
- [ ] CTA buttons are prominent
- [ ] Mobile layout stacks cards appropriately

### Functionality
- [ ] All plan features are listed
- [ ] CTA buttons navigate to signup/checkout
- [ ] "Compare plans" functionality works (if exists)
- [ ] FAQ accordion expands/collapses (if exists)

### Pricing Logic
- [ ] Prices match marketing materials
- [ ] Currency displays correctly
- [ ] Billing period is clear (monthly/yearly)

**Bugs Found:**
```
[Record bugs here]
```

---

## 🔐 Authentication Testing

### Signup Flow (`/signup`)
- [ ] **New user signup**
  - Email field validation works
  - Password requirements shown
  - Password visibility toggle works
  - "Sign up" button submits form
  - Redirects to correct page after signup

- [ ] **Error states**
  - Invalid email shows error: _______
  - Weak password shows error: _______
  - Existing email shows error: _______

### Login Flow (`/login`)
- [ ] **Existing user login**
  - Email field works
  - Password field works
  - "Login" button submits
  - Redirects to dashboard after login

- [ ] **Error states**
  - Wrong password shows error: _______
  - Non-existent email shows error: _______
  - Empty form shows validation: _______

### Password Reset (if exists)
- [ ] "Forgot password" link works
- [ ] Email sent confirmation appears
- [ ] Reset link works (check email)

**Bugs Found:**
```
[Record bugs here]
```

---

## 📊 Dashboard Testing (`/dashboard`)

### Access Control
- [ ] Redirects to login if not authenticated
- [ ] Shows user data after login
- [ ] User can log out

### Visual/Layout
- [ ] Dashboard cards display correctly
- [ ] Charts/graphs render properly
- [ ] Mobile layout is responsive
- [ ] Navigation sidebar/menu works

### Functionality
- [ ] User profile displays correctly
- [ ] Data loads from backend
- [ ] Actions (edit, delete) work
- [ ] Error states handle gracefully

**Bugs Found:**
```
[Record bugs here]
```

---

## 💰 Payment Flow Testing

### Checkout Page
- [ ] **Navigate to checkout**
  - Click pricing CTA
  - Stripe checkout loads
  - Pricing is correct

- [ ] **Test payment (USE TEST CARDS)**
  - Test Card: `4242 4242 4242 4242`
  - Expiry: Any future date
  - CVC: Any 3 digits
  - ZIP: Any 5 digits

- [ ] **Payment success**
  - Success page displays
  - Confirmation email sent (check inbox)
  - User upgraded in dashboard

- [ ] **Payment failure**
  - Declined card: `4000 0000 0000 0002`
  - Error message shows: _______
  - User stays on checkout page: _______

**Bugs Found:**
```
[Record bugs here]
```

---

## 🔗 Link Testing

### Internal Links
Test all navigation links:
- [ ] Header: Home, Calculator, Pricing, Dashboard, Login
- [ ] Footer: About, Privacy Policy, Terms, Contact
- [ ] CTA buttons throughout site

### External Links
- [ ] Social media links work
- [ ] Blog links work (if applicable)
- [ ] Help/support links work

### Expected Behavior
- Internal links: Navigate within site
- External links: Open in new tab
- Broken links: None found (all return 200 OK)

**Bugs Found:**
```
[Record bugs here]
```

---

## ♿ Accessibility Testing

### Keyboard Navigation
- [ ] Tab through entire page
- [ ] All interactive elements are reachable
- [ ] Skip to content link works
- [ ] Focus indicators are visible

### Screen Reader (VoiceOver on Mac/iOS, TalkBack on Android)
- [ ] Page title is announced
- [ ] Headings structure makes sense
- [ ] Form labels are read correctly
- [ ] Buttons have descriptive labels
- [ ] Images have alt text

### Color Contrast
- [ ] Text is readable against background
- [ ] Links are distinguishable
- [ ] Buttons have sufficient contrast

**Bugs Found:**
```
[Record bugs here]
```

---

## 📱 Mobile-Specific Testing

### Touch Targets
- [ ] Buttons are at least 44x44px
- [ ] Links are easy to tap
- [ ] Form inputs are appropriately sized
- [ ] No accidental clicks

### Mobile Navigation
- [ ] Hamburger menu opens/closes
- [ ] Menu items are tappable
- [ ] Navigation doesn't block content

### Orientation
- [ ] Portrait mode works correctly
- [ ] Landscape mode works correctly
- [ ] Layout adapts to orientation change

### Mobile Forms
- [ ] Keyboard appears for text inputs
- [ ] Numeric keyboard for number inputs
- [ ] Date picker for date inputs
- [ ] Autocomplete works (if applicable)

**Bugs Found:**
```
[Record bugs here]
```

---

## ⚡ Performance Testing

### Load Times
- [ ] Homepage loads in < 3s
- [ ] Calculator loads in < 3s
- [ ] Dashboard loads in < 5s
- [ ] No blank screens during load

### Interactions
- [ ] Buttons respond immediately
- [ ] Form submission is quick
- [ ] Page transitions are smooth
- [ ] No lag when scrolling

### Network Conditions
- [ ] Test on 3G (slow connection)
- [ ] Test on WiFi (fast connection)
- [ ] Offline behavior (if applicable)

**Bugs Found:**
```
[Record bugs here]
```

---

## 🐛 Edge Cases & Error States

### Network Errors
- [ ] Disconnect internet mid-action
- [ ] Slow connection handling
- [ ] Timeout error messages

### Browser Errors
- [ ] JavaScript disabled (if applicable)
- [ ] Cookies disabled
- [ ] Local storage full

### Data Edge Cases
- [ ] Very long text inputs
- [ ] Special characters in inputs
- [ ] Empty database/account
- [ ] Maximum data limits

**Bugs Found:**
```
[Record bugs here]
```

---

## 📊 Analytics & Tracking

### PostHog Events
- [ ] Calculator completion tracked
- [ ] Button clicks tracked
- [ ] Page views tracked
- [ ] User signup tracked

### Stripe Events
- [ ] Checkout initiated tracked
- [ ] Payment success tracked
- [ ] Payment failure tracked

**Bugs Found:**
```
[Record bugs here]
```

---

## ✅ Final Checklist

- [ ] All critical bugs documented
- [ ] Screenshots taken for each bug
- [ ] Bug severity assigned (CRITICAL, HIGH, MEDIUM, LOW)
- [ ] Reproduction steps written clearly
- [ ] Expected vs actual behavior documented
- [ ] Browser/device info recorded for each bug

---

## 📝 Bug Report Template

Use this template for each bug found:

```markdown
## Bug #X: [Short Description]

**Severity:** CRITICAL | HIGH | MEDIUM | LOW
**Category:** Broken Link | Layout Issue | Form Validation | Error State | Performance | Accessibility | Functionality
**Page:** [URL or page name]
**Browser/Device:** [e.g., iPhone 14 Safari, Chrome Desktop]

**Description:**
[Detailed description of the bug]

**Steps to Reproduce:**
1. Navigate to [page]
2. Click [button]
3. Enter [data]
4. Observe [issue]

**Expected Behavior:**
[What should happen]

**Actual Behavior:**
[What actually happens]

**Screenshot:**
[Attach screenshot file]

**Additional Notes:**
[Any other relevant information]
```

---

## 🚀 Quick Start

1. **Run automated tests first:**
   ```bash
   npm run qa:bug-hunt
   ```

2. **Review automated test results:**
   - Check `docs/qa-bug-hunt/bug-report-YYYY-MM-DD.md`
   - Review screenshots in `docs/qa-bug-hunt/screenshots-YYYY-MM-DD/`

3. **Perform manual testing:**
   - Use this checklist on real devices
   - Focus on user experience and visual issues
   - Test edge cases automated tests might miss

4. **Document findings:**
   - Use bug report template above
   - Include screenshots and screen recordings
   - Assign severity and priority

5. **Submit bug report:**
   - Create GitHub issues for each CRITICAL/HIGH bug
   - Share report with development team
   - Track progress in project management tool

---

## 📞 Need Help?

- **Automated Testing:** `npm run qa:bug-hunt`
- **View Manual Checklist:** `npm run qa:manual`
- **Bug Report Location:** `docs/qa-bug-hunt/`
