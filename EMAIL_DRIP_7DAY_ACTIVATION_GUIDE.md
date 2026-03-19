# 7-Day Email Drip Campaign - SendGrid Template Setup Guide

## Quick Start Activation Checklist

**Time to complete: 30 minutes**

- [ ] 1. Create SendGrid account (free tier: 100 emails/day)
- [ ] 2. Verify sender email address
- [ ] 3. Create 4 dynamic templates (copy HTML below)
- [ ] 4. Update environment variables with template IDs
- [ ] 5. Run database migration
- [ ] 6. Test with sample user
- [ ] 7. Deploy to production

---

## Campaign Overview

**7-Day Nurture Sequence to Convert Free Users:**

| Day | Email Type | Subject | Purpose | CTA | Conversion Goal |
|-----|------------|---------|---------|-----|-----------------|
| **1** | Welcome + Tips | "Welcome to TaxBridge - Let's Calculate Your Tax Savings" | Onboarding, quick wins | "Start Calculator →" | Activation |
| **3** | Case Study | "How Sarah Saved $8,400 in Taxes Using TaxBridge" | Social proof, trust | "Calculate My Savings →" | Engagement |
| **5** | Limited Offer | "🎁 Exclusive: 30% Off TaxBridge Pro (48 Hours)" | First discount mention | "Claim 30% Off →" | Conversion |
| **7** | Last Chance | "⏰ Last Chance: Your 30% Discount Expires Tonight" | Urgency + FOMO | "Upgrade Now →" | Conversion |

**Conversion Funnel:**
- Day 1: 100% of users
- Day 3: ~70% (30% churn/unsubscribe)
- Day 5: ~60% (awareness of paid tier)
- Day 7: ~50% (final conversion opportunity)
- **Target conversion: 1-2% to paid** ($49/year → $34.30 with code)

---

## Step 1: Create SendGrid Account

1. Go to https://sendgrid.com/
2. Sign up for Free Plan (100 emails/day)
3. Verify your email address
4. Complete sender authentication:
   - Go to Settings → Sender Authentication
   - Verify single sender: `noreply@taxbridge.app`
   - Or set up domain authentication (recommended for production)

**Free Tier Limits:**
- 100 emails/day
- Single sender verification
- Email API access
- Dynamic templates

**Upgrade trigger:** When you hit 100+ signups/day

---

## Step 2: Create Dynamic Templates

Go to **Email API → Dynamic Templates** in SendGrid dashboard.

### Template 1: Day 1 - Welcome + Calculator Tips

**Template Name:** `TaxBridge - Day 1 Welcome`

**Subject Line:** `Welcome to TaxBridge - Let's Calculate Your Tax Savings`

