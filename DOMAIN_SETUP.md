# Domain Setup Guide: taxbridge.app

Quick reference for purchasing and configuring the taxbridge.app domain for production deployment.

## Option 1: Cloudflare (Recommended - $10/year)

### Why Cloudflare?
- **Lower cost**: ~$10/year (at cost pricing, no markup)
- **Built-in DNS**: Fast global DNS with 1-2 minute propagation
- **DDoS protection**: Free tier includes basic DDoS mitigation
- **Analytics**: Free web analytics
- **SSL**: Flexible SSL options
- **CDN**: Optional CDN and caching (can enable after Vercel SSL is set up)

### Purchase Steps

1. **Create Cloudflare Account**
   - Go to https://dash.cloudflare.com/sign-up
   - Sign up with email

2. **Register Domain**
   - Click "Domain Registration" in left sidebar
   - Search for "taxbridge.app"
   - Add to cart (~$10.18/year)
   - Complete checkout

3. **DNS Configuration** (Auto-configured)
   - Domain automatically added to Cloudflare DNS
   - Add these DNS records:

   ```
   Type: CNAME
   Name: @
   Target: cname.vercel-dns.com
   TTL: Auto
   Proxy status: DNS only (grey cloud) ← IMPORTANT
   ```

   ```
   Type: CNAME
   Name: www
   Target: cname.vercel-dns.com
   TTL: Auto
   Proxy status: DNS only (grey cloud) ← IMPORTANT
   ```

4. **Why "DNS only" initially?**
   - Vercel needs to verify domain ownership via DNS
   - Vercel needs to provision Let's Encrypt SSL certificate
   - Once SSL is active and verified, you can enable Cloudflare proxy (orange cloud) for additional protection

5. **After SSL is Active** (1-2 hours later)
   - Change Proxy status to "Proxied" (orange cloud)
   - Enable "Always Use HTTPS" in SSL/TLS > Edge Certificates
   - Enable "Automatic HTTPS Rewrites"
   - SSL/TLS encryption mode: "Full (strict)"

### Email Configuration (Optional)
For professional email (support@taxbridge.app):

**Using Cloudflare Email Routing (Free)**
```
1. Go to Email > Email Routing
2. Enable Email Routing
3. Add destination address (your Gmail/personal email)
4. Add custom address: support@taxbridge.app → your-email@gmail.com
5. Verify destination email
```

**Or use Google Workspace ($6/user/month)**
```
1. Sign up at https://workspace.google.com
2. Add domain: taxbridge.app
3. Add MX records in Cloudflare DNS (provided by Google)
4. Create mailboxes: support@, noreply@, admin@
```

## Option 2: Namecheap ($12-15/year)

### Purchase Steps

1. **Buy Domain**
   - Go to https://www.namecheap.com
   - Search "taxbridge.app"
   - Add to cart (~$12.98/year with privacy protection)
   - Complete checkout

2. **Configure DNS**
   - Go to Dashboard > Domain List > taxbridge.app > Manage
   - Navigate to "Advanced DNS" tab
   - Add records:

   ```
   Type: CNAME Record
   Host: @
   Value: cname.vercel-dns.com.
   TTL: Automatic
   ```

   ```
   Type: CNAME Record
   Host: www
   Value: cname.vercel-dns.com.
   TTL: Automatic
   ```

3. **DNS Propagation**
   - Namecheap DNS can take 5-30 minutes to propagate
   - Check: https://www.whatsmydns.net/#CNAME/taxbridge.app

### Email Setup with Namecheap
```
1. Dashboard > taxbridge.app > Manage
2. Navigate to "Email Forwarding"
3. Add: support@taxbridge.app → your-email@gmail.com
4. Add: admin@taxbridge.app → your-email@gmail.com
5. Verify forwarding email addresses
```

## Option 3: Google Domains / Squarespace ($12/year)

Note: Google Domains was acquired by Squarespace in 2023.

### Purchase Steps
1. Go to https://domains.squarespace.com
2. Search "taxbridge.app"
3. Purchase (~$12/year)
4. Add DNS records in DNS settings:
   ```
   Type: CNAME
   Host: @
   Data: cname.vercel-dns.com

   Type: CNAME
   Host: www
   Data: cname.vercel-dns.com
   ```

## After Domain Purchase: Vercel Configuration

Once DNS records are added (wait 5-30 minutes for propagation):

### 1. Add Domain to Vercel

