# 🚀 Deployment Workflow Documentation

**Last Updated:** March 18, 2026
**Owner:** Michael Guo
**Target Audience:** All TaxBridge Engineers

---

## 🎯 Overview

**TaxBridge uses a manual deployment process to protect revenue and ensure production stability.**

- **GitHub (main branch)** = Staging environment
- **Vercel** = Production environment
- **Deployments** = Manual only, by Michael

---

## 🚨 Critical Rules

### What Engineers MUST Do

1. ✅ Write production-quality code
2. ✅ Run `npm run build` before every commit (must pass with zero errors)
3. ✅ Run `npm run lint` (must pass)
4. ✅ Commit and push to GitHub `main` branch
5. ✅ Move on to next task

### What Engineers MUST NOT Do

1. ❌ **NEVER** run `vercel` CLI commands
2. ❌ **NEVER** run `vercel deploy`
3. ❌ **NEVER** run `npm run deploy` (this is blocked intentionally)
4. ❌ **NEVER** auto-deploy to any hosting platform
5. ❌ **NEVER** skip build verification

---

## 📋 Step-by-Step Engineer Workflow

### Every Single Commit Must Follow This:

```bash
# ──────────────────────────────────────────────────
# STEP 1: Make your code changes
# ──────────────────────────────────────────────────
# ... edit files ...

# ──────────────────────────────────────────────────
# STEP 2: REQUIRED - Verify build passes
# ──────────────────────────────────────────────────
npm run build

# If this fails with ANY errors:
# → Fix all TypeScript errors
# → Fix all ESLint errors
# → Run `npm run build` again
# → Repeat until ZERO errors

# If build passes → proceed to Step 3

# ──────────────────────────────────────────────────
# STEP 3: Run linter
# ──────────────────────────────────────────────────
npm run lint

# If this fails:
# → Fix all linting issues
# → Run again until passes

# ──────────────────────────────────────────────────
# STEP 4: Run tests (if applicable)
# ──────────────────────────────────────────────────
npm test                    # Unit tests

# If you changed UI:
npm run test:e2e           # E2E tests

# ──────────────────────────────────────────────────
# STEP 5: Commit your changes
# ──────────────────────────────────────────────────
git add -A
git commit -m "feat: Add TN visa tax calculation support"

# Use conventional commit format:
# - feat: New feature
# - fix: Bug fix
# - refactor: Code restructuring
# - test: Add tests
# - docs: Documentation

# ──────────────────────────────────────────────────
# STEP 6: Push to GitHub
# ──────────────────────────────────────────────────
git push origin main

# ──────────────────────────────────────────────────
# STEP 7: STOP - You are DONE
# ──────────────────────────────────────────────────
# Do NOT deploy to Vercel
# Do NOT run any hosting commands
# Michael handles production deployment

# ✅ Your code is now on GitHub (staging)
# ✅ Michael will review and deploy manually
# ✅ Move on to your next task
```

---

## 🛡️ Why Manual Deployment?

### Revenue Protection

**TaxBridge targets $1M ARR.** Every deployment must be:
- ✅ Tested in production-like conditions
- ✅ Monitored for errors (Sentry)
- ✅ Verified for payment processing (Stripe webhooks)
- ✅ Checked for analytics (PostHog)
- ✅ Ready for rollback if needed

### Production Deployment Checklist (Michael Only)

```bash
# 1. Pull latest code
git pull origin main

# 2. Verify build locally
npm run build

# 3. Run full test suite
npm test
npm run test:e2e

# 4. Review recent changes
git log --oneline -10

# 5. Deploy to Vercel (manual trigger)
# (Via Vercel dashboard or approved CLI with 2FA)

# 6. Post-deployment verification
# → Check Sentry for errors (first 5 minutes)
# → Verify Stripe webhooks firing correctly
# → Check PostHog for traffic anomalies
# → Test critical user flows (signup, payment)
# → Monitor Core Web Vitals

# 7. Rollback procedure (if issues detected)
# → Revert deployment in Vercel dashboard
# → Investigate issues
# → Fix and redeploy
```

---

## 🚫 What Happens If You Try to Deploy?

### Blocked Commands

