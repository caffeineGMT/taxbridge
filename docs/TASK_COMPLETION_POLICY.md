# Task Completion Policy

**MANDATORY - NO EXCEPTIONS**

## The Problem This Solves

For 8+ sprints (March 19, 2026), critical tasks were marked "DONE" but:
- Same bugs recurred in next sprint
- No evidence work was actually completed
- 12+ hours wasted re-fixing same issues
- Zero revenue despite "payment system complete" claims

**Root Cause:** Tasks marked "done" based on code commits alone, without verifying production deployment or actual functionality.

## The Policy

**NO TASK CAN BE MARKED "DONE" WITHOUT EVIDENCE.**

### Evidence Requirements

Every completed task MUST provide **ONE OR MORE** of the following:

1. **Screenshots** (Desktop + Mobile)
   - Full-page screenshots showing feature working
   - Before/after comparisons for bug fixes
   - Minimum: Desktop view of working feature

2. **Video Recording** (Max 2 minutes)
   - Loom, CloudApp, or similar
   - Shows feature working end-to-end
   - Optional but highly recommended for complex features

3. **Logs/Terminal Output**
   - Build logs showing 0 errors
   - Test results showing 100% pass
   - Deployment logs showing successful deploy

4. **Deployed Feature URL** (with HTTP 200 verification)
   - Production URL that returns HTTP 200
   - URL must be publicly accessible (or staging)
   - Automated verification via \`verify-task\` script

5. **Analytics Data**
   - PostHog event showing feature usage
   - Stripe transaction screenshot
   - Google Analytics showing page views
   - Lighthouse audit results

### Minimum Viable Evidence

At absolute minimum, provide:
- **ONE screenshot** showing feature working in production, OR
- **ONE deployed URL** that returns HTTP 200

## Quick Start (5 Minutes)

Use the automated verification script:

\`\`\`bash
npm run verify:task -- \\
  --task-id=P0-001 \\
  --feature-url=/calculator \\
  --title="Fix calculator bug"
\`\`\`

This automatically:
1. Captures screenshot
2. Verifies URL returns HTTP 200
3. Runs build
4. Runs tests
5. Generates Lighthouse audit
6. Saves all evidence to \`docs/evidence/\`
7. Creates verification report

## Why This Matters

### Before This Policy (Sprints 1-15)
- Task: "Stripe production mode activated" ✅ DONE
- Reality: Still using \`sk_test_*\` keys
- Impact: $0 revenue for 8 sprints
- Time wasted: 12+ hours re-fixing

### After This Policy
- Task: "Stripe production mode activated" + Evidence required
- Evidence: Screenshot of live transaction + Stripe dashboard
- Verification: URL returns HTTP 200, payment test successful
- Impact: Revenue pipeline actually works
- Time saved: No more fake completions

## Evidence Storage

All evidence is stored in:
\`\`\`
docs/
├── evidence/
│   ├── P0-001-1234567890.json    # Evidence metadata
│   ├── P0-001-1234567890.md      # Human-readable report
├── screenshots/
│   ├── checkout-fixed.png
├── lighthouse/
│   ├── audit-1234567890.json
logs/
└── verification/
    ├── build-1234567890.log
    ├── tests-1234567890.log
\`\`\`

## Pre-Commit Hook

The \`.husky/commit-msg\` hook automatically enforces this policy:

**Triggers:**
- Commit message contains: \`DONE\`, \`COMPLETE\`, \`FINISHED\`, \`✅ TASK COMPLETE\`

**Checks:**
1. Does message reference evidence?
2. Do evidence files exist?
3. Were they created recently (last 24 hours)?

**If checks fail:**
- Commit is **BLOCKED**
- You must run \`verify-task\` first
- Or use \`--no-verify\` (NOT RECOMMENDED)

## Enforcement Level

| Priority | Enforcement | Bypass Allowed? |
|----------|-------------|-----------------|
| P0-CRITICAL | **STRICT** - Pre-commit hook blocks | Emergency only |
| P1-HIGH | **STRICT** - Pre-commit hook blocks | Emergency only |
| P2-MEDIUM | **RECOMMENDED** - Hook warns | Yes, with reason |
| P3-LOW | **OPTIONAL** - No enforcement | Yes |

**This policy is mandatory for all P0 and P1 tasks. No exceptions.**
