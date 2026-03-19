# Task Completion Quick Reference

**NO TASK CAN BE MARKED "DONE" WITHOUT EVIDENCE**

## The Rule

Every P0/P1 task completion REQUIRES one of:
1. ✅ Screenshot file path
2. ✅ Log file path  
3. ✅ Video recording URL
4. ✅ Deployed feature URL (HTTP 200)
5. ✅ Analytics data export

## Quick Commands

### Full Auto-Verification (Recommended)
\`\`\`bash
npm run verify:task -- \\
  --task-id=P0-001 \\
  --title="Feature name" \\
  --feature-url=/calculator \\
  --run-build \\
  --run-tests \\
  --lighthouse \\
  --auto-screenshot=https://taxbridge.vercel.app/calculator
\`\`\`
**Time:** ~5 minutes  
**Captures:** Screenshot, build log, test results, Lighthouse audit, HTTP 200 check

### Minimal Verification
\`\`\`bash
npm run verify:task -- \\
  --task-id=P0-001 \\
  --title="Feature name" \\
  --feature-url=/calculator
\`\`\`
**Time:** ~30 seconds  
**Captures:** HTTP 200 verification only

### With Screenshot
\`\`\`bash
npm run verify:task -- \\
  --task-id=P0-001 \\
  --title="Feature name" \\
  --screenshot=docs/screenshots/fix.png \\
  --feature-url=/calculator
\`\`\`

### With Logs
\`\`\`bash
npm run verify:task -- \\
  --task-id=P0-001 \\
  --title="Feature name" \\
  --log=logs/deployment.log
\`\`\`

## Workflow

1. **Build & Deploy**
   \`\`\`bash
   git add -A
   git commit -m "WIP: Feature"
   git push origin main  # ← Deploys to production (2-5 min)
   \`\`\`

2. **Wait for Deployment**
   - Check https://vercel.com/caffeineGMT/taxbridge/deployments
   - Wait for "Ready" status

3. **Verify Evidence**
   \`\`\`bash
   npm run verify:task -- --task-id=P0-001 --title="..." --feature-url=/page
   \`\`\`

4. **Commit with Evidence**
   \`\`\`bash
   git add docs/evidence/
   git commit -m "[P0-001] Feature + VERIFICATION
   
   Evidence: docs/evidence/P0-001-*.json
   "
   git push origin main
   \`\`\`

## What Happens

### ✅ Valid Commit
\`\`\`
[P0-001] Fix bug + VERIFICATION

Evidence: docs/evidence/P0-001-*.json
\`\`\`
→ Hook passes, commit succeeds

### ❌ Blocked Commit
\`\`\`
[P0-001] Fix bug - DONE
\`\`\`
→ Hook blocks: "DONE" without evidence reference

### ⚠️ Warning
\`\`\`
[P0-001] Fix bug + VERIFICATION

Evidence: <none found>
\`\`\`
→ Hook blocks: Claims evidence but no files exist

## Pre-Commit Hook

Location: \`.husky/commit-msg\`

**Triggers when commit message contains:**
- DONE
- COMPLETE
- FINISHED
- ✅ TASK COMPLETE

**Blocks commit if:**
1. No evidence reference in message
2. No recent evidence files found (last 24h)

**Bypass (Emergency Only):**
\`\`\`bash
git commit --no-verify -m "Message"
\`\`\`

## Evidence Types

| Type | Example | Validation |
|------|---------|------------|
| Screenshot | \`docs/screenshots/fix.png\` | File exists, non-empty |
| Log | \`logs/build.log\` | File exists, non-empty |
| Video | \`https://loom.com/share/abc\` | URL returns video/* content-type |
| Deployed URL | \`/calculator\` | HTTP 200 response |
| Analytics | \`docs/lighthouse/audit.json\` | File exists, valid JSON |

## Common Scenarios

### Bug Fix
\`\`\`bash
npm run verify:task -- \\
  --task-id=P0-001 \\
  --title="Fix calculator NaN bug" \\
  --feature-url=/calculator \\
  --auto-screenshot=https://taxbridge.vercel.app/calculator \\
  --run-tests
\`\`\`

### New Feature
\`\`\`bash
npm run verify:task -- \\
  --task-id=P1-005 \\
  --title="Add email drip campaign" \\
  --feature-url=/admin/campaigns \\
  --screenshot=docs/screenshots/campaigns.png \\
  --run-build
\`\`\`

### Infrastructure Change
\`\`\`bash
npm run verify:task -- \\
  --task-id=P0-002 \\
  --title="Activate Stripe production" \\
  --screenshot=docs/screenshots/stripe-live.png \\
  --log=logs/payment-test.log \\
  --feature-url=/pricing
\`\`\`

### Backend API
\`\`\`bash
npm run verify:task -- \\
  --task-id=P1-010 \\
  --title="Add RSU calculation API" \\
  --log=logs/api-test.log \\
  --run-tests
\`\`\`

## Output Files

After running \`verify:task\`:
- \`docs/evidence/P0-001-*.json\` - Evidence metadata
- \`docs/evidence/P0-001-*.md\` - Human-readable report
- \`docs/screenshots/\` - Screenshot images (if captured)
- \`logs/verification/\` - Build/test logs (if run)
- \`docs/lighthouse/\` - Lighthouse audits (if run)

## Troubleshooting

### "No evidence file found"
1. Check you ran \`verify:task\`
2. Check \`docs/evidence/\` directory exists
3. Check file was created in last 24 hours

### "URL returned 404"
1. Wait for Vercel deployment (2-5 min)
2. Check deployment status in Vercel dashboard
3. Verify URL is correct

### "Screenshot capture failed"
1. Install Playwright: \`npm install\`
2. Check URL is accessible
3. Try manual screenshot instead

### "Build verification failed"
1. Fix build errors first
2. Run \`npm run build\` to verify
3. Don't use \`--run-build\` flag until build passes

## FAQ

**Q: Do I need evidence for ALL tasks?**  
A: P0/P1 = Required. P2 = Recommended. P3 = Optional.

**Q: Can I add evidence later?**  
A: No. Evidence MUST be attached BEFORE marking task "done".

**Q: What if feature isn't deployed yet?**  
A: Mark task as "blocked" or provide staging/local evidence.

**Q: This seems like extra work?**  
A: 5 minutes now vs 12 hours re-fixing same bug 6 times.

**Q: Can I bypass the hook?**  
A: Emergency only. Use \`--no-verify\` but requires CTO approval for P0/P1.

## Examples

See full examples in \`TASK_COMPLETION_POLICY.md\`

## Contact

Questions? See:
- Full policy: \`docs/TASK_COMPLETION_POLICY.md\`
- Code: \`lib/task-evidence.ts\`
- CLI: \`scripts/verify-task.ts\`
- Hook: \`.husky/commit-msg\`

---

**Remember: NO EVIDENCE = NOT DONE**