```bash
# ❌ This will fail with error message
npm run deploy

# Output:
# ⛔️ ERROR: Direct deployment is DISABLED.
#
# ✅ Correct workflow:
#   1. npm run build (verify zero errors)
#   2. git add -A && git commit -m "your message"
#   3. git push origin main
#   4. Michael handles Vercel deployment manually
#
# See README.md for details.

# ❌ This will also fail
npm run vercel

# ❌ Direct Vercel CLI (if installed) - DO NOT USE
vercel
vercel deploy
vercel --prod
```

### Safety Guards

The project has multiple safety guards:

1. **npm scripts** - `npm run deploy` and `npm run vercel` are blocked
2. **Documentation** - README.md, CONTRIBUTING.md, CLAUDE.md all emphasize manual deployment
3. **Pre-push hooks** - Automatically run `npm run build` before allowing push (coming soon)

---

## ✅ Checklist Before Pushing

Print this out or save it:

```
[ ] npm run build passes (zero TypeScript errors)
[ ] npm run lint passes (zero ESLint errors)
[ ] npm test passes (all unit tests)
[ ] npm run test:e2e passes (if UI changes)
[ ] No console.log statements in production code
[ ] No TODO comments in critical paths
[ ] Commit message follows conventional format
[ ] Changes tested locally
[ ] Ready to push to GitHub
[ ] NOT deploying to Vercel (Michael handles this)
```

---

## 🆘 Common Questions

### Q: "What if I need to test in production?"

**A:** You don't deploy to production for testing. Use:
- Local development (`npm run dev`)
- GitHub staging environment (automatic preview)
- Ask Michael to deploy to production if urgent

### Q: "What if there's a critical bug in production?"

**A:**
1. Fix the bug in your local environment
2. Run `npm run build` (must pass)
3. Push to GitHub `main`
4. **Immediately notify Michael** via Slack/GChat
5. Michael will fast-track production deployment
6. Do NOT deploy yourself, even in emergencies

### Q: "What if `npm run build` keeps failing?"

**A:**
1. Read the error message carefully
2. Fix TypeScript errors first (usually type mismatches)
3. Fix ESLint errors next
4. Check for missing imports or circular dependencies
5. Ask for help in team chat if stuck

### Q: "Can I deploy to a preview environment?"

**A:** No. GitHub `main` branch is the staging environment. Vercel preview deployments are also handled manually.

### Q: "What if I accidentally ran `vercel deploy`?"

**A:**
1. **Immediately notify Michael**
2. Provide deployment URL
3. Michael will roll back if necessary
4. Don't run it again

### Q: "Why can't we automate this?"

**A:** We will automate deployment in the future with:
- CI/CD pipeline with health checks
- Automated E2E test runs
- Rollback automation
- Revenue monitoring

For now, manual deployment ensures quality during rapid development phase.

---

## 📊 Deployment Frequency

**Current (Manual):**
- 2-5 deployments per day
- Each deployment manually verified
- Zero-downtime deployments
- Immediate rollback capability

**Future (Automated):**
- After Q1 2026 product stability milestone
- CI/CD pipeline with automated checks
- Preview deployments for PRs
- Automated rollback on errors

---

## 🎓 Training Resources

### For New Engineers

1. Read [README.md](../README.md) - Complete overview
2. Read [CONTRIBUTING.md](../CONTRIBUTING.md) - Development standards
3. Read [CLAUDE.md](../CLAUDE.md) - Deployment rules
4. Read this document - Deployment workflow
5. Set up local environment
6. Make a test commit (fix typo, add comment)
7. Practice: `npm run build` → `git push` → stop

### For Experienced Engineers

- **Reminder:** Even if you have Vercel access, do not deploy
- **Reminder:** Even if deployment "seems safe," follow the workflow
- **Reminder:** Manual deployment is temporary, but critical for revenue protection

---

## 📞 Contact

**Deployment Questions:** Michael Guo
**Technical Issues:** Team chat
**Process Improvement:** Suggest in team meeting

---

## 📝 Version History

- **v1.0** (March 18, 2026) - Initial deployment workflow documentation
- Broadcasted to all engineers as critical update

---

**Remember: Your job is to write great code and push to GitHub. Michael handles production deployment. This keeps revenue safe and quality high.**
