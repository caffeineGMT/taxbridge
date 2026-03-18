# Product Hunt Demo Video - Completion Checklist

## Overview

**Goal:** Create a 60-second Loom demo video for Product Hunt launch

**Acceptance Criteria:**
- ✅ Video is 55-65 seconds (targeting 60s)
- ✅ Covers all 5 key sections (see script below)
- ✅ Shows real product features with realistic demo data
- ✅ Professional quality (clear audio, smooth cursor movements)
- ✅ Shareable Loom URL ready for Product Hunt listing

---

## Quick Links

- **Full Script:** `/docs/demo-video-script.md`
- **Loom:** https://loom.com (free account works)
- **Local Server:** `npm run dev` → http://localhost:3000

---

## Pre-Recording Setup (5 minutes)

### Browser Setup
- [ ] Dev server running: `npm run dev`
- [ ] Open http://localhost:3000 in Chrome
- [ ] Browser window maximized (1920x1080 or best available)
- [ ] Clear cache/cookies for clean demo
- [ ] Close unnecessary tabs (only keep TaxBridge tabs)
- [ ] Enable Do Not Disturb (mute notifications)

### Demo Data Preparation
- [ ] Add 2-3 realistic RSU entries to dashboard:
  - **RSU 1:** Meta, 125 shares, Aug 15 2025, FMV $524.30
  - **RSU 2:** Amazon, 32 shares, Nov 1 2025, FMV $201.85
  - **RSU 3:** (Optional) Google or Microsoft for variety
- [ ] Verify tax calculations are showing
- [ ] Verify forms checklist is populated
- [ ] Check pricing page displays correctly

### Loom Setup
- [ ] Sign up/login at https://loom.com
- [ ] Click "Record" button
- [ ] Select **"Screen Only"** or **"Screen + Cam"** (your choice)
- [ ] Select **"Current Tab"** or **"Full Desktop"**
- [ ] Test audio levels (speak a sentence and check waveform)
- [ ] Have script visible (print or second monitor)

---

## Recording Script (60 seconds)

### SECTION 1: Hook & Problem (0-10s)
**Page:** Landing page hero
**Lines:**
> "Are you an H-1B or TN visa tech worker with RSU income now living in Canada? Cross-border taxes are a nightmare. You're getting taxed twice - once in the US and again in Canada."

**Actions:**
- Show landing page at http://localhost:3000
- Slow scroll through hero section
- Hover over "Get Started" button (don't click)

---

### SECTION 2: Dashboard & RSU Entry (10-25s)
**Page:** Dashboard with RSU entries
**Lines:**
> "TaxBridge automates dual-country tax calculations. Just enter your RSU vesting details - the date, number of shares, and your employer like Meta, Amazon, Google, or Microsoft - and instantly see both your US federal and state tax AND your Canada federal and provincial tax obligations."

**Actions:**
- Navigate to `/dashboard`
- Show RSU entries table (2-3 entries visible)
- Hover over "Add RSU Entry" button
- Maybe click to show form briefly

---

### SECTION 3: FTC Optimizer (25-40s)
**Page:** Tax calculation results with FTC
**Lines:**
> "Our Foreign Tax Credit optimizer is the secret sauce. We calculate exactly how much Canadian tax you can claim as a credit against your US tax bill, eliminating double taxation. Real users save two thousand to four thousand dollars per year by getting this right."

**Actions:**
- Scroll to tax summary section on dashboard
- Highlight FTC calculation area
- Show total tax savings number
- Slow pan across dual-country breakdown

---

### SECTION 4: Forms Checklist & PDF (40-50s)
**Page:** Forms checklist → PDF export
**Lines:**
> "You also get a complete checklist of every required form - W-2, Form 1040, T1, T4, FBAR, Form 8938, and the critical Treaty Article XV Form 8833. Export professional PDF reports to share directly with your CPA."

**Actions:**
- Navigate to `/forms-checklist`
- Show checklist with checkboxes
- Scroll through the list
- Show PDF export button (don't need to click)

---

### SECTION 5: Pricing & CTA (50-60s)
**Page:** Pricing page
**Lines:**
> "Try TaxBridge free today. The Pro plan is just two ninety-nine per year - that's ten times cheaper than hiring a cross-border tax accountant. And for Product Hunt hunters, use code HUNT20 for twenty percent off for the next forty-eight hours. Link in the description!"

**Actions:**
- Navigate to `/pricing`
- Highlight Pro tier ("Most Popular" badge)
- Hover over "Start 7-Day Free Trial" button
- End with cursor on button

---

## Recording Tips

✅ **Do:**
- Speak clearly and confidently
- Move cursor slowly and deliberately
- Pause 1-2 seconds between sections for pacing
- Show enthusiasm in your voice (smile while talking)
- Practice once before recording (doesn't need to be perfect)

❌ **Don't:**
- Rush through the script
- Say "um", "ah", or "like" excessively
- Move cursor erratically
- Include personal information in the demo
- Worry about perfection - authenticity beats polish

---

## Post-Recording Checklist

After recording in Loom:

- [ ] Click "Finish" to stop recording
- [ ] Loom auto-uploads and generates shareable link
- [ ] Watch the video playback - check:
  - [ ] Duration is 55-65 seconds
  - [ ] Audio is clear (no background noise)
  - [ ] Text on screen is readable
  - [ ] No personal info visible
  - [ ] Cursor movements are smooth
- [ ] Trim intro/outro if Loom added them (optional)
- [ ] Click "Share" → Copy shareable link
- [ ] Paste link below

---

## Loom Video URL

**Paste your Loom URL here after recording:**

```
[PASTE LOOM URL HERE]
```

Example: `https://www.loom.com/share/abc123def456...`

---

## Publishing to Product Hunt

Once video is ready:

1. **Add to Product Hunt listing:**
   - Go to Product Hunt submission page
   - Find "Demo Video" field
   - Paste Loom URL
   - Product Hunt will auto-embed the video

2. **Alternative: YouTube Unlisted**
   - If Loom doesn't work, download video from Loom
   - Upload to YouTube as "Unlisted"
   - Title: "TaxBridge Demo - Cross-Border Tax Calculator"
   - Copy YouTube link and use that instead

---

## Completion Status

- [ ] Screenshots captured (5 total)
- [ ] Demo video recorded
- [ ] Loom URL obtained
- [ ] Video reviewed for quality
- [ ] Ready for Product Hunt upload

**When all checked, you're ready to launch! 🚀**

---

## Need Help?

- **Loom Support:** https://support.loom.com
- **Script Reference:** `/docs/demo-video-script.md`
- **Screenshot Guide:** `/docs/manual-screenshot-guide.md`