**HTML Content:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to TaxBridge</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #1a1a1a;
      padding: 24px;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #ffffff;
    }
    .content {
      padding: 40px 24px;
    }
    .headline {
      font-size: 28px;
      font-weight: bold;
      color: #1a1a1a;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }
    .subheadline {
      font-size: 16px;
      color: #666666;
      margin: 0 0 32px 0;
      line-height: 1.5;
    }
    .greeting {
      font-size: 16px;
      color: #1a1a1a;
      margin: 0 0 24px 0;
    }
    .tip-card {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 16px;
    }
    .tip-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }
    .tip-title {
      font-size: 18px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 8px 0;
    }
    .tip-description {
      font-size: 14px;
      color: #666666;
      margin: 0;
      line-height: 1.5;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      margin: 32px 0;
      text-align: center;
    }
    .cta-button:hover {
      background-color: #1d4ed8;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="logo">🌉 TaxBridge</div>
    </div>

    <!-- Content -->
    <div class="content">
      <h1 class="headline">{{headline}}</h1>
      <p class="subheadline">You're all set! Let's help you save thousands on cross-border taxes.</p>

      <p class="greeting">Hi {{first_name}},</p>

      <p style="font-size: 16px; color: #1a1a1a; line-height: 1.6;">
        Welcome to TaxBridge! You just took the first step toward mastering cross-border taxes between the US and Canada.
      </p>

      <p style="font-size: 16px; color: #1a1a1a; line-height: 1.6;">
        Here are 3 features to get you started:
      </p>

      <!-- Tips -->
      <div class="tip-card">
        <div class="tip-icon">📊</div>
        <h3 class="tip-title">Dual Calculator Mode</h3>
        <p class="tip-description">View US and Canada tax side-by-side for instant comparisons. Perfect for H-1B → Canada PR transitions.</p>
      </div>

      <div class="tip-card">
        <div class="tip-icon">💰</div>
        <h3 class="tip-title">Foreign Tax Credit (FTC)</h3>
        <p class="tip-description">Automatically calculate FTC to avoid double taxation on your RSUs. Claim every dollar you're entitled to.</p>
      </div>

      <div class="tip-card">
        <div class="tip-icon">📝</div>
        <h3 class="tip-title">Forms Checklist</h3>
        <p class="tip-description">Track Form 1116 (FTC), T1135 (foreign property), and other cross-border requirements.</p>
      </div>

      <!-- CTA -->
      <center>
        <a href="{{calculator_url}}" class="cta-button">Start Your First Calculation →</a>
      </center>

      <p style="font-size: 14px; color: #666666; line-height: 1.6;">
        Need help? Reply to this email or visit our <a href="{{knowledge_base_url}}" style="color: #2563eb;">knowledge base</a>.
      </p>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>TaxBridge | Cross-Border Tax Simplified</p>
      <p>
        <a href="{{unsubscribe_url}}">Unsubscribe</a> |
        <a href="mailto:{{support_email}}">Support</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

### Template 2: Day 3 - Case Study

**Template Name:** `TaxBridge - Day 3 Case Study`

**Subject Line:** `How Sarah Saved $8,400 in Taxes Using TaxBridge`

**HTML Content:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Case Study: How Sarah Saved $8,400</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #1a1a1a;
      padding: 24px;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #ffffff;
    }
    .content {
      padding: 40px 24px;
    }
    .headline {
      font-size: 28px;
      font-weight: bold;
      color: #1a1a1a;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }
    .testimonial-card {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #ffffff;
      border-radius: 12px;
      padding: 32px;
      margin: 24px 0;
    }
    .avatar {
      width: 64px;
      height: 64px;
      background-color: rgba(255,255,255,0.2);
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: bold;
      margin-bottom: 16px;
    }
    .quote {
      font-size: 18px;
      font-style: italic;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    .author {
      font-size: 14px;
      font-weight: 600;
      opacity: 0.9;
    }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 16px;
      margin: 24px 0;
    }
    .stat-card {
      text-align: center;
      padding: 20px;
      background-color: #f8f9fa;
      border-radius: 8px;
    }
    .stat-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }
    .stat-value {
      font-size: 20px;
      font-weight: bold;
      color: #1a1a1a;
      margin-bottom: 4px;
    }
    .stat-label {
      font-size: 12px;
      color: #666666;
    }
    .step {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .step-number {
      background-color: #2563eb;
      color: #ffffff;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      margin-right: 16px;
      flex-shrink: 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      padding: 16px 32px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      margin: 32px 0;
      text-align: center;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🌉 TaxBridge</div>
    </div>

    <div class="content">
      <h1 class="headline">Real user, real savings</h1>

      <p style="font-size: 16px; color: #1a1a1a; line-height: 1.6;">
        Hi {{first_name}},
      </p>

      <p style="font-size: 16px; color: #1a1a1a; line-height: 1.6;">
        Meet Sarah. She moved from Seattle to Toronto on a work permit, with $120,000 in RSUs vesting over 4 years.
      </p>

      <!-- Testimonial Card -->
      <div class="testimonial-card">
        <div class="avatar">SL</div>
        <p class="quote">
          "TaxBridge made cross-border taxes actually understandable. I used to pay a CPA $2,000 every year - now I do it myself in 20 minutes."
        </p>
        <p class="author">
          Sarah L., Senior Software Engineer<br>
          Tech Company (H-1B → Canada PR)
        </p>
      </div>

      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">⏱️</div>
          <div class="stat-value">15+ hrs</div>
          <div class="stat-label">Time Saved</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">💰</div>
          <div class="stat-value">$8,400</div>
          <div class="stat-label">Tax Saved</div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-value">$2,000</div>
          <div class="stat-label">CPA Fees Avoided</div>
        </div>
      </div>

      <h3 style="font-size: 20px; color: #1a1a1a; margin: 32px 0 16px 0;">
        How it works:
      </h3>

      <div class="step">
        <div class="step-number">1</div>
        <div>
          <h4 style="margin: 0 0 4px 0; font-size: 16px;">Enter your RSU details and income</h4>
          <p style="margin: 0; font-size: 14px; color: #666666;">Takes 5 minutes to input your vest schedule</p>
        </div>
      </div>

      <div class="step">
        <div class="step-number">2</div>
        <div>
          <h4 style="margin: 0 0 4px 0; font-size: 16px;">TaxBridge calculates FTC automatically</h4>
          <p style="margin: 0; font-size: 14px; color: #666666;">No more guessing or complex spreadsheets</p>
        </div>
      </div>

      <div class="step">
        <div class="step-number">3</div>
        <div>
          <h4 style="margin: 0 0 4px 0; font-size: 16px;">Export tax forms ready for filing</h4>
          <p style="margin: 0; font-size: 14px; color: #666666;">Form 1116 and T1135 pre-filled for you</p>
        </div>
      </div>

      <center>
        <a href="{{calculator_url}}" class="cta-button">Calculate My Savings →</a>
      </center>

      <p style="font-size: 14px; color: #666666; text-align: center;">
        Join 2,000+ cross-border workers saving on taxes
      </p>
    </div>

    <div class="footer">
      <p>TaxBridge | Cross-Border Tax Simplified</p>
      <p>
        <a href="{{unsubscribe_url}}">Unsubscribe</a> |
        <a href="mailto:{{support_email}}">Support</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

### Template 3: Day 5 - Limited Offer

**Template Name:** `TaxBridge - Day 5 Limited Offer`

**Subject Line:** `🎁 Exclusive Offer: 30% Off TaxBridge Pro (48 Hours Only)`

**HTML Content:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Limited Offer: 30% Off</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #1a1a1a;
      padding: 24px;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #ffffff;
    }
    .content {
      padding: 40px 24px;
    }
    .badge {
      background-color: #10b981;
      color: #ffffff;
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .headline {
      font-size: 32px;
      font-weight: bold;
      color: #1a1a1a;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }
    .offer-box {
      background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
      color: #1a1a1a;
      border-radius: 12px;
      padding: 32px;
      margin: 32px 0;
      text-align: center;
    }
    .discount {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 8px;
    }
    .price {
      font-size: 24px;
      margin-bottom: 16px;
    }
    .strikethrough {
      text-decoration: line-through;
      opacity: 0.6;
    }
    .code-box {
      background-color: rgba(0,0,0,0.1);
      padding: 12px 24px;
      border-radius: 8px;
      display: inline-block;
      font-size: 20px;
      font-weight: bold;
      letter-spacing: 2px;
      margin: 16px 0;
    }
    .feature-list {
      margin: 24px 0;
    }
    .feature {
      display: flex;
      align-items: flex-start;
      margin-bottom: 16px;
    }
    .feature-icon {
      font-size: 24px;
      margin-right: 12px;
    }
    .feature-text {
      flex: 1;
    }
    .feature-title {
      font-size: 16px;
      font-weight: 600;
      color: #1a1a1a;
      margin: 0 0 4px 0;
    }
    .feature-desc {
      font-size: 14px;
      color: #666666;
      margin: 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #2563eb;
      color: #ffffff !important;
      text-decoration: none;
      padding: 18px 40px;
      border-radius: 8px;
      font-size: 18px;
      font-weight: 600;
      margin: 32px 0;
      text-align: center;
    }
    .timer {
      text-align: center;
      color: #dc2626;
      font-size: 14px;
      font-weight: 600;
      margin-top: 16px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🌉 TaxBridge</div>
    </div>

    <div class="content">
      <div class="badge">🎁 LIMITED TIME OFFER</div>
      <h1 class="headline">Save 30% on your first year</h1>

      <p style="font-size: 16px; color: #1a1a1a; line-height: 1.6;">
        Hi {{first_name}},
      </p>

      <p style="font-size: 16px; color: #1a1a1a; line-height: 1.6;">
        You've been using TaxBridge for 5 days. Ready to unlock everything?
      </p>

      <!-- Offer Box -->
      <div class="offer-box">
        <div class="discount">30% OFF</div>
        <div class="price">
          <span class="strikethrough">$49/year</span>
          <strong style="font-size: 32px; display: block; margin-top: 8px;">$34.30/year</strong>
        </div>
        <div class="code-box">WELCOME30</div>
        <p style="margin: 16px 0 0 0; font-size: 14px;">
          ⏰ Valid for 48 hours only
        </p>
      </div>

      <h3 style="font-size: 20px; color: #1a1a1a; margin: 32px 0 16px 0;">
        What you get with Pro:
      </h3>

      <div class="feature-list">
        <div class="feature">
          <div class="feature-icon">♾️</div>
          <div class="feature-text">
            <h4 class="feature-title">Unlimited RSU Calculations</h4>
            <p class="feature-desc">No limits on calculations or scenarios</p>
          </div>
        </div>

        <div class="feature">
          <div class="feature-icon">📊</div>
          <div class="feature-text">
            <h4 class="feature-title">Multi-Year Tax Planning</h4>
            <p class="feature-desc">Plan 3-5 years ahead for vest schedules</p>
          </div>
        </div>

        <div class="feature">
          <div class="feature-icon">📄</div>
          <div class="feature-text">
            <h4 class="feature-title">PDF Tax Reports</h4>
            <p class="feature-desc">Professional reports for your CPA or records</p>
          </div>
        </div>

        <div class="feature">
          <div class="feature-icon">⚡</div>
          <div class="feature-text">
            <h4 class="feature-title">Priority Support</h4>
            <p class="feature-desc">Email support with 24-hour response time</p>
          </div>
        </div>

        <div class="feature">
          <div class="feature-icon">📝</div>
          <div class="feature-text">
            <h4 class="feature-title">Form Pre-Fill</h4>
            <p class="feature-desc">Auto-populate Form 1116 and T1135</p>
          </div>
        </div>
      </div>

      <center>
        <a href="{{upgrade_url}}" class="cta-button">Claim My 30% Discount →</a>
        <div class="timer">⏰ Offer expires in 48 hours</div>
      </center>

      <p style="font-size: 12px; color: #999999; text-align: center; margin-top: 32px;">
        Join 2,000+ users | ⭐⭐⭐⭐⭐ 4.9/5 (320 reviews) | $4.2M+ tax saved
      </p>
    </div>

    <div class="footer">
      <p>TaxBridge | Cross-Border Tax Simplified</p>
      <p>
        <a href="{{unsubscribe_url}}">Unsubscribe</a> |
        <a href="mailto:{{support_email}}">Support</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

### Template 4: Day 7 - Last Chance

**Template Name:** `TaxBridge - Day 7 Last Chance`

**Subject Line:** `⏰ Last Chance: Your 30% Discount Expires Tonight`

**HTML Content:**

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Last Chance: Discount Expires Tonight</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
    }
    .header {
      background-color: #1a1a1a;
      padding: 24px;
      text-align: center;
    }
    .logo {
      font-size: 24px;
      font-weight: bold;
      color: #ffffff;
    }
    .content {
      padding: 40px 24px;
    }
    .urgency-badge {
      background-color: #dc2626;
      color: #ffffff;
      display: inline-block;
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 600;
      margin-bottom: 16px;
    }
    .headline {
      font-size: 32px;
      font-weight: bold;
      color: #1a1a1a;
      margin: 0 0 16px 0;
      line-height: 1.3;
    }
    .countdown-box {
      background-color: #fef2f2;
      border: 2px solid #dc2626;
      border-radius: 12px;
      padding: 32px;
      margin: 32px 0;
      text-align: center;
    }
    .countdown-time {
      font-size: 48px;
      font-weight: bold;
      color: #dc2626;
      margin-bottom: 8px;
    }
    .checklist {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 24px;
      margin: 24px 0;
    }
    .checklist-item {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
      font-size: 16px;
      color: #1a1a1a;
    }
    .checklist-item:last-child {
      margin-bottom: 0;
    }
    .testimonial-small {
      background-color: #f0f9ff;
      border-left: 4px solid #2563eb;
      padding: 16px 20px;
      margin: 24px 0;
    }
    .testimonial-quote {
      font-size: 14px;
      font-style: italic;
      color: #1a1a1a;
      margin: 0 0 8px 0;
    }
    .testimonial-author {
      font-size: 12px;
      color: #666666;
      margin: 0;
    }
    .cta-button {
      display: inline-block;
      background-color: #dc2626;
      color: #ffffff !important;
      text-decoration: none;
      padding: 20px 48px;
      border-radius: 8px;
      font-size: 20px;
      font-weight: 600;
      margin: 32px 0 16px 0;
      text-align: center;
    }
    .cta-button:hover {
      background-color: #b91c1c;
    }
    .alternative {
      text-align: center;
      font-size: 14px;
      color: #666666;
      margin-top: 24px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 24px;
      text-align: center;
      font-size: 12px;
      color: #666666;
    }
    .footer a {
      color: #2563eb;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">🌉 TaxBridge</div>
    </div>

    <div class="content">
      <div class="urgency-badge">⏰ EXPIRES TONIGHT</div>
      <h1 class="headline">Don't miss out on $14.70 in savings</h1>

      <p style="font-size: 16px; color: #1a1a1a; line-height: 1.6;">
        Hi {{first_name}},
      </p>

      <p style="font-size: 16px; color: #1a1a1a; line-height: 1.6;">
        This is it. Your exclusive 30% discount expires <strong>tonight at 11:59 PM PST</strong>.
      </p>

      <!-- Countdown Box -->
      <div class="countdown-box">
        <div class="countdown-time">TONIGHT</div>
        <p style="font-size: 18px; color: #1a1a1a; margin: 0 0 16px 0;">
          Code <strong>WELCOME30</strong> expires at 11:59 PM
        </p>
        <p style="font-size: 24px; color: #dc2626; font-weight: bold; margin: 0;">
          $49 → $34.30/year
        </p>
        <p style="font-size: 14px; color: #666666; margin: 8px 0 0 0;">
          Save $14.70
        </p>
      </div>

      <h3 style="font-size: 20px; color: #1a1a1a; margin: 32px 0 16px 0;">
        What you're missing out on:
      </h3>

      <div class="checklist">
        <div class="checklist-item">
          💸 Save $14.70 on your first year
        </div>
        <div class="checklist-item">
          📊 Unlimited multi-year tax scenarios
        </div>
        <div class="checklist-item">
          📄 Professional PDF tax reports
        </div>
        <div class="checklist-item">
          ⚡ Priority support when you need it
        </div>
      </div>

      <!-- Testimonial -->
      <div class="testimonial-small">
        <p class="testimonial-quote">
          "I waited until Day 7 and almost missed this offer. Best $34 I've spent - already saved $3,200 in taxes!"
        </p>
        <p class="testimonial-author">
          Michael T., SWE at Google (H-1B) | Mountain View → Vancouver
        </p>
      </div>

      <h3 style="font-size: 18px; color: #1a1a1a; margin: 32px 0 16px 0;">
        Quick comparison:
      </h3>

      <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
        <tr style="background-color: #f8f9fa;">
          <td style="padding: 12px;">DIY (Spreadsheets)</td>
          <td style="padding: 12px; text-align: right;">$0 <span style="color: #666666;">(20+ hours)</span></td>
        </tr>
        <tr>
          <td style="padding: 12px;">CPA</td>
          <td style="padding: 12px; text-align: right;">$1,500-$3,000<span style="color: #666666;">/year</span></td>
        </tr>
        <tr style="background-color: #f0f9ff; font-weight: bold;">
          <td style="padding: 12px;">TaxBridge Pro</td>
          <td style="padding: 12px; text-align: right; color: #2563eb;">$34.30<span style="color: #666666; font-weight: normal;">/year</span></td>
        </tr>
      </table>

      <center>
        <a href="{{upgrade_url}}" class="cta-button">Upgrade Now (Expires Tonight) →</a>
        <p style="font-size: 12px; color: #dc2626; font-weight: 600; margin: 0;">
          ⏰ Last chance to save $14.70
        </p>
      </center>

      <div class="alternative">
        <p style="margin: 0;">
          Not ready? <a href="{{keep_free_url}}" style="color: #2563eb;">Keep free account</a> (3 calculations/month)
        </p>
      </div>

      <p style="font-size: 12px; color: #999999; text-align: center; margin-top: 32px;">
        47 users upgraded in the last 48 hours
      </p>
    </div>

    <div class="footer">
      <p>TaxBridge | Cross-Border Tax Simplified</p>
      <p>
        <a href="{{unsubscribe_url}}">Unsubscribe</a> |
        <a href="mailto:{{support_email}}">Support</a>
      </p>
    </div>
  </div>
</body>
</html>
```

---

## Step 3: Environment Variables

Add these to `.env.local` and Vercel:

```bash
# SendGrid Configuration
SENDGRID_API_KEY=SG.your_api_key_here
SENDGRID_FROM_EMAIL=noreply@taxbridge.app
SENDGRID_FROM_NAME=TaxBridge
SENDGRID_REPLY_TO=support@taxbridge.app

# Template IDs (after creating in SendGrid)
SENDGRID_TEMPLATE_DAY1=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_TEMPLATE_DAY3=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_TEMPLATE_DAY5=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxx
SENDGRID_TEMPLATE_DAY7=d-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Cron Secret (generate: openssl rand -base64 32)
CRON_SECRET=your_secure_random_string_here
```

---

## Step 4: Database Migration

```bash
npm run db:migrate
```

This creates the `email_events` table with the new 7-day event types.

---

## Step 5: Testing

### Test Locally

```bash
npm run test:email-drip
```

### Manual Cron Trigger

```bash
curl http://localhost:3000/api/cron/email-drip \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

---

## Step 6: Deploy to Production

```bash
npm run build
git add -A
git commit -m "Activate 7-day email drip campaign with SendGrid"
git push origin main
```

Michael will handle Vercel deployment manually.

---

## Success Metrics

**Track these in PostHog/Analytics:**

- Email delivery rate: >95%
- Open rate: >25% (SaaS benchmark: 21%)
- Click rate: >5% (SaaS benchmark: 2.3%)
- Conversion rate (Day 7): 1-2%
- Unsubscribe rate: <2%

**Revenue Projections:**

| Signups/Month | Conversion (1.5%) | Monthly Revenue | Annual Revenue |
|---------------|-------------------|-----------------|----------------|
| 1,000 | 15 users | $515 | $6,180 |
| 5,000 | 75 users | $2,573 | $30,870 |
| 10,000 | 150 users | $5,145 | $61,740 |

**Path to $1M ARR:** 50,000 monthly signups at 1.5% conversion

---

## Monitoring & Optimization

### Week 1: Monitor
- Check Vercel logs for cron execution
- Verify SendGrid activity dashboard
- Track opens/clicks in database

### Week 2: A/B Test
- Test subject lines (emoji vs no emoji)
- Test send times (9 AM vs 6 PM)
- Test CTA copy

### Month 1: Optimize
- Analyze drop-off points
- Adjust messaging based on data
- Consider adding Day 2 or Day 4 emails if gaps exist

---

## Troubleshooting

**Emails not sending:**
- Check `SENDGRID_API_KEY` is valid
- Verify sender email is verified in SendGrid
- Check Vercel function logs

**Cron not running:**
- Verify `vercel.json` has cron config
- Check Vercel plan supports cron (Hobby+)
- Test manual trigger works

**Template not rendering:**
- Verify template IDs match env vars
- Test template in SendGrid preview
- Check dynamic data structure

---

**Implementation Time:** ~30 minutes
**Complexity:** Low (templates ready to copy/paste)
**Impact:** High (automated conversion funnel)

🚀 **You're ready to activate!**
