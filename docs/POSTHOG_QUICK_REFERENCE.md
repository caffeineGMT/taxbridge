# PostHog Activation - Quick Reference

⏱️ **Time**: 15-30 minutes | 📅 **Priority**: P0-CRITICAL | 🎯 **Impact**: Revenue unblocking

---

## 🚀 3-Step Activation

### 1️⃣ Get Keys (5 min)

```bash
# Login to PostHog
https://app.posthog.com

# Navigate
Settings (⚙️) → Project API Key

# Copy these 2 values:
Project API Key: phc_[40_characters]
Project ID: [numeric_id]
```

### 2️⃣ Update Vercel (3 min)

```bash
# Go to Vercel dashboard
https://vercel.com/taxbridge/cross-border-tax/settings/environment-variables

# Add/Update (Production scope):
NEXT_PUBLIC_POSTHOG_KEY = phc_YOUR_ACTUAL_KEY
NEXT_PUBLIC_POSTHOG_HOST = https://app.posthog.com
POSTHOG_PROJECT_ID = YOUR_ACTUAL_ID

# Save → Redeploy
```

### 3️⃣ Verify (10 min)

```bash
# Run verification
npm run verify:posthog

# Send test events
npm run test:posthog

# Check PostHog dashboard
https://app.posthog.com/events
# Look for events within 30 seconds

# Take screenshots (REQUIRED)
docs/screenshots/posthog-live-events-YYYY-MM-DD.png
docs/screenshots/posthog-event-details-YYYY-MM-DD.png
```

---

## ✅ Task Complete Checklist

**ALL must be checked:**

- [ ] Keys replaced (not placeholders)
- [ ] Vercel env vars updated
- [ ] Production redeployed
- [ ] `npm run verify:posthog` passes ✅
- [ ] `npm run test:posthog` sends events
- [ ] Events visible in PostHog <30 sec
- [ ] 2 screenshots saved to `docs/screenshots/`
- [ ] Committed with `+ VERIFICATION` suffix
- [ ] Pushed to GitHub

---

## 🔍 Quick Troubleshooting

| Issue | Fix |
|-------|-----|
| No events showing | Check Vercel deployment completed, run `vercel ls` |
| "Invalid API key" | Re-copy key, ensure starts with `phc_`, no spaces |
| Events delayed 5+ min | Normal for free tier, wait 1-2 minutes |
| Some events missing | Test in incognito, disable ad blockers |

---

## 📊 Expected Results

**Before**: Zero tracking, blind optimization, guesswork decisions
**After**: Full funnel tracking, data-driven optimization, 10-20% revenue lift

---

## 📚 Full Documentation

- **Complete Guide**: `docs/POSTHOG_PRODUCTION_SETUP.md` (detailed)
- **Executive Summary**: `docs/POSTHOG_ACTIVATION_EXECUTIVE_SUMMARY.md` (overview)
- **This File**: Quick reference (fastest path)

---

## 🎯 Success Criteria

**Task DONE when:**
1. ✅ Keys replaced
2. ✅ Events flowing
3. ✅ Screenshots captured
4. ✅ Verification report generated
5. ✅ Committed + pushed

---

**Start now**: Login to https://app.posthog.com → Get keys → Update Vercel → Verify → Screenshot → Done! 🚀
