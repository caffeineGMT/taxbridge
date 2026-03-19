# User Interview Campaign - External Service Setup

This guide walks you through setting up the external services needed for the campaign.

---

## 1. Calendly Setup (Interview Scheduling)

### Create Calendly Account
1. Go to https://calendly.com/signup
2. Sign up with your TaxBridge email (michael@taxbridge.app)
3. Choose free plan (sufficient for 10-20 interviews)

### Create Interview Event Type
1. Click "Create" → "Event Type"
2. Name: "User Interview - 15 Minutes"
3. Duration: 15 minutes
4. Location: Zoom (connect your Zoom account)
5. Scheduling window:
   - Min notice: 2 hours
   - Date range: 60 days into the future
   - Time increments: 15 minutes

### Configure Event Settings

**Invitee Questions** (to collect data):
- Email (required, pre-filled)
- First Name (required, pre-filled)
- Last Name (optional, pre-filled)
- Custom field: "Tracking Token" (hidden, pre-filled via URL)

**Notifications**:
- Confirmation email: ON (automatic)
- Reminder email: ON (24 hours before)
- Follow-up email: OFF (we handle this manually)

**Appearance**:
- Color: Match TaxBridge brand (#667eea purple)
- Logo: Upload TaxBridge logo
- Custom confirmation page: "Thanks for booking! I'll send you the $20 Amazon gift card within 1 hour after our call."

### Get Your Event URL
1. Go to Event Types → Your Interview Event
2. Copy the event URL (looks like: `https://calendly.com/taxbridge/user-interview`)
3. Add to `.env.production`:
   ```bash
   CALENDLY_EVENT_URL=https://calendly.com/taxbridge/user-interview
   ```

### Test Booking Flow
1. Open your Calendly event URL
2. Book a test interview with yourself
3. Verify you receive:
   - Confirmation email
   - Zoom link
   - Calendar invite
4. Cancel the test booking

---

## 2. Gift Card API Setup (Recommended: Tremendous)

### Why Tremendous?
- Easiest API integration
- Supports Amazon gift cards
- Instant delivery
- $20 minimum
- ~2% fee ($0.40 per $20 gift card)
- Test mode available

### Tremendous Setup

#### Step 1: Create Account
1. Go to https://www.tremendous.com/
2. Sign up with your business email
3. Verify email
4. Complete business verification (takes 1-2 days)

#### Step 2: Add Funding Source
1. Go to Settings → Funding Sources
2. Add credit card or ACH
3. Add initial balance (e.g., $500 for 25 interviews)

#### Step 3: Get API Credentials
1. Go to Settings → Developers
2. Click "Create API Key"
3. Name: "TaxBridge User Interview Campaign"
4. Environment: **Testnet** (for testing) or **Production**
5. Copy the API key (starts with `TEST_` or `PROD_`)

#### Step 4: Get Funding Source ID
1. Go to Settings → Funding Sources
2. Click on your funding source
3. Copy the ID (looks like `FUNDING_abcd1234...`)

#### Step 5: Add to Environment Variables
Add to `.env.production`:
```bash
TREMENDOUS_API_KEY=TEST_abcdefghijklmnop1234567890
TREMENDOUS_FUNDING_SOURCE_ID=FUNDING_abcd1234efgh5678
```

#### Step 6: Update Code to Use Tremendous API

Edit `lib/email-templates/user-interview-campaign.ts` line ~335:

Replace placeholder with:
```typescript
export async function generateAmazonGiftCard(params: {
  amount: number;
  recipientEmail: string;
  recipientName: string;
  interviewId: number;
}): Promise<{ code: string; claimUrl: string }> {
  const response = await fetch('https://api.tremendous.com/api/v2/rewards', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TREMENDOUS_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      external_id: `interview-${params.interviewId}`,
      payment: {
        funding_source_id: process.env.TREMENDOUS_FUNDING_SOURCE_ID,
      },
      reward: {
        value: { denomination: params.amount, currency_code: 'USD' },
        recipient: {
          name: params.recipientName,
          email: params.recipientEmail,
        },
        products: ['AMZN-E-V-STD'], // Amazon.com Gift Card
        delivery: {
          method: 'EMAIL',
        },
      },
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(`Tremendous API error: ${JSON.stringify(data)}`);
  }

  // Extract gift card details from response
  const code = data.reward.value.token || 'PENDING';
  const claimUrl = data.reward.value.redemption_url || 'https://www.amazon.com/gc/redeem';

  console.log(`[GIFT CARD] Generated $${params.amount} gift card for ${params.recipientEmail} via Tremendous`);

  return { code, claimUrl };
}
```

#### Step 7: Test in Testnet
1. Use `TREMENDOUS_API_KEY=TEST_...` in environment
2. Send a test gift card to yourself
3. Verify you receive the email from Tremendous
4. Check gift card code works on Amazon
5. Testnet gift cards are fake - they won't actually work, but you'll see the flow

#### Step 8: Switch to Production
1. Replace `TEST_` API key with `PROD_` API key
2. Use real funding source
3. Send real gift cards

---

## 3. Email Service Setup (Recommended: Resend)

### Why Resend?
- Easiest to set up
- Developer-friendly
- Free tier: 3,000 emails/month
- Great deliverability
- Simple API

### Resend Setup

#### Step 1: Create Account
1. Go to https://resend.com/signup
2. Sign up with GitHub or email
3. Verify email

#### Step 2: Add Domain (Recommended)
1. Go to Domains → Add Domain
2. Enter: taxbridge.app
3. Add DNS records (TXT, MX, CNAME) to your DNS provider
4. Wait for verification (5-30 minutes)
5. Verified domain = better deliverability

#### Step 3: Create API Key
1. Go to Settings → API Keys
2. Click "Create API Key"
3. Name: "User Interview Campaign"
4. Permission: **Sending access**
5. Copy the key (starts with `re_`)

#### Step 4: Add to Environment Variables
Add to `.env.production`:
```bash
RESEND_API_KEY=re_abcdefghijklmnop1234567890
```

#### Step 5: Update Code to Use Resend

Edit `scripts/send-user-interview-invitations.ts` line ~24:

Replace placeholder with:
```typescript
import { Resend } from 'resend';

async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}): Promise<{ success: boolean; error?: string }> {
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: 'Michael @ TaxBridge <michael@taxbridge.app>',
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

#### Step 6: Install Resend Package
```bash
npm install resend
```

#### Step 7: Test Email Delivery
```bash
# Send test invitation to yourself
npm run interview:invite:dry-run  # Preview first
npm run interview:invite:limit=1   # Send to 1 user (or yourself for testing)
```

---

## 4. Alternative: Manual Gift Card Process

If you don't want to integrate Tremendous API immediately, you can handle gift cards manually for the first 10 interviews.

### Manual Process

#### Before Interviews
1. Buy 10x $20 Amazon gift cards: https://www.amazon.com/gift-cards/b?ie=UTF8&node=2238192011
2. Save codes in a spreadsheet

#### After Each Interview
1. Update database manually:
   ```bash
   sqlite3 data/taxbridge.db
   ```
   ```sql
   INSERT INTO user_interview_completed (
     booking_id, invitation_id, user_id, email,
     interview_date, interview_duration_minutes,
     question_1_answer, question_2_answer, question_3_answer,
     gift_card_code, gift_card_amount, gift_card_sent_at,
     created_at, updated_at
   ) VALUES (
     1, 1, 123, 'user@example.com',
     '2026-03-20', 15,
     'I needed to calculate my RSU taxes...',
     'The price seemed high...',
     'I would pay if it saved me $1000...',
     'AMZN-XXXX-YYYY-ZZZZ', 20, unixepoch(),
     unixepoch(), unixepoch()
   );
   ```

2. Send thank you email manually with gift card code

#### Pros/Cons
✅ **Pros**: No API integration needed, works immediately, full control
❌ **Cons**: Manual work per interview, prone to errors, no automation

---

## 5. Zoom Setup (Interview Platform)

### Basic Setup
1. Sign up for Zoom: https://zoom.us/signup
2. Free plan is sufficient for 1-on-1 interviews
3. Enable: Cloud recording (so you don't forget)
4. Connect Zoom to Calendly (Settings → Conferencing → Add Zoom)

### Interview Best Practices
- Use virtual background or tidy real background
- Good lighting (face camera)
- Quality microphone (test audio before first interview)
- Enable recording (ask permission first)
- Share screen if showing calculator

---

## 6. Testing Checklist

Before sending real invitations:

### Email Flow Test
- [ ] Send test invitation to yourself
- [ ] Verify email delivers (check spam)
- [ ] Click Calendly link works
- [ ] Book test interview
- [ ] Verify confirmation email received
- [ ] Verify Zoom link works
- [ ] Cancel test booking

### Gift Card Flow Test (if using Tremendous)
- [ ] Generate test gift card via Testnet API
- [ ] Verify code is returned
- [ ] Check Tremendous dashboard shows transaction
- [ ] Test redemption URL works

### Database Flow Test
- [ ] Run `npm run interview:invite:dry-run`
- [ ] Verify eligible users found
- [ ] Check database tables created
- [ ] Send test invitation
- [ ] Verify record in `user_interview_invitations` table
- [ ] Check dashboard shows correct stats

---

## 7. Production Launch

Once everything is tested:

1. **Switch APIs to production**:
   - Tremendous: Use `PROD_` API key
   - Email: Use verified domain
   - Calendly: Use production event URL

2. **Send first batch**:
   ```bash
   npm run interview:invite:limit=10
   ```

3. **Monitor dashboard**:
   ```bash
   npm run interview:dashboard
   ```

4. **Respond to bookings**:
   - Check calendar daily
   - Prepare for interviews
   - Conduct interviews professionally
   - Send gift cards within 1 hour

5. **Send reminders** (after 5 days):
   ```bash
   npm run interview:remind
   ```

---

## 🆘 Troubleshooting

### Tremendous API Returns 401 Unauthorized
- **Issue**: Invalid API key
- **Fix**: Verify `TREMENDOUS_API_KEY` is correct, check testnet vs production

### Resend Emails Not Delivering
- **Issue**: Domain not verified or in spam
- **Fix**: Verify domain DNS records, ask recipients to check spam

### Calendly Link Broken
- **Issue**: Event URL changed or deleted
- **Fix**: Check event still exists, update `CALENDLY_EVENT_URL`

### Gift Cards Not Generating
- **Issue**: API integration not implemented
- **Fix**: Follow Section 2 to implement Tremendous API or use manual process (Section 4)

---

**Ready to launch!** Follow this guide to set up services, then refer to `docs/USER_INTERVIEW_CAMPAIGN_GUIDE.md` for campaign execution.
