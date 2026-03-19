# CLAUDE.md

## DEPLOYMENT WORKFLOW [CRITICAL - FOLLOW EXACTLY]

**GitHub is the STAGING environment. Manual deployment to production only.**

### Required Workflow:
1. **Write code** - Make your changes
2. **Verify build** - Run `npm run build` to ensure ZERO errors
3. **Fix errors** - Address any build failures before proceeding
4. **Commit** - `git add` and `git commit` your changes
5. **Push to GitHub** - `git push origin main`
6. **STOP** - Deployment to Vercel/production will be done manually by Michael

### Strict Rules:
- ✅ DO push all code to GitHub
- ✅ DO run `npm run build` to verify no errors before committing
- ❌ NEVER run `vercel`, `vercel deploy`, or any Vercel CLI commands
- ❌ NEVER auto-deploy to any hosting platform
- ❌ NEVER skip the build verification step

All production deployments are handled manually. Your job is to get working, error-free code onto GitHub.
