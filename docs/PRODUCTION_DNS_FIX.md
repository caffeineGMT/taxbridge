# Production DNS Fix Instructions

**Issue:** Production domain `taxbridgecpa.com` returns connection refused (HTTP 000)
**Working URL:** https://cross-border-tax.vercel.app (HTTP 200)
**Priority:** P0 - CRITICAL BLOCKER
**Estimated Time:** 30 minutes

---

## Problem

```bash
$ curl -s -o /dev/null -w "%{http_code}" https://taxbridgecpa.com
000  # Connection refused - domain not reachable
```

The custom domain `taxbridgecpa.com` is not properly configured to point to the Vercel deployment.

---

## Root Cause Analysis

One or more of the following:
1. **DNS Records Missing or Incorrect** - A/CNAME records at domain registrar not pointing to Vercel
2. **Vercel Custom Domain Not Added** - Domain not configured in Vercel project settings
3. **SSL Certificate Pending** - Certificate provisioning still in progress
4. **Nameserver Propagation** - DNS changes not yet propagated globally (24-48 hours)

---

## Fix Steps

### Step 1: Verify Vercel Project Configuration

1. Log into Vercel: https://vercel.com/
2. Navigate to project: `cross-border-tax`
3. Go to **Settings** → **Domains**
4. Check if `taxbridgecpa.com` is listed
   - ✅ If listed: Check status (should be "Active" with green checkmark)
   - ❌ If not listed: Click **Add Domain** → Enter `taxbridgecpa.com` → **Add**

**Expected Vercel DNS Requirements:**

Vercel will show one of these configurations:

**Option A: CNAME (Recommended)**
```
Type: CNAME
Name: @ (or root)
Value: cname.vercel-dns.com
```

**Option B: A Records**
```
Type: A
Name: @
Value: 76.76.21.21

Type: A
Name: www
Value: 76.76.21.21
```

---

### Step 2: Configure DNS at Domain Registrar

1. **Find Your Registrar**
   - Go to https://who.is/whois/taxbridgecpa.com
   - Note the registrar name (GoDaddy, Namecheap, Cloudflare, etc.)

2. **Log into Registrar**
   - Access DNS management panel
   - Look for "DNS Settings", "DNS Records", or "Manage DNS"

3. **Update DNS Records**

   **If using CNAME (recommended):**
   ```
   Type: CNAME
   Host: @  (or leave blank for root)
   Points to: cname.vercel-dns.com
   TTL: 3600 (or Auto)
   ```

   **If using A Records:**
   ```
   Type: A
   Host: @
   Value: 76.76.21.21
   TTL: 3600

   Type: A
   Host: www
   Value: 76.76.21.21
   TTL: 3600
   ```

4. **Delete Conflicting Records**
   - Remove any existing A or CNAME records for `@` and `www`
   - Remove any AAAA (IPv6) records
   - Remove any other conflicting DNS records

5. **Save Changes**

---

### Step 3: Verify DNS Propagation

Wait 5-10 minutes, then check DNS:

```bash
# Check DNS records
dig taxbridgecpa.com

# Expected output:
# taxbridgecpa.com.    3600    IN    CNAME    cname.vercel-dns.com.
# OR
# taxbridgecpa.com.    3600    IN    A        76.76.21.21

# Check from multiple locations
curl -s "https://dns.google/resolve?name=taxbridgecpa.com&type=A" | jq

# Test HTTP connection
curl -I https://taxbridgecpa.com
```

**Note:** DNS propagation can take 5 minutes to 48 hours depending on:
- TTL (Time To Live) of old records
- DNS cache at ISP level
- Geographic location

---

### Step 4: Verify SSL Certificate

1. In Vercel Dashboard → Domains
2. Check `taxbridgecpa.com` status:
   - ✅ **Active** (green) = SSL certificate issued and working
   - 🟡 **Pending** (yellow) = Certificate provisioning in progress (wait 5-60 min)
   - ❌ **Error** (red) = DNS misconfigured, review Steps 1-2

