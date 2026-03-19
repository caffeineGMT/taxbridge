# 🚨 PRODUCTION 503 QUICK REFERENCE

**Status:** Site completely down - DNS failure + deployment issues
**Last Updated:** March 19, 2026 07:15 PST

---

## 📋 TLDR - What's Broken

| Domain | Status | Issue |
|--------|--------|-------|
| taxbridgecpa.com | 🔴 DOWN | DNS doesn't exist (NXDOMAIN) |
| taxbridge.app | 🟡 WRONG APP | Serving Uganda fiscal app |
| cross-border-tax.vercel.app | 🟡 PARTIAL | Homepage works, other routes 404 |

---

## ⚡ FASTEST FIX (Michael - 5 minutes)

### Option 1: Quick Win (Use vercel.app URL)

```bash
# 1. Redeploy in Vercel dashboard
#    → Go to https://vercel.com/dashboard
#    → Open cross-border-tax project
#    → Deployments → Click "Redeploy"
#    → Wait 2-3 minutes

# 2. Verify it works
./scripts/verify-production-health.sh cross-border-tax.vercel.app

# 3. Use this URL until DNS is fixed:
https://cross-border-tax.vercel.app
```

**Trade-off:** Unprofessional URL, but site is LIVE

### Option 2: Proper Fix (Configure DNS)

```bash
# 1. Redeploy first (same as Option 1)

# 2. Check if domain is registered
whois taxbridgecpa.com

# 3. If registered:
#    → Vercel Dashboard → cross-border-tax → Settings → Domains
#    → Add: taxbridgecpa.com
#    → Configure DNS records as shown by Vercel

# 4. If NOT registered:
#    → Register at Namecheap/GoDaddy (~$15/year)
#    → Then follow step 3

# 5. Verify after DNS propagates (5-60 min)
./scripts/verify-production-health.sh taxbridgecpa.com
```

---

## 🧪 TEST COMMANDS

```bash
# Run automated health check
./scripts/verify-production-health.sh taxbridgecpa.com

# Or manual verification:
nslookup taxbridgecpa.com                           # Should return IP
curl -I https://taxbridgecpa.com/                   # Should be 200
curl -I https://taxbridgecpa.com/calculator         # Should be 200
curl -I https://taxbridgecpa.com/pricing            # Should be 200
curl -s https://taxbridgecpa.com/ | grep "US-Canada"  # Should find text
```

---

## 📄 DETAILED DOCS

Full analysis and step-by-step instructions:
→ `docs/PRODUCTION_503_EMERGENCY_FIX.md`

---

## 🎯 WHAT TO DO RIGHT NOW

1. **Redeploy in Vercel** (5 min) - Fixes route 404s
2. **Fix DNS** (10 min) - Makes taxbridgecpa.com work
3. **Verify** (2 min) - Run health check script

**Total Time:** 15-20 minutes (if domain registered), 60 min (if not)
