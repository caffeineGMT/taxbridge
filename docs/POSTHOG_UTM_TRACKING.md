# PostHog UTM Tracking Guide - Launch Day

Monitor community posting performance in real-time using UTM parameters and PostHog analytics.

---

## UTM Parameter Structure

All community post URLs follow this format:
```
https://taxbridge.app?utm_source={source}&utm_medium={medium}&utm_campaign=ph_launch&utm_content={content}
```

### Parameters Explained

- **utm_source**: Platform (reddit, hackernews, linkedin, twitter, facebook, indiehackers)
- **utm_medium**: Post type (post, thread, show_hn, group)
- **utm_campaign**: Always `ph_launch` (identifies Product Hunt launch day traffic)
- **utm_content**: Specific community (PersonalFinanceCanada, VancouverTech, etc.)

---

## Community-Specific URLs

### Reddit

1. **r/PersonalFinanceCanada**
   ```
   https://taxbridge.app?utm_source=reddit&utm_medium=post&utm_campaign=ph_launch&utm_content=PersonalFinanceCanada
   ```

2. **r/CanadianInvestor**
   ```
   https://taxbridge.app?utm_source=reddit&utm_medium=post&utm_campaign=ph_launch&utm_content=CanadianInvestor
   ```

3. **r/ImmigrationCanada**
   ```
   https://taxbridge.app?utm_source=reddit&utm_medium=post&utm_campaign=ph_launch&utm_content=ImmigrationCanada
   ```

4. **r/SideProject**
   ```
   https://taxbridge.app?utm_source=reddit&utm_medium=post&utm_campaign=ph_launch&utm_content=SideProject
   ```

5. **r/cscareerquestions**
   ```
   https://taxbridge.app?utm_source=reddit&utm_medium=post&utm_campaign=ph_launch&utm_content=cscareerquestions
   ```

6. **r/tax**
   ```
   https://taxbridge.app?utm_source=reddit&utm_medium=post&utm_campaign=ph_launch&utm_content=tax
   ```

### Hacker News

7. **Show HN**
   ```
   https://taxbridge.app?utm_source=hackernews&utm_medium=show_hn&utm_campaign=ph_launch
   ```

### LinkedIn

8. **Personal Post**
   ```
   https://taxbridge.app?utm_source=linkedin&utm_medium=post&utm_campaign=ph_launch
   ```

9. **Vancouver Tech Community**
   ```
   https://taxbridge.app?utm_source=linkedin&utm_medium=group&utm_campaign=ph_launch&utm_content=VancouverTech
   ```

10. **Toronto Tech**
    ```
    https://taxbridge.app?utm_source=linkedin&utm_medium=group&utm_campaign=ph_launch&utm_content=TorontoTech
    ```

### Twitter

11. **Thread**
    ```
    https://taxbridge.app?utm_source=twitter&utm_medium=thread&utm_campaign=ph_launch
    ```

### Facebook

12. **H-1B Visa Holders**
    ```
    https://taxbridge.app?utm_source=facebook&utm_medium=group&utm_campaign=ph_launch&utm_content=H1BVisaHolders
    ```

13. **H-1B to Canada Immigration**
    ```
    https://taxbridge.app?utm_source=facebook&utm_medium=group&utm_campaign=ph_launch&utm_content=H1BtoCanada
    ```

14. **Tech Workers Immigration**
    ```
    https://taxbridge.app?utm_source=facebook&utm_medium=group&utm_campaign=ph_launch&utm_content=TechWorkersImmigration
    ```

### Indie Hackers

15. **Share Your Product**
    ```
    https://taxbridge.app?utm_source=indiehackers&utm_medium=post&utm_campaign=ph_launch
    ```

---

## Monitoring in PostHog

### Real-Time Dashboard

**URL**: https://app.posthog.com (or your PostHog instance)

**Key Metrics to Track**:

1. **Traffic by Source** (Insights → Trends)
   - Event: `$pageview`
   - Breakdown: `utm_source`
   - Filters: `utm_campaign = ph_launch`

2. **Clicks Per Community** (Insights → Trends)
   - Event: `$pageview`
   - Breakdown: `utm_content`
   - Filters: `utm_campaign = ph_launch`

