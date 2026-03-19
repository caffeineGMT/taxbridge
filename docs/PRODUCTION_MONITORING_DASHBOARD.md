# Production Monitoring Dashboard

## 📊 Current Status

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| **Uptime %** | - | 99.9%+ | ⏳ Setup pending |
| **Avg Response Time** | - | <500ms | ⏳ Setup pending |
| **P95 Response Time** | - | <1000ms | ⏳ Setup pending |
| **Incidents (30d)** | - | <3 | ⏳ Setup pending |
| **MTTR (Mean Time To Recovery)** | - | <15 min | ⏳ Setup pending |

*Last Updated: Setup in progress*

---

## 🔧 Monitoring Setup Status

- [ ] **External Monitor:** BetterStack or UptimeRobot configured
- [ ] **Slack Alerts:** Webhook connected, test alert successful
- [ ] **Self-Hosted:** `health-check.ts` script running (optional)
- [ ] **Documentation:** Team knows where to find uptime reports

**Setup Guide:** See `docs/PRODUCTION_HEALTH_MONITORING_SETUP.md`

---

## 📈 Uptime History

### Last 7 Days
```
Date         Uptime    Downtime   Incidents
────────────────────────────────────────────
2026-03-19   -         -          -
2026-03-18   -         -          -
2026-03-17   -         -          -
2026-03-16   -         -          -
2026-03-15   -         -          -
2026-03-14   -         -          -
2026-03-13   -         -          -
────────────────────────────────────────────
Total        -         -          -
```

*Data will populate once monitoring is active*

### Last 30 Days
- **Uptime:** -
- **Downtime:** -
- **Incidents:** -
- **Avg Incident Duration:** -

---

## 🚨 Recent Incidents

| Date | Duration | Root Cause | Resolution |
|------|----------|------------|------------|
| - | - | - | - |

*Incident log will populate after monitoring is active*

---

## 📍 Monitored Endpoints

| Endpoint | Purpose | Expected Status | Last Check |
|----------|---------|-----------------|------------|
| `/api/health` | Full health check (DB, deployment) | 200 OK | - |
| `/` | Homepage availability | 200 OK | - |
| `/calculator` | Calculator accessibility | 200 OK | - |
| `/pricing` | Pricing page | 200 OK | - |

---

## 🔔 Alert Configuration

**Slack Channel:** `#production-alerts` (or your configured channel)

**Alert Triggers:**
- 🚨 **Site DOWN:** All endpoints unreachable → Immediate alert
- ⚠️ **Site DEGRADED:** Some endpoints down → Warning alert
- 📈 **Response Time:** >3000ms → Performance warning
- ✅ **Recovery:** Site back online → Recovery notification

**Alert Frequency:**
- First failure: Immediate alert
- Consecutive failures: Every 15 minutes (cooldown prevents spam)
- Recovery: Immediate notification

---

## 📊 Performance Metrics

### Response Time Trends (Last 7 Days)

```
Endpoint         Avg    P50    P95    P99
──────────────────────────────────────────
/api/health      -ms    -ms    -ms    -ms
/                -ms    -ms    -ms    -ms
/calculator      -ms    -ms    -ms    -ms
/pricing         -ms    -ms    -ms    -ms
```

*Response time data will be available once monitoring is active*

---

## 🎯 SLA Targets

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| **Monthly Uptime** | 99.9% | - | ⏳ |
| **Incident Response** | <5 min | - | ⏳ |
| **Incident Resolution** | <15 min | - | ⏳ |
| **False Positive Rate** | <1% | - | ⏳ |

**99.9% uptime = 43 minutes downtime/month maximum**

---

## 🔗 External Links

**BetterStack Dashboard:**
- URL: https://betterstack.com/uptime
- Login: (use configured account)

**UptimeRobot Dashboard:**
- URL: https://uptimerobot.com/dashboard
- Login: (use configured account)

**Slack Workspace:**
- Alerts Channel: `#production-alerts`
- Team Channel: `#engineering`

---

## 📝 Monthly Review Checklist

- [ ] Review uptime % (target: 99.9%+)
- [ ] Analyze incident patterns
- [ ] Check response time trends
- [ ] Test Slack alerts (ensure channel active)
- [ ] Update this dashboard with insights

---

## 🚀 Quick Actions

**Test Alerts:**
```bash
# Temporarily pause monitor to trigger alert
# BetterStack: Dashboard → Monitor → Pause
# UptimeRobot: Monitors → Actions → Pause
# Wait for Slack alert → Resume monitor
```

**View Real-Time Status:**
```bash
# Self-hosted monitoring logs
journalctl --user -u taxbridge-health-monitor -f

# Or cron logs
tail -f /tmp/taxbridge-health-check.log
```

**Check Current Site Health:**
```bash
curl https://taxbridge.vercel.app/api/health | jq
```

---

**Last Updated:** 2026-03-19
**Next Review:** 2026-04-19