**Manual SSL Certificate Refresh:**
```bash
# In Vercel Dashboard
Settings → Domains → taxbridgecpa.com → Refresh Certificate
```

---

### Step 5: Final Verification

Once DNS has propagated (5-60 minutes):

```bash
# Should return HTTP 200
curl -s -o /dev/null -w "%{http_code}" https://taxbridgecpa.com

# Should show HTML content
curl https://taxbridgecpa.com | head -20

# Should redirect to HTTPS
curl -I http://taxbridgecpa.com

# Check SSL certificate
openssl s_client -connect taxbridgecpa.com:443 -servername taxbridgecpa.com < /dev/null 2>/dev/null | grep "Verify return code"
# Expected: Verify return code: 0 (ok)
```

---

## Troubleshooting

### Issue 1: "Invalid Configuration" in Vercel

**Cause:** DNS records not pointing to Vercel
**Fix:**
1. Verify DNS records match Vercel requirements exactly
2. Wait 10-30 minutes for DNS propagation
3. Click "Refresh" in Vercel dashboard

---

### Issue 2: "Certificate Provisioning Failed"

**Cause:** DNS not verified, CAA records blocking Let's Encrypt
**Fix:**
1. Ensure DNS A/CNAME records are correct
2. Check for CAA records at registrar:
   ```bash
   dig taxbridgecpa.com CAA
   ```
3. If CAA records exist, add:
   ```
   Type: CAA
   Name: @
   Value: 0 issue "letsencrypt.org"
   ```

---

### Issue 3: "ERR_SSL_PROTOCOL_ERROR"

**Cause:** SSL certificate not yet provisioned
**Fix:**
1. Wait 10-60 minutes for Let's Encrypt certificate
2. Check Vercel dashboard for certificate status
3. Try accessing via `http://` (should redirect to `https://`)

---

### Issue 4: Still Returns 000 After 24 Hours

**Cause:** DNS misconfigured or blocked
**Fix:**
1. Verify DNS with multiple tools:
   - https://dnschecker.org/
   - https://www.whatsmydns.net/
2. Check firewall/router settings
3. Try from different network (mobile data, different WiFi)
4. Contact registrar support

---

## Verification Checklist

Before considering this issue fixed, verify:

- [ ] `dig taxbridgecpa.com` returns Vercel IP or CNAME
- [ ] `curl https://taxbridgecpa.com` returns HTTP 200
- [ ] Browser shows TaxBridge site at https://taxbridgecpa.com
- [ ] SSL certificate shows valid (green lock icon)
- [ ] Vercel dashboard shows domain as "Active" (green)
- [ ] Both `www.taxbridgecpa.com` and `taxbridgecpa.com` work
- [ ] `http://` redirects to `https://`
- [ ] Site accessible from mobile devices
- [ ] Site accessible from different networks (mobile data)

---

## Expected Timeline

| Step | Time |
|------|------|
| Vercel configuration | 5 minutes |
| DNS record updates | 5 minutes |
| DNS propagation | 5-60 minutes (can take up to 48 hours) |
| SSL certificate provisioning | 5-30 minutes |
| **Total** | **20 minutes - 2 hours** (typical) |

---

## Success Criteria

✅ **FIXED when:**
```bash
curl -s -o /dev/null -w "%{http_code}" https://taxbridgecpa.com
200  # Success!
```

---

## Support Resources

- **Vercel Docs:** https://vercel.com/docs/custom-domains
- **Vercel Support:** https://vercel.com/support
- **DNS Checker:** https://dnschecker.org/all-dns-records-of-domain.php?query=taxbridgecpa.com&rtype=ANY
- **SSL Labs Test:** https://www.ssllabs.com/ssltest/analyze.html?d=taxbridgecpa.com

---

**Priority:** P0 - BLOCKING PRODUCTION LAUNCH
**Owner:** DevOps / Infrastructure
**Last Updated:** March 19, 2026
