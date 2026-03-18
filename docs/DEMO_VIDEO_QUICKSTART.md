# Demo Video Quick Start Guide

**Duration:** 60 seconds
**Tool:** Loom (recommended) - https://loom.com
**Resolution:** 1080p minimum

---

## Pre-Recording Setup

1. **Install Loom** (if not already):
   - Sign up at https://loom.com (free)
   - Install desktop app or use Chrome extension

2. **Prepare browser**:
   ```bash
   # Make sure dev server is running
   npm run dev
   ```
   - Open `http://localhost:3000` in Chrome
   - Clear cookies/cache
   - Close unnecessary tabs
   - Enable Do Not Disturb mode

3. **Prepare demo data** (already in dashboard):
   - RSU Entry 1: Meta, 125 shares, ~$65K
   - RSU Entry 2: Amazon, 32 shares, ~$6K
   - Tax savings showing: ~$4,100

4. **Have script ready** (see full script at `docs/demo-video-script.md`)

---

## Recording Steps

### 1. Start Loom Recording
1. Click Loom icon → "Start Recording"
2. Select "Screen + Cam" (recommended) or "Screen Only"
3. Select "Current Tab" mode
4. Click "Start Recording"

### 2. Follow the 5-Shot Script (60 seconds total)

#### SHOT 1: Hook & Problem (0-10s)
- **Screen:** Landing page
- **Say:** "Are you an H-1B or TN visa tech worker with RSU income now living in Canada? Cross-border taxes are a nightmare. You're getting taxed twice - once in the US and again in Canada."
- **Action:** Slow scroll through hero section

#### SHOT 2: Dashboard & RSU Entry (10-25s)
- **Screen:** `/dashboard`
- **Say:** "TaxBridge automates dual-country tax calculations. Just enter your RSU vesting details - the date, number of shares, and your employer like Meta, Amazon, Google - and instantly see both your US federal and state tax AND your Canada federal and provincial tax obligations."
- **Action:** Show RSU entries table, hover over "Add RSU Entry"

#### SHOT 3: FTC Optimizer (25-40s)
- **Screen:** Scroll to tax summary on dashboard
- **Say:** "Our Foreign Tax Credit optimizer is the secret sauce. We calculate exactly how much Canadian tax you can claim as a credit against your US tax bill, eliminating double taxation. Real users save two thousand to four thousand dollars per year by getting this right."
- **Action:** Highlight FTC calculation, show savings number

#### SHOT 4: Forms Checklist (40-50s)
- **Screen:** `/forms-checklist`
- **Say:** "You also get a complete checklist of every required form - W-2, Form 1040, T1, T4, FBAR, Form 8938, and the critical Treaty Article XV Form 8833. Export professional PDF reports to share directly with your CPA."
- **Action:** Show forms checklist, scroll through

#### SHOT 5: Pricing & CTA (50-60s)
- **Screen:** `/pricing`
- **Say:** "Try TaxBridge free today. The Pro plan is just two ninety-nine per year - that's ten times cheaper than hiring a cross-border tax accountant. And for Product Hunt hunters, use code HUNT20 for twenty percent off for the next forty-eight hours. Link in the description!"
- **Action:** Hover over "Start 7-Day Free Trial" button

### 3. Stop Recording
- Click "Finish" in Loom
- Loom will auto-upload and generate a shareable link

---

## Post-Recording Checklist

- [ ] Video is 55-65 seconds (60s target)
- [ ] Audio is clear, no background noise
- [ ] All text on screen is readable
- [ ] No personal info visible (email, real names)
- [ ] Cursor movements are smooth
- [ ] Trim any Loom intro/outro if needed

---

## Get Shareable Link

1. After recording finishes, Loom opens the video page
2. Click "Share" button
3. Copy the link (e.g., `https://loom.com/share/abc123xyz`)
4. Save it here for Product Hunt submission:

```
LOOM VIDEO URL: ___________________________________________
```

---

## Alternative: QuickTime (Mac Built-in)

If you prefer QuickTime:

1. Open QuickTime Player
2. File → New Screen Recording
3. Click red record button → Select screen area or "Full Screen"
4. Record following the same 5-shot script above
5. Stop recording (menu bar icon)
6. File → Export As → 1080p
7. Upload to YouTube as **Unlisted**
8. Copy YouTube link

---

## Pro Tips

✅ **Pace yourself:** 60 seconds is longer than you think - don't rush
✅ **Show, don't tell:** Let the UI speak
✅ **Real data:** Use realistic demo data
✅ **Smooth movements:** Move cursor slowly and deliberately
✅ **Smile in your voice:** Enthusiasm is contagious
✅ **One take is fine:** Authenticity > perfection

❌ **Avoid:** Dead air, "um"s, rushed speech, shaky cursor

---

## Ready to Record?

1. ✅ Dev server running (`npm run dev`)
2. ✅ Loom installed and ready
3. ✅ Browser clean (no extra tabs)
4. ✅ Do Not Disturb enabled
5. ✅ Script printed or on second monitor

**Hit record and nail it in one take!** 🎬

---

## After Recording

Update the Product Hunt launch kit with your video URL:

```bash
echo "LOOM_VIDEO_URL=https://loom.com/share/YOUR_VIDEO_ID" >> docs/product-hunt-launch-kit.md
```

Then you're ready to submit to Product Hunt! 🚀
