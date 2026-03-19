# CLAUDE.md

## TASK COMPLETION POLICY [MANDATORY - NO EXCEPTIONS]

**NO TASK CAN BE MARKED "DONE" WITHOUT EVIDENCE.**

### Evidence Requirements (Choose ONE minimum):
1. **Screenshots** - Desktop + mobile views in production
2. **Video Recording** - Max 2min showing feature working
3. **Logs/Terminal Output** - Build/test/deployment logs
4. **Deployed Feature URL** - Production URL returning HTTP 200
5. **Analytics Data** - PostHog events, Stripe transactions, etc.

### Quick Verification (5 minutes):
```bash
npm run verify:task -- \
  --task-id=P0-001 \
  --feature-url=/calculator \
  --title="Fix calculator bug"
```

This auto-captures: screenshots, deployment status, build results, test results, Lighthouse audit.

### Manual Checklist:
- [ ] Code pushed to GitHub
- [ ] Production URL returns HTTP 200
- [ ] Screenshots saved to `docs/screenshots/`
- [ ] Build passes (0 errors)
- [ ] Tests pass (100%)
- [ ] Verification report in `docs/verification-reports/`
- [ ] Commit includes "+ VERIFICATION"

**Full Policy**: `docs/TASK_COMPLETION_POLICY.md`
**Quick Reference**: `docs/TASK_COMPLETION_QUICK_REFERENCE.md`

---

## DEPLOYMENT WORKFLOW [CRITICAL - FOLLOW EXACTLY]

**⚠️ CRITICAL: Pushing to GitHub = Deploying to Production**

**GitHub `main` branch is connected to Vercel production. Every push automatically deploys within 2-5 minutes.**

### Required Workflow:
1. **Write code** - Make your changes
2. **Verify build** - Run `npm run build` to ensure ZERO errors
3. **Fix errors** - Address any build failures before proceeding
4. **Commit** - `git add` and `git commit` your changes
5. **✅ PUSH TO GITHUB** - `git push origin main` ← **THIS DEPLOYS TO PRODUCTION**
6. **Verify deployment** - Check https://vercel.com/caffeineGMT/taxbridge/deployments

### Strict Rules:
- ✅ **ALWAYS push to GitHub** after committing (required for deployment)
- ✅ DO run `npm run build` to verify no errors before committing
- ✅ DO verify Vercel deployment succeeds after pushing
- ❌ NEVER run `vercel`, `vercel deploy`, or any Vercel CLI commands
- ❌ NEVER skip the push step (code not pushed = NOT deployed)
- ❌ NEVER skip the build verification step

**IMPORTANT**: "Code committed locally" ≠ "Code deployed". You MUST push to GitHub for code to reach production.

### Why This Matters

**Before March 19, 2026**: Engineers committed code but didn't push → Same bugs "fixed" 6 times → 12 hours wasted.

**Deployment Flow**:
```
Local Commit → git push → GitHub → Vercel Auto-Deploy → Production (2-5 min)
              ^^^^^^^^
         REQUIRED STEP - Don't skip this!
```

If you mark a task "DONE" without pushing to GitHub, the code is NOT in production and the task is NOT actually complete.

---

## BUILD QUALITY GATE [AUTOMATIC ENFORCEMENT]

**Pre-commit hook automatically enforces build quality.**

### How It Works:
Every time you attempt to commit, a pre-commit hook automatically runs:
```bash
npm run build
```

If the build fails with ANY errors, **your commit will be blocked**.

### What This Prevents:
- ❌ Committing code with TypeScript errors
- ❌ Committing code with ESLint errors
- ❌ Committing code that breaks the Next.js build
- ❌ Pushing broken code to GitHub
- ❌ Recurring build issues across sprints

### What You'll See:
When you commit, you'll see:
```
🔨 Running build verification before commit...
⚠️  This is a build quality gate - your commit will be blocked if build fails.

> npm run build
[Build output...]

✅ Build passed - proceeding with commit
```

If build fails:
```
❌ BUILD FAILED - Commit blocked!

Fix the build errors above before committing.
This enforcement is required per CLAUDE.md - see 'BUILD QUALITY GATE' section.
```

### Bypassing (NOT RECOMMENDED):
If you absolutely must bypass the check (emergency hotfix only):
```bash
git commit --no-verify -m "message"
```

**WARNING**: Only use `--no-verify` in emergencies. Bypassing the gate defeats its purpose.

### Implementation Details:
- Hook location: `.husky/pre-commit`
- Managed by: [husky](https://typicode.github.io/husky/)
- Installed automatically via `npm install` (prepare script)
- Exit code: Build must return 0 (success) or commit is rejected