**Via CLI:**
```bash
cd /Users/michaelguo/hivemind-projects/cross-border-tax

# Add primary domain
vercel domains add taxbridge.app --project cross-border-tax

# Add www subdomain (will auto-redirect via vercel.json)
vercel domains add www.taxbridge.app --project cross-border-tax
```

**Via Dashboard:**
```
1. Go to https://vercel.com/caffeinegmt/cross-border-tax
2. Settings > Domains
3. Add "taxbridge.app"
4. Add "www.taxbridge.app"
5. Vercel will auto-detect DNS records
6. SSL certificate provisioned automatically (1-2 minutes)
```

### 2. Verify Domain Configuration

```bash
# Check DNS resolution
nslookup taxbridge.app
nslookup www.taxbridge.app

# Should show CNAME pointing to Vercel

# Test HTTPS
curl -I https://taxbridge.app
curl -I https://www.taxbridge.app

# Both should return 200 OK or redirect
```

### 3. SSL Certificate Verification

```bash
# Check SSL certificate
openssl s_client -connect taxbridge.app:443 -servername taxbridge.app </dev/null 2>/dev/null | openssl x509 -noout -dates

# Or use online tool:
# https://www.ssllabs.com/ssltest/analyze.html?d=taxbridge.app
# Target: A+ rating
```

## DNS Propagation Checker

Use these tools to verify DNS changes are live globally:

- https://www.whatsmydns.net/#CNAME/taxbridge.app
- https://dnschecker.org/#CNAME/taxbridge.app
- https://mxtoolbox.com/SuperTool.aspx?action=cname%3ataxbridge.app

Green checkmarks = DNS is propagated in that region

## Troubleshooting

### Issue: "Domain not found" in Vercel
**Cause**: DNS not propagated yet
**Solution**: Wait 5-30 minutes, then retry `vercel domains add`

### Issue: "Invalid DNS configuration"
**Cause**: CNAME record not pointing to Vercel
**Solution**:
1. Verify CNAME record: `nslookup taxbridge.app`
2. Should show: `cname.vercel-dns.com`
3. If not, check DNS provider settings

### Issue: SSL certificate not provisioning
**Cause**: Cloudflare proxy enabled too early
**Solution**:
1. Set Cloudflare DNS to "DNS only" (grey cloud)
2. Wait for Vercel SSL to provision (1-2 minutes)
3. Then enable Cloudflare proxy (orange cloud)

### Issue: www redirect not working
**Cause**: `vercel.json` redirect not configured
**Solution**: Already configured in this project's `vercel.json`

## Cost Comparison

| Provider | Cost/Year | DNS Speed | Email | Extras |
|----------|-----------|-----------|-------|--------|
| **Cloudflare** | $10 | 1-2 min | Free forwarding | DDoS, CDN, Analytics |
| **Namecheap** | $13 | 5-30 min | Free forwarding | Privacy protection |
| **Squarespace** | $12 | 5-30 min | Basic forwarding | Simple UI |
| **GoDaddy** | $18 | 10-30 min | Paid ($1/mo) | Not recommended |

**Recommendation**: Cloudflare for best value, performance, and features.

## Timeline

Typical domain setup timeline:

```
T+0 min:  Purchase domain
T+1 min:  Add DNS records
T+5 min:  DNS propagation starts
T+15 min: DNS fully propagated (Cloudflare)
T+30 min: DNS fully propagated (Namecheap/others)
T+35 min: Add domain to Vercel
T+37 min: SSL certificate provisioned
T+40 min: https://taxbridge.app is LIVE! 🎉
```

Total time: **~40 minutes** (Cloudflare) or **~60 minutes** (others)

## Post-Setup Checklist

After domain is configured and SSL is active:

- [ ] https://taxbridge.app loads correctly
- [ ] https://www.taxbridge.app redirects to https://taxbridge.app
- [ ] SSL certificate is valid (green lock icon)
- [ ] SSL Labs rating is A+ (https://www.ssllabs.com/ssltest/)
- [ ] Update NEXT_PUBLIC_APP_URL to https://taxbridge.app in Vercel env vars
- [ ] Update Clerk redirect URLs to use taxbridge.app
- [ ] Update Stripe webhook endpoint to https://taxbridge.app/api/webhooks/stripe
- [ ] Test all authentication flows
- [ ] Test payment checkout
- [ ] Verify email sending works with new domain
- [ ] Submit sitemap to Google Search Console

---

**Need help?**
- Cloudflare Support: https://support.cloudflare.com
- Vercel Support: https://vercel.com/support
- Domain issues: Check DEPLOYMENT.md troubleshooting section
