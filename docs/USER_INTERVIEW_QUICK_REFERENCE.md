# User Interview Sprint - Quick Reference

## Status

**INFRASTRUCTURE:** ✅ Complete
**PAID CUSTOMERS:** ❌ 0 (Stripe still in test mode)
**CAMPAIGN STATUS:** ⏸️ Ready but blocked
**NEXT ACTION:** Activate Stripe production mode

---

## Quick Commands

### Check for Paid Customers
```bash
export STRIPE_SECRET_KEY=sk_live_YOUR_ACTUAL_KEY
npx tsx scripts/check-paid-customers.ts
```

### Send Interview Emails
```bash
export SENDGRID_API_KEY=SG.your_key
npx tsx scripts/send-user-interview-emails.ts
```

### View Responses
```bash
# API endpoint (admin only)
curl "https://taxbridge.vercel.app/api/user-interview?key=ADMIN_SECRET"

# File system
cat data/user-interviews/responses/all-responses.jsonl | jq .
```

---

## Files Created

| File | Purpose |
|------|---------|
| `scripts/check-paid-customers.ts` | Query Stripe for paid customers |
| `lib/email-templates/user-interview.ts` | Email templates (3 types) |
| `app/user-interview/page.tsx` | Response form (web UI) |
| `app/api/user-interview/route.ts` | API endpoint |
| `scripts/send-user-interview-emails.ts` | Email automation |

---

## Workflow

1. **Wait for paid customers** → Blocked until Stripe production is active
2. **Run customer check** → Generates customer list JSON
3. **Send emails** → $25 gift card offer, unique tracking links
4. **Collect responses** → Auto-saved to `data/user-interviews/responses/`
5. **Analyze insights** → Identify top blockers
6. **Create tasks** → Fix conversion issues
7. **Fulfill gift cards** → Within 24 hours

---

## Goal

**Target:** 5+ responses
**Incentive:** $25 Amazon gift card per response
**Budget:** $250 total
**Timeline:** 7-10 days after first customers
**Output:** 3-5 actionable tasks to improve conversions

---

## Blockers

1. **Stripe Production Mode** → [P0-CRITICAL] Still using test keys
2. **SendGrid API Key** → Needs real key, placeholder currently
3. **Zero Paid Customers** → No one to interview yet

---

## Ready to Execute

When Stripe goes live and you have 5+ paid customers:
- Infrastructure is 100% ready
- Run 2 commands (check customers → send emails)
- Monitor responses
- Fulfill gift cards
- Get insights within 1 week
