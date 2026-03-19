<!-- markdownlint-disable MD013 MD024 MD033 -->
# FREE TIER LIMIT VERIFICATION - MANUAL TESTING GUIDE

**Task:** [P1-HIGH] Free Tier Limit Verification - USER PERSPECTIVE TEST
**Objective:** Create NEW account on production, add RSU entries one by one, document blocking behavior
**Target:** Verify 10-entry free tier limit is correctly enforced
**Evidence Required:** Screen recording OR step-by-step screenshots

---

## 🎯 Test Objective

Verify that the free tier limit correctly blocks users after **10 RSU entries** with an appropriate upgrade message.

### Key Questions to Answer

1. **At what count does it block you?** (Expected: Entry #11)
2. **What message shows?** (Expected: "You've reached your limit of 10 RSU entries...")
3. **Does it match intended 10-entry limit?** (Expected: YES)

---

## 📋 Pre-Test Checklist

Before starting the test, verify:

- [ ] Production site is accessible at: https://taxbridge.vercel.app
- [ ] You have a **new email address** for test account (not previously used)
- [ ] You have screen recording software ready (QuickTime, OBS, etc.) **OR**
- [ ] You have screenshot tool ready (cmd+shift+4 on Mac, Win+Shift+S on Windows)
- [ ] You have ~15 minutes for the full test

---

## 🎥 OPTION 1: Screen Recording (Recommended)

### Setup

1. Open screen recording software:
   - **Mac:** QuickTime Player → File → New Screen Recording
   - **Windows:** Xbox Game Bar (Win + G)
   - **Cross-platform:** OBS Studio, Loom, or similar

2. Position browser window clearly visible
3. Start recording

### Test Procedure

1. **Navigate to production site**
   - URL: https://taxbridge.vercel.app
   - Verify homepage loads correctly

2. **Create new account**
   - Click "Sign Up" button
   - Use a NEW email address (e.g., `test+freetier123@example.com`)
   - Complete sign-up process
   - Show successful login

3. **Navigate to RSU entry form**
   - Dashboard → Add RSU Entry (or similar navigation)
   - Show empty state (0 entries)

4. **Add entries one by one**

   For each entry (1-11):

   - Fill out RSU form:
     - **Vesting Date:** Any future date (e.g., 2026-04-15, 2026-05-15, etc.)
     - **FMV USD:** $100, $110, $120, ... (increment by $10 each time)
     - **Shares:** 10, 11, 12, ... (increment by 1 each time)
     - **Employer:** Rotate between Meta, Amazon, Google, Microsoft
     - **Ticker Symbol:** META, AMZN, GOOGL, MSFT (match employer)

   - Click "Add Entry" button
   - **SHOW THE RESPONSE:**
     - If successful: Show entry added to list (count should increase)
     - If blocked: **PAUSE HERE** - Keep upgrade modal visible

   - **Narrate verbally (if recording with audio):**
     - "This is entry number [X]"
     - "Current total: [Y] entries"

5. **Capture the blocking behavior**

   When the upgrade modal/message appears:

   - **Keep the modal open for 5-10 seconds**
   - Read the message aloud (if audio recording)
   - Ensure message is clearly visible and readable
   - Note which entry number triggered the block
   - Try clicking "Add Entry" again to confirm it's blocked

6. **End recording**
   - Stop screen recording
   - Save file as: `free-tier-limit-verification-[date].mp4`
   - Example: `free-tier-limit-verification-2026-03-19.mp4`

### Save Evidence

```bash
# Create directory for video evidence
mkdir -p docs/verification-videos

# Move your recording there
mv ~/Downloads/free-tier-limit-*.mp4 docs/verification-videos/
```

---

## 📸 OPTION 2: Step-by-Step Screenshots

If you cannot record video, take screenshots at each step:

### Screenshot Checklist

| Screenshot # | What to Capture | File Name | Notes |
|--------------|-----------------|-----------|-------|
| 1 | Homepage loaded | `01-homepage.png` | Show full page |
| 2 | Sign-up form | `02-signup.png` | Show email used |
| 3 | Account created/logged in | `03-logged-in.png` | Show user menu/profile |
| 4 | RSU entry form (empty) | `04-entry-form-empty.png` | Show 0 entries |
| 5 | Entry #1 added | `05-entry-1-added.png` | Show "1 entry" count |
| 6 | Entry #2 added | `06-entry-2-added.png` | Show "2 entries" count |
| 7 | Entry #3 added | `07-entry-3-added.png` | Show "3 entries" count |
| 8 | Entry #4 added | `08-entry-4-added.png` | Show "4 entries" count |
| 9 | Entry #5 added | `09-entry-5-added.png` | Show "5 entries" count |
| 10 | Entry #6 added | `10-entry-6-added.png` | Show "6 entries" count |
| 11 | Entry #7 added | `11-entry-7-added.png` | Show "7 entries" count |
| 12 | Entry #8 added | `12-entry-8-added.png` | Show "8 entries" count |
| 13 | Entry #9 added | `13-entry-9-added.png` | Show "9 entries" count |
| 14 | Entry #10 added | `14-entry-10-added.png` | Show "10 entries" count |
| 15 | **Entry #11 BLOCKED** | `15-entry-11-blocked.png` | **CRITICAL: Show upgrade modal** |
| 16 | Upgrade message close-up | `16-upgrade-message-closeup.png` | Zoom in on text |
| 17 | Full page with modal | `17-full-page-with-modal.png` | Show entire UI state |
| 18 | Try adding again (still blocked) | `18-still-blocked.png` | Confirm blocking persists |

### Save Screenshots

```bash
# Create directory for screenshots
mkdir -p docs/screenshots/free-tier-user-test-$(date +%Y-%m-%d)

# Move your screenshots there
mv ~/Desktop/screenshot-*.png docs/screenshots/free-tier-user-test-$(date +%Y-%m-%d)/
```

---

## 📊 Documentation Template

After completing the test, fill out this template:

```markdown
# Free Tier Limit - User Perspective Test Results

**Test Date:** [Date and time]
**Tester:** [Your name]
**Production URL:** https://taxbridge.vercel.app
**Test Account Email:** [Email used]

## Test Results

### Question 1: At what count does it block you?

**Answer:** Entry #[X]

**Details:**
- Successfully added entries #1 through #[Y]
- Blocked when attempting to add entry #[Z]
- Current entry count when blocked: [N]

### Question 2: What message shows?

**Answer:**

> [Copy the EXACT message text shown in the upgrade modal]

**Screenshot/Video Reference:** [File name of evidence]

### Question 3: Does it match intended 10-entry limit?

**Answer:** [YES/NO]

**Explanation:**
- Expected: Block at entry #11 (after 10 successful entries)
- Actual: [What happened]
- Match: [YES if blocked at entry #11 after 10 entries, NO otherwise]

## Evidence Files

- [ ] Screen recording: `docs/verification-videos/free-tier-limit-verification-[date].mp4`

OR

- [ ] Screenshots: `docs/screenshots/free-tier-user-test-[date]/` (18 files)

## Issues Found (if any)

- [ ] No issues - test passed ✅

OR

- [ ] Issue 1: [Description]
- [ ] Issue 2: [Description]

## Conclusion

[PASSED ✅ / FAILED ❌]

The free tier limit is [correctly / incorrectly] enforced at [N] RSU entries.
```

---

## 🔍 What to Look For

### ✅ Expected Behavior (PASS)

- **Entries 1-10:** All added successfully
- **Entry 11:** Blocked with 403 error
- **Upgrade Modal Shows:**
  - Message: "You've reached your limit of 10 RSU entries..."
  - Current count: 10
  - Limit: 10
  - Call-to-action: "Upgrade to Pro" button
  - Pricing link visible

### ❌ Unexpected Behavior (FAIL)

- Blocked before entry #11
- Blocked after entry #11
- No upgrade modal appears
- Wrong limit number shown (not 10)
- Generic error message instead of upgrade prompt
- Can add more than 10 entries

---

## 🐛 Troubleshooting

### Issue: Can't create account

**Solution:** Check if Clerk authentication is configured correctly

```bash
npm run verify:clerk
```

### Issue: Can't access RSU entry form

**Solution:** Check production site health

```bash
npm run verify:production
```

### Issue: All entries fail (not limit-related)

**Solution:** Check API endpoints and database

```bash
npm run health-check
```

### Issue: No blocking occurs even after 15 entries

**Solution:** Free tier limit may not be deployed to production

```bash
# Check code-level configuration
npm run verify:free-tier

# Check production deployment
npm run verify:free-tier:production
```

---

## 📤 Submitting Evidence

Once you have your evidence:

1. **Organize files:**

   ```bash
   # Check files exist
   ls -lh docs/verification-videos/
   # OR
   ls -lh docs/screenshots/free-tier-user-test-*/
   ```

2. **Commit to Git:**

   ```bash
   git add docs/verification-videos/ docs/screenshots/
   git commit -m "[P1-HIGH] Free Tier User Perspective Test - Evidence Captured + VERIFICATION"
   ```

3. **Push to GitHub:**

   ```bash
   git push origin main
   ```

4. **Update Task:**

   - Mark task as complete in scheduler
   - Link to evidence files in commit
   - Copy test results into task summary

---

## 🎯 Success Criteria

This test is considered **PASSED** if:

- [x] Entry #11 is blocked (after 10 successful entries)
- [x] Upgrade message clearly states "10 RSU entries" limit
- [x] Modal shows current count = 10, limit = 10
- [x] User cannot add more entries after blocking
- [x] Evidence (video or screenshots) clearly shows the blocking behavior

This test is considered **FAILED** if:

- [ ] Blocking occurs at wrong count (not entry #11)
- [ ] Message shows wrong limit (not 10)
- [ ] No upgrade modal appears
- [ ] User can bypass limit and add more entries
- [ ] Evidence is unclear or incomplete

---

## 📞 Need Help?

If you encounter issues during testing:

1. Check production site status: `npm run verify:production`
2. Check free tier configuration: `npm run verify:free-tier`
3. Review recent deployment logs in Vercel dashboard
4. Contact engineering team with error screenshots

---

**Generated:** $(date)
**Script:** `scripts/test-free-tier-user-perspective.ts`
**Guide Version:** 1.0
