# SendGrid Template HTML Examples

Quick-start HTML templates for the 7-day email drip campaign. Copy these into SendGrid's Code Editor.

---

## Day 1: Welcome + Calculator Tips

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to TaxBridge</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f7f7f7;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        h1 {
            color: #1a1a1a;
            font-size: 24px;
            margin-bottom: 10px;
        }
        .subheadline {
            color: #666;
            font-size: 16px;
            margin-bottom: 30px;
        }
        .feature {
            margin: 20px 0;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 6px;
            border-left: 4px solid #007bff;
        }
        .feature-icon {
            font-size: 24px;
            margin-right: 10px;
        }
        .feature-title {
            font-weight: 600;
            color: #1a1a1a;
            margin-bottom: 5px;
        }
        .feature-description {
            color: #666;
            font-size: 14px;
        }
        .cta {
            text-align: center;
            margin: 40px 0;
        }
        .cta-button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #007bff;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
        }
        .cta-button:hover {
            background-color: #0056b3;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #999;
            font-size: 12px;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h2 style="color: #007bff; margin: 0;">TaxBridge</h2>
        </div>

        <h1>Welcome, {{first_name}}!</h1>
        <p class="subheadline">{{headline}}</p>

        <p>You're now part of 2,000+ H-1B and TN visa workers who are taking control of their cross-border taxes. Here are the most powerful features you can use right now:</p>

        <div class="feature">
            <span class="feature-icon">📊</span>
            <div class="feature-title">Dual Calculator Mode</div>
            <div class="feature-description">View US and Canada tax side-by-side for instant comparisons</div>
        </div>

        <div class="feature">
            <span class="feature-icon">💰</span>
            <div class="feature-title">Foreign Tax Credit (FTC)</div>
            <div class="feature-description">Automatically calculate FTC to avoid double taxation on RSUs</div>
        </div>

        <div class="feature">
            <span class="feature-icon">📝</span>
            <div class="feature-title">Forms Checklist</div>
            <div class="feature-description">Track your 1116, T1135, and other cross-border tax forms</div>
        </div>

        <div class="cta">
            <a href="{{calculator_url}}" class="cta-button">Start Your First Calculation →</a>
        </div>

        <p>Need help? Just reply to this email or visit our <a href="{{knowledge_base_url}}" style="color: #007bff;">Knowledge Base</a>.</p>

        <div class="footer">
            <p>TaxBridge - Cross-Border Tax Calculator for H-1B & TN Workers</p>
            <p>
                <a href="{{dashboard_url}}">Dashboard</a> |
                <a href="{{unsubscribe_url}}">Unsubscribe</a>
            </p>
        </div>
    </div>
</body>
</html>
```

---

## Day 3: Case Study (Social Proof)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>How Sarah Saved $8,400</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f7f7f7;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .logo {
            text-align: center;
            margin-bottom: 30px;
        }
        h1 {
            color: #1a1a1a;
            font-size: 24px;
            margin-bottom: 10px;
        }
        .testimonial-card {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
        }
        .testimonial-header {
            display: flex;
            align-items: center;
            margin-bottom: 20px;
        }
        .avatar {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            background-color: rgba(255,255,255,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
            margin-right: 15px;
        }
        .testimonial-info {
            flex: 1;
        }
        .testimonial-name {
            font-weight: 700;
            font-size: 18px;
            margin-bottom: 5px;
        }
        .testimonial-role {
            opacity: 0.9;
            font-size: 14px;
        }
        .testimonial-quote {
            font-size: 16px;
            line-height: 1.7;
            font-style: italic;
        }
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin: 30px 0;
        }
        .stat {
            text-align: center;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 6px;
        }
        .stat-icon {
            font-size: 32px;
            margin-bottom: 10px;
        }
        .stat-value {
            font-size: 24px;
            font-weight: 700;
            color: #007bff;
            margin-bottom: 5px;
        }
        .stat-label {
            font-size: 12px;
            color: #666;
        }
        .how-it-works {
            margin: 30px 0;
        }
        .step {
            display: flex;
            align-items: center;
            margin: 15px 0;
        }
        .step-number {
            width: 30px;
            height: 30px;
            border-radius: 50%;
            background-color: #007bff;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 15px;
            flex-shrink: 0;
        }
        .cta {
            text-align: center;
            margin: 40px 0;
        }
        .cta-button {
            display: inline-block;
            padding: 14px 32px;
            background-color: #28a745;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 600;
            font-size: 16px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #999;
            font-size: 12px;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="logo">
            <h2 style="color: #007bff; margin: 0;">TaxBridge</h2>
        </div>

        <h1>Hi {{first_name}},</h1>
        <p>Real people are saving thousands using TaxBridge. Here's how Sarah did it:</p>

        <div class="testimonial-card">
            <div class="testimonial-header">
                <div class="avatar">{{case_study.avatar_initials}}</div>
                <div class="testimonial-info">
                    <div class="testimonial-name">{{case_study.user_name}}</div>
                    <div class="testimonial-role">{{case_study.role}}</div>
                    <div class="testimonial-role">{{case_study.location}}</div>
                </div>
            </div>
            <div class="testimonial-quote">
                "{{case_study.testimonial}}"
            </div>
        </div>

        <div class="stats-grid">
            <div class="stat">
                <div class="stat-icon">⏱️</div>
                <div class="stat-value">15+ hours</div>
                <div class="stat-label">Time Saved</div>
            </div>
            <div class="stat">
                <div class="stat-icon">💰</div>
                <div class="stat-value">{{case_study.tax_saved}}</div>
                <div class="stat-label">Money Saved</div>
            </div>
            <div class="stat">
                <div class="stat-icon">🎯</div>
                <div class="stat-value">$2,000/yr</div>
                <div class="stat-label">CPA Fees Avoided</div>
            </div>
        </div>

        <div class="how-it-works">
            <h3 style="margin-bottom: 20px;">How It Works</h3>
            <div class="step">
                <div class="step-number">1</div>
                <div>Enter your RSU details and income</div>
            </div>
            <div class="step">
                <div class="step-number">2</div>
                <div>TaxBridge calculates FTC automatically</div>
            </div>
            <div class="step">
                <div class="step-number">3</div>
                <div>Export tax forms ready for filing</div>
            </div>
        </div>

        <div class="cta">
            <a href="{{calculator_url}}" class="cta-button">Try TaxBridge Now →</a>
        </div>

        <div class="footer">
            <p>TaxBridge - Trusted by 2,000+ H-1B & TN Workers</p>
            <p>
                <a href="{{testimonials_url}}">Read More Stories</a> |
                <a href="{{unsubscribe_url}}">Unsubscribe</a>
            </p>
        </div>
    </div>
</body>
</html>
```

---

## Day 5: Limited Offer (30% Discount)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>30% Off This Week</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f7f7f7;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .banner {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 30px;
        }
        .banner h2 {
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        .banner .discount-code {
            background-color: rgba(255,255,255,0.3);
            padding: 10px 20px;
            border-radius: 4px;
            display: inline-block;
            font-weight: bold;
            font-size: 20px;
            letter-spacing: 2px;
        }
        h1 {
            color: #1a1a1a;
            font-size: 24px;
        }
        .testimonials {
            margin: 30px 0;
        }
        .testimonial {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 15px 0;
            border-left: 4px solid #28a745;
        }
        .testimonial-header {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }
        .testimonial-avatar {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background-color: #007bff;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            margin-right: 10px;
        }
        .testimonial-name {
            font-weight: 600;
        }
        .testimonial-savings {
            color: #28a745;
            font-weight: bold;
            margin-left: auto;
        }
        .pricing-comparison {
            background-color: #f8f9fa;
            padding: 30px;
            border-radius: 8px;
            margin: 30px 0;
        }
        .price-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 0;
            border-bottom: 1px solid #dee2e6;
        }
        .price-row:last-child {
            border-bottom: none;
        }
        .old-price {
            text-decoration: line-through;
            color: #999;
            font-size: 18px;
        }
        .new-price {
            font-size: 32px;
            font-weight: bold;
            color: #28a745;
        }
        .cta {
            text-align: center;
            margin: 40px 0;
        }
        .cta-button {
            display: inline-block;
            padding: 16px 40px;
            background-color: #28a745;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 700;
            font-size: 18px;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #999;
            font-size: 12px;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="banner">
            <h2>🎉 Special Offer: 30% Off</h2>
            <p>Use code: <span class="discount-code">{{discount_code}}</span></p>
            <p style="margin: 0; opacity: 0.9;">Limited time offer - expires in 48 hours</p>
        </div>

        <h1>Hi {{first_name}},</h1>
        <p>Join 2,000+ H-1B and TN workers who are already saving thousands on cross-border taxes.</p>

        <div class="testimonials">
            <div class="testimonial">
                <div class="testimonial-header">
                    <div class="testimonial-avatar">SL</div>
                    <div class="testimonial-name">Sarah L.</div>
                    <div class="testimonial-savings">Saved $8,400</div>
                </div>
                <p style="margin: 0;">"TaxBridge made cross-border taxes actually understandable. I used to pay a CPA $2,000 every year - now I do it myself in 20 minutes."</p>
            </div>

            <div class="testimonial">
                <div class="testimonial-header">
                    <div class="testimonial-avatar">MT</div>
                    <div class="testimonial-name">Michael T.</div>
                    <div class="testimonial-savings">Saved $6,200</div>
                </div>
                <p style="margin: 0;">"I waited until Day 7 and almost missed this offer. Best $34 I've spent - already saved $6,200 in taxes!"</p>
            </div>

            <div class="testimonial">
                <div class="testimonial-header">
                    <div class="testimonial-avatar">PK</div>
                    <div class="testimonial-name">Priya K.</div>
                    <div class="testimonial-savings">Saved $9,800</div>
                </div>
                <p style="margin: 0;">"The FTC calculator alone saved me $9,800. My CPA was impressed - said my forms were perfectly filled out."</p>
            </div>
        </div>

        <div class="pricing-comparison">
            <h3 style="margin-top: 0;">Your Investment</h3>
            <div class="price-row">
                <span>Regular Price:</span>
                <span class="old-price">$49.00/year</span>
            </div>
            <div class="price-row">
                <span>Your 30% Discount:</span>
                <span style="color: #28a745; font-weight: bold;">-$14.70</span>
            </div>
            <div class="price-row">
                <span>Your Price:</span>
                <span class="new-price">{{final_price}}</span>
            </div>
        </div>

        <div class="cta">
            <a href="{{upgrade_url}}" class="cta-button">Claim Your 30% Discount →</a>
        </div>

        <p style="text-align: center; color: #666; font-size: 14px;">
            Compare to $1,500-$3,000/year for a CPA
        </p>

        <div class="footer">
            <p>TaxBridge - Used by engineers at Google, Meta, Amazon, Microsoft</p>
            <p>
                <a href="{{dashboard_url}}">Continue with Free Plan</a> |
                <a href="{{unsubscribe_url}}">Unsubscribe</a>
            </p>
        </div>
    </div>
</body>
</html>
```

---

## Day 7: Last Chance (Urgency)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Last Chance: 30% Off Expires Tonight</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f7f7f7;
        }
        .container {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 40px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .urgency-banner {
            background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
            color: white;
            padding: 25px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 30px;
        }
        .urgency-banner h2 {
            margin: 0 0 10px 0;
            font-size: 28px;
        }
        .urgency-banner .expires {
            font-size: 16px;
            opacity: 0.95;
        }
        .urgency-banner .countdown {
            background-color: rgba(255,255,255,0.2);
            padding: 15px;
            border-radius: 6px;
            margin-top: 15px;
            font-size: 20px;
            font-weight: bold;
        }
        h1 {
            color: #1a1a1a;
            font-size: 24px;
        }
        .missing-out {
            background-color: #fff3cd;
            border-left: 4px solid #ffc107;
            padding: 20px;
            margin: 30px 0;
            border-radius: 6px;
        }
        .missing-out h3 {
            margin-top: 0;
            color: #856404;
        }
        .feature-list {
            list-style: none;
            padding: 0;
        }
        .feature-list li {
            padding: 10px 0;
            display: flex;
            align-items: center;
        }
        .feature-list .icon {
            font-size: 24px;
            margin-right: 15px;
        }
        .price-box {
            background: linear-gradient(135deg, #28a745 0%, #218838 100%);
            color: white;
            padding: 30px;
            border-radius: 8px;
            text-align: center;
            margin: 30px 0;
        }
        .price-box .old-price {
            text-decoration: line-through;
            opacity: 0.8;
            font-size: 18px;
        }
        .price-box .new-price {
            font-size: 42px;
            font-weight: bold;
            margin: 10px 0;
        }
        .price-box .code {
            background-color: rgba(255,255,255,0.3);
            padding: 10px 20px;
            border-radius: 4px;
            display: inline-block;
            font-weight: bold;
            font-size: 18px;
            letter-spacing: 2px;
            margin-top: 10px;
        }
        .cta {
            text-align: center;
            margin: 40px 0;
        }
        .cta-button {
            display: inline-block;
            padding: 18px 50px;
            background-color: #dc3545;
            color: #ffffff;
            text-decoration: none;
            border-radius: 6px;
            font-weight: 700;
            font-size: 20px;
            animation: pulse 2s infinite;
        }
        @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        .testimonial {
            background-color: #f8f9fa;
            padding: 20px;
            border-radius: 6px;
            margin: 20px 0;
            font-style: italic;
        }
        .testimonial-author {
            text-align: right;
            font-weight: 600;
            margin-top: 10px;
            font-style: normal;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            text-align: center;
            color: #999;
            font-size: 12px;
        }
        .footer a {
            color: #007bff;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="urgency-banner">
            <h2>⏰ LAST CHANCE</h2>
            <p class="expires">Your 30% discount expires {{urgency.expires_at}}</p>
            <div class="countdown">{{urgency.time_remaining_display}}</div>
        </div>

        <h1>Hi {{first_name}},</h1>
        <p><strong>This is your final reminder.</strong> Your exclusive 30% discount expires tonight at 11:59 PM PST.</p>

        <div class="missing-out">
            <h3>⚠️ What You're Missing Out On:</h3>
            <ul class="feature-list">
                <li>
                    <span class="icon">💸</span>
                    <span>Save $14.70 on your first year</span>
                </li>
                <li>
                    <span class="icon">📊</span>
                    <span>Unlimited multi-year tax scenarios</span>
                </li>
                <li>
                    <span class="icon">📄</span>
                    <span>Professional PDF tax reports</span>
                </li>
                <li>
                    <span class="icon">⚡</span>
                    <span>Priority support when you need it</span>
                </li>
            </ul>
        </div>

        <div class="price-box">
            <div class="old-price">Regular: $49/year</div>
            <div class="new-price">{{urgency.final_price}}/year</div>
            <div>Use code: <span class="code">{{urgency.discount_code}}</span></div>
            <p style="margin: 15px 0 0 0; opacity: 0.95;">Expires tonight at 11:59 PM PST</p>
        </div>

        <div class="cta">
            <a href="{{upgrade_url}}" class="cta-button">Claim Your Discount Now →</a>
        </div>

        <div class="testimonial">
            "I waited until Day 7 and almost missed this offer. Best $34 I've spent - already saved $6,200 in taxes!"
            <div class="testimonial-author">— Michael T., Google (H-1B), Mountain View → Vancouver</div>
        </div>

        <p style="text-align: center; color: #666;">
            <strong>47 users</strong> upgraded in the last 48 hours.<br>
            Compare to $1,500-$3,000/year for a CPA.
        </p>

        <div class="footer">
            <p>TaxBridge - Your last chance to save 30%</p>
            <p>
                <a href="{{keep_free_url}}">Stay on Free Tier</a> |
                <a href="{{unsubscribe_url}}">Unsubscribe</a>
            </p>
        </div>
    </div>
</body>
</html>
```

---

## Usage Instructions

1. **Log in to SendGrid:** https://app.sendgrid.com
2. **Navigate to:** Email API → Dynamic Templates
3. **Click:** Create a Dynamic Template
4. **Select:** Code Editor
5. **Paste:** One of the HTML templates above
6. **Test:** Send test email with sample data
7. **Activate:** Once tested, copy the template ID to `.env`

## Dynamic Variables Reference

Each template uses variables like `{{first_name}}`, `{{calculator_url}}`, etc. These are automatically populated by the backend code in `lib/email/enhanced-nurture-templates.ts`.

**Do not modify variable names** - they must match exactly what the backend sends.

---

**Next Step:** Configure template IDs in `.env` file and activate campaign.