3. **Conversion Funnel** (Insights → Funnels)
   - Step 1: `landing_page_viewed` (UTM tagged)
   - Step 2: `signup_completed`
   - Step 3: `onboarding_completed`
   - Step 4: `subscription_activated`
   - Breakdown: `utm_source`

4. **Session Recordings** (Session Replay)
   - Filter: `utm_campaign = ph_launch`
   - Watch user behavior from each community

---

## Expected Traffic Patterns

### High-Performing Communities (Target: 50+ clicks each)

- **r/PersonalFinanceCanada** (700K members) - 100+ clicks
- **r/cscareerquestions** (2M members) - 150+ clicks
- **Hacker News** (front page = 500+ clicks)
- **r/SideProject** (200K members) - 80+ clicks

### Medium-Performing (Target: 20-50 clicks each)

- **r/CanadianInvestor** (250K members)
- **r/ImmigrationCanada** (150K members)
- **LinkedIn Personal Post** (1st/2nd connections)
- **Indie Hackers** (active community)

### Niche Communities (Target: 10-20 clicks each)

- **Facebook Groups** (H-1B communities)
- **LinkedIn Groups** (Vancouver/Toronto Tech)
- **Twitter Thread** (follower-dependent)
- **r/tax** (niche but high-intent)

---

## Real-Time Tracking Checklist

### Every Hour During Launch Day

- [ ] Check PostHog dashboard
- [ ] Identify top-performing sources
- [ ] Respond to comments on high-traffic posts
- [ ] Double-down on well-performing communities (more engagement)

### Key Questions to Answer

1. **Which community drives most traffic?**
   - Sort by `utm_content` → traffic count
   - Prioritize engagement on that community

2. **Which community has best conversion rate?**
   - Funnel analysis by `utm_source`
   - These are your ideal customers - engage deeply

3. **Which posts are underperforming?**
   - Low clicks despite high upvotes = bad CTA or link placement
   - Update post with clearer link

---

## Troubleshooting

### Issue: PostHog not tracking UTM params

**Check**:
1. PostHog snippet installed in `app/layout.tsx`
2. Auto-capture enabled (`autocapture: true`)
3. Property capture enabled (`capture_pageview: true`)

**Fix**:
```typescript
posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
  api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  autocapture: true,
  capture_pageview: true,
  // Explicitly capture UTM params
  property_blacklist: [] // Don't block any properties
});
```

### Issue: UTM params not appearing in events

**Cause**: PostHog auto-captures UTM params as event properties

**Solution**: Check event properties, not event name
- Event: `$pageview`
- Properties: `utm_source`, `utm_medium`, `utm_campaign`, `utm_content`

---

## Export Data for Analysis

### After Launch Day (Next Morning)

1. **Export Traffic Report**
   - Insights → Export → CSV
   - Breakdown by `utm_source` and `utm_content`
   - Share with team

2. **Create Dashboard**
   - Dashboard → New Dashboard → "Launch Day Performance"
   - Add widgets:
     - Traffic by source (bar chart)
     - Conversion funnel (funnel chart)
     - Session recordings (list)
     - Top pages (table)

3. **Share Findings**
   - Screenshot top-performing communities
   - Document lessons learned
   - Plan follow-up engagement

---

## Success Metrics (End of Day)

**Traffic Goals**:
- Total clicks: 500+ (from all 15 communities)
- Reddit: 300+ clicks
- Hacker News: 100+ clicks (if front page)
- LinkedIn: 50+ clicks
- Twitter: 30+ clicks
- Facebook: 20+ clicks

**Conversion Goals**:
- Click → Signup: 10% (50 signups)
- Signup → Onboarding: 80% (40 completed)
- Onboarding → Pro: 10% (5 paid customers = $1,495 revenue)

**Engagement Goals**:
- Average session duration: 2+ minutes (indicates reading)
- Pages per session: 3+ (browsing calculator, pricing, forms)
- Bounce rate: <60% (high quality traffic)

---

**Monitor PostHog throughout the day and adjust strategy in real-time!**
