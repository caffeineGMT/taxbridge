# User Feedback Collection - Quick Start

## ⚡ 1-Minute Launch Guide

### Prerequisites
```bash
# 1. Apply database migration
sqlite3 tax-calculator.db < lib/db/migrations/019_user_feedback_collection.sql

# 2. Ensure SendGrid is configured in .env.production
SENDGRID_API_KEY=your_key_here
```

### Launch Campaign
```bash
# Auto-detect user type and launch
npm run feedback:launch

# Dry run (test without sending)
npm run feedback:launch --dry-run
```

### View Results
```
Dashboard: http://localhost:3000/admin/feedback-campaigns
Survey: http://localhost:3000/survey/user-feedback
```

---

## 🎯 What It Does

### IF Paid Users Exist:
- Email: "What almost stopped you from buying?"
- Collects purchase barriers (price, value, trust, features)
- Incentive: $10 Amazon gift card

### IF Zero Paid Users:
- Email: "Why didn't you upgrade?"
- Collects upgrade barriers (price, value, free tier, features)
- Incentive: $10 gift card + 20% off code

### Auto-Completion:
- Campaign stops after 5 responses (configurable)
- Gift cards delivered within 24 hours
- Results tracked in dashboard

---

## 📊 Campaign Status

```bash
# Check what would happen
npm run feedback:launch --dry-run

# View all campaigns
curl http://localhost:3000/api/feedback/campaigns

# View campaign responses
curl http://localhost:3000/api/feedback/responses?campaign_id=1
```

---

## 🚀 Command Options

```bash
# Basic launch (auto-detect)
npm run feedback:launch

# Dry run (don't send emails)
npm run feedback:launch --dry-run

# Target specific user type
npm run feedback:launch --target=paid
npm run feedback:launch --target=free

# Custom target responses
npm run feedback:launch --responses=10

# Custom name
npm run feedback:launch --name="Q1 2026 Feedback"
```

---

## 📈 Success Criteria

✅ **5+ responses collected**
✅ **Top 3 barriers identified**
✅ **2+ testimonials with permission**
✅ **Clear action items for improvement**

---

## 🎁 Gift Card Setup

**Current**: Mock codes (TXBR-FEEDBACK-XXXXX)

**Production**: Replace `generateFeedbackGiftCard()` in:
- `lib/email/user-feedback-templates.ts`

**Options**:
- Amazon Gift Card API
- Tremendous (https://tremendous.com)
- Rybbon (https://rybbon.net)

---

## ⚠️ Troubleshooting

### "No users found"
→ Normal for new products. Users added when they sign up.

### "SendGrid not configured"
→ Add SENDGRID_API_KEY to .env.production

### "Database error"
→ Run migration: `sqlite3 tax-calculator.db < lib/db/migrations/019_user_feedback_collection.sql`

---

## 📚 Full Documentation

See: `docs/USER_FEEDBACK_COLLECTION_COMPLETE.md`
