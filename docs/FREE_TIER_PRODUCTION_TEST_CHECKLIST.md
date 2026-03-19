# FREE TIER PRODUCTION TEST - QUICK CHECKLIST

**URL:** https://taxbridge.vercel.app
**Expected Limit:** 10 RSU entries
**Screenshot Dir:** `docs/screenshots/free-tier-verification-2026-03-19T19-52-32/`

---

## 🎯 Quick Test (5 Minutes)

### Step 1: Create Account
- [ ] Open incognito browser
- [ ] Visit https://taxbridge.vercel.app
- [ ] Click "Get Started" / "Sign Up"
- [ ] Create new account (use test email)
- [ ] Complete Clerk authentication
- [ ] **📸 Screenshot:** `1-signup-success.png`

### Step 2: Find RSU Interface
- [ ] Navigate to calculator/dashboard
- [ ] Locate "Add RSU Entry" button
- [ ] **📸 Screenshot:** `2-rsu-interface-empty.png`

### Step 3: Add Entries 1-5
- [ ] Add RSU entry #1 (any valid data)
- [ ] Add RSU entry #2
- [ ] Add RSU entry #3
- [ ] Add RSU entry #4
- [ ] Add RSU entry #5
- [ ] **📸 Screenshot:** `3-rsu-entries-1-5.png`

### Step 4: Add Entries 6-10
- [ ] Add RSU entry #6
- [ ] Add RSU entry #7
- [ ] Add RSU entry #8
- [ ] Add RSU entry #9
- [ ] Add RSU entry #10 ✅ Should SUCCEED
- [ ] **📸 Screenshot:** `4-rsu-entries-10-success.png`

### Step 5: Test 11th Entry (Should Fail)
- [ ] Try to add RSU entry #11
- [ ] Verify paywall/upgrade prompt appears
- [ ] Check message says "10 RSU entries"
- [ ] **📸 Screenshot:** `5-paywall-11th-entry.png`
- [ ] **📸 Screenshot:** `6-upgrade-message.png` (close-up of message)

### Step 6: Test Consistency
- [ ] Refresh the page
- [ ] Verify 10 entries still shown
- [ ] Try adding 11th entry - should block again
- [ ] **📸 Screenshot:** `7-after-refresh.png`

---

## 📸 Screenshot Checklist

Save all to: `docs/screenshots/free-tier-verification-2026-03-19T19-52-32/`

- [ ] `1-signup-success.png`
- [ ] `2-rsu-interface-empty.png`
- [ ] `3-rsu-entries-1-5.png`
- [ ] `4-rsu-entries-10-success.png`
- [ ] `5-paywall-11th-entry.png`
- [ ] `6-upgrade-message.png`
- [ ] `7-after-refresh.png`

---

## ✅ Success Criteria

- [x] Code configured with limit=10 (verified)
- [x] Production site accessible (verified)
- [ ] Can create new account
- [ ] Can add 10 RSU entries
- [ ] 11th entry blocked with paywall
- [ ] Message shows "10 entries"
- [ ] Consistent after refresh

---

## 🎬 After Testing

```bash
# Commit evidence
git add docs/screenshots/free-tier-verification-2026-03-19T19-52-32/
git commit -m "[P1-HIGH] Free Tier Verification Complete - 10 RSU Entries Confirmed"
git push origin main
```

**Update report:** `docs/screenshots/free-tier-verification-2026-03-19T19-52-32/VERIFICATION_REPORT.md`
