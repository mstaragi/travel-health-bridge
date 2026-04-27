# Deployment Checklist - Travel Health Bridge

## Pre-Deployment Review (Phase 2 Complete)

### ✅ Completed Features
- [x] Phase 1: Core foundation (triage, emergency, provider profile)
- [x] Phase 2: WatermelonDB offline caching with platform-specific persistence
- [x] Phase 2: Provider PWA with referrals, feedback, profile management
- [x] Phase 2: Performance optimizations (memoized ranking, 5-min cache)
- [x] Admin console scaffolding (providers, advisories, overcharges, sessions)

### Code Quality Checklist

#### TypeScript & Linting
- [ ] Run `npm run type-check` - verify zero type errors
- [ ] Run `npm run lint` - verify zero linting violations
- [ ] Run `npm run format` - auto-format code
- [ ] Check for console.log/debug statements in production code
- [ ] Verify all `any` types are documented with comments

#### Testing
- [ ] Run `npm run test` - all unit tests pass
- [ ] Run `npm run test:coverage` - coverage >80%
- [ ] Run `npm run test:e2e` - E2E tests pass
- [ ] Performance tests validate SLAs:
  - [ ] Triage submission: <1500ms
  - [ ] Provider toggle: <1000ms
  - [ ] Emergency response: <2000ms
  - [ ] Ranking cache hits: <10ms
- [ ] Security tests pass:
  - [ ] RBAC enforcement
  - [ ] Auth token validation
  - [ ] RLS policy validation

#### Code Review
- [ ] All 6 commits reviewed (commits: 3d40142→573c3b5)
- [ ] Performance utilities reviewed for correctness
- [ ] Test coverage reviewed for critical paths
- [ ] Documentation reviewed for clarity

### Dependency Audit

#### Check for Vulnerabilities
```bash
npm audit
npm audit fix  # if needed
```

#### Verify Compatible Versions
- [ ] React Native/Expo SDK 51.x
- [ ] Next.js 14.x
- [ ] TypeScript 5.x
- [ ] Supabase JS client latest
- [ ] WatermelonDB v0.26+
- [ ] PostHog Analytics latest

#### Update Lockfiles
```bash
npm install
```

### Environment Configuration

#### Consumer App (apps/consumer)
- [ ] `.env.production` configured:
  - [ ] EXPO_PUBLIC_SUPABASE_URL
  - [ ] EXPO_PUBLIC_SUPABASE_ANON_KEY
  - [ ] EXPO_PUBLIC_POSTHOG_API_KEY
  - [ ] EXPO_PUBLIC_API_URL
- [ ] App.json updated with version and build number
- [ ] EAS build config verified

#### Provider App (apps/provider)
- [ ] `.env.production` configured
- [ ] PWA manifest updated (name, icons, theme_color)
- [ ] Service worker configuration verified
- [ ] Next.js output: standalone

#### Admin Console (apps/admin)
- [ ] `.env.production` configured
- [ ] Service role key secured in secrets manager
- [ ] API routes use server-side validation only

#### Shared Package (packages/shared)
- [ ] All API endpoints point to production
- [ ] PostHog API key set for production
- [ ] Supabase project configured for production

### Database Verification

#### Supabase PostgreSQL
- [ ] Run production database migrations:
  ```sql
  -- Verify all tables exist
  SELECT tablename FROM pg_tables WHERE schemaname='public';
  ```
- [ ] Verify RLS policies enabled on all tables:
  - [ ] providers
  - [ ] feedback
  - [ ] triage_sessions
  - [ ] vault_data
  - [ ] cases
  - [ ] overcharge_reports
  - [ ] advisories
  - [ ] reviews

- [ ] Test RLS policies:
  ```sql
  -- As consumer: Should see only own data
  SET role consumer_user;
  SELECT * FROM vault_data WHERE user_id = 'current_user_id'; -- Should return data
  SELECT * FROM vault_data WHERE user_id != 'current_user_id'; -- Should return empty
  
  -- As provider: Should not see consumer data
  SET role provider_user;
  SELECT * FROM vault_data; -- Should return empty or error
  ```

- [ ] Indexes created for performance:
  - [ ] providers(city_id, status)
  - [ ] triage_sessions(provider_id, created_at)
  - [ ] feedback(provider_id, created_at)
  - [ ] vault_data(user_id, created_at)

#### WatermelonDB
- [ ] Test schema synchronization:
  ```typescript
  import database from '@app/db';
  console.log(database.collections.map(c => c.name));
  // Should output: emergency_cache, offline_providers, unsynced_events, vault_entries, visit_history
  ```

- [ ] Verify 24-hour cache expiry:
  - [ ] Deploy with test data
  - [ ] Check cache cleanup after 24 hours
  - [ ] Verify no memory leaks

### API Testing

#### Health Checks
- [ ] GET `/api/health` returns 200
- [ ] GET `/api/health` includes version info

#### Authentication
- [ ] Consumer login flow works
- [ ] Provider OTP verification works
- [ ] Admin authentication enforced
- [ ] Token refresh works on expiry

#### Provider Ranking
- [ ] POST `/api/triage/rank` returns valid ranking
- [ ] Performance monitored: <1500ms
- [ ] Cache working: 2nd call <10ms

#### Admin Operations
- [ ] Suspend provider flow completes successfully
- [ ] 7-day suspension window calculated correctly
- [ ] Auto-reactivation after 7 days (if implemented)

#### Analytics
- [ ] PostHog events firing correctly
- [ ] Event parameters validated
- [ ] No sensitive data in events

### Performance Validation

#### Bundle Size Check
```bash
npm run build
du -sh apps/consumer/.next/
du -sh apps/provider/.next/
du -sh apps/admin/.next/
```

Target sizes:
- [ ] Consumer bundle: <500KB
- [ ] Provider PWA: <300KB
- [ ] Admin console: <400KB

#### Load Testing
- [ ] Run load test with 100 concurrent triages
- [ ] Verify <2s response time at 95th percentile
- [ ] Monitor database connections not exceeded
- [ ] Memory usage stable under load

#### Cache Verification
- [ ] Ranking cache hit ratio >90% during usage
- [ ] WatermelonDB cache size <50MB
- [ ] LocalStorage usage <10MB

### Security Audit

#### Authentication & Authorization
- [ ] JWT tokens expire correctly
- [ ] Refresh tokens validated
- [ ] RLS policies prevent unauthorized data access
- [ ] Admin endpoints require service role
- [ ] API keys never exposed in client code

#### Data Protection
- [ ] Sensitive data encrypted at rest
- [ ] SecureStore used for auth tokens
- [ ] HTTPS enforced (no HTTP)
- [ ] CORS headers configured correctly

#### Secrets Management
- [ ] Database credentials in secure vault
- [ ] API keys not in version control
- [ ] Env vars validated on startup
- [ ] No secrets in error messages

#### API Security
- [ ] Rate limiting configured
- [ ] SQL injection prevention verified
- [ ] XSS prevention in place
- [ ] CSRF tokens validated for forms

### Monitoring & Observability

#### Logging Setup
- [ ] Production logging configured
- [ ] Error tracking (Sentry/similar) enabled
- [ ] Logs include: timestamp, level, service, message
- [ ] Sensitive data not logged (passwords, tokens)

#### Analytics Setup
- [ ] PostHog events verified
- [ ] 28 events tracking working (see ANALYTICS.md)
- [ ] Performance metrics collected
- [ ] User cohorts configured

#### Error Tracking
- [ ] Sentry project configured
- [ ] Error sampling rate: 10%
- [ ] Performance monitoring: 1% sample
- [ ] Alerts configured for critical errors

#### Database Monitoring
- [ ] Query performance logs enabled
- [ ] Slow query threshold: 1000ms
- [ ] Connection pool monitoring
- [ ] Backup verification

### Deployment Infrastructure

#### Hosting
- [ ] Consumer app (Expo):
  - [ ] EAS submit configured
  - [ ] App Store build number incremented
  - [ ] Google Play build number incremented
  - [ ] Release notes prepared
  
- [ ] Provider PWA (Vercel):
  - [ ] Deployment configuration verified
  - [ ] Custom domain configured
  - [ ] SSL certificates valid
  - [ ] CDN caching headers set
  
- [ ] Admin Console (Vercel/Similar):
  - [ ] Deployment configuration verified
  - [ ] IP whitelist enforced (if needed)
  - [ ] Rate limiting configured

#### CI/CD Pipeline
- [ ] GitHub Actions workflows trigger on push
- [ ] Build succeeds without errors
- [ ] Tests run automatically
- [ ] Deployment approval required for prod
- [ ] Rollback plan documented

### Post-Deployment Monitoring

#### First 24 Hours
- [ ] Monitor error rate (<1%)
- [ ] Check P95 response times (<2s)
- [ ] Verify cache hit rates (>90%)
- [ ] Monitor database performance
- [ ] Check for security alerts

#### Weekly Checks
- [ ] Review analytics trends
- [ ] Check infrastructure costs
- [ ] Monitor user feedback/crash reports
- [ ] Verify backup integrity
- [ ] Run security scans

#### Monthly Reviews
- [ ] Database optimization (ANALYZE)
- [ ] Index effectiveness review
- [ ] Cost analysis and optimization
- [ ] Performance regression analysis
- [ ] Security audit review

### Documentation

#### User Documentation
- [ ] Consumer app guide (triage, vault, feedback)
- [ ] Provider app guide (availability, referrals, profile)
- [ ] Admin console guide (provider management, moderation)
- [ ] Troubleshooting guide (common issues)

#### Developer Documentation
- [ ] API documentation (OpenAPI/Swagger)
- [ ] Setup instructions (local development)
- [ ] Deployment guide (step-by-step)
- [ ] Performance tuning guide
- [ ] Contributing guidelines

#### Operations Documentation
- [ ] Incident response playbook
- [ ] Rollback procedures
- [ ] Database recovery procedures
- [ ] Scaling procedures
- [ ] Maintenance windows schedule

### Backup & Disaster Recovery

#### Database
- [ ] Automated daily backups enabled
- [ ] Point-in-time recovery configured
- [ ] Backup test restore verified monthly
- [ ] Backup retention: 30 days

#### Application
- [ ] Git commits tagged for release
- [ ] Release artifacts archived
- [ ] Deployment rollback tested
- [ ] Blue-green deployment ready

### Communication Plan

#### Pre-Launch
- [ ] Stakeholder briefing completed
- [ ] Release notes drafted
- [ ] Team training scheduled
- [ ] Support team prepared

#### Launch Day
- [ ] Deployment window scheduled
- [ ] On-call team notified
- [ ] Monitoring dashboards active
- [ ] Communication channels open

#### Post-Launch
- [ ] Status update communicated
- [ ] Known issues documented
- [ ] Follow-up meeting scheduled
- [ ] Postmortem if issues occurred

## Sign-Off

### Technical Lead
- [ ] Code review completed
- [ ] Performance targets met
- [ ] Security audit passed
- [ ] [ ] Signed off: _________________ Date: _______

### QA Lead
- [ ] Test coverage adequate
- [ ] Critical path tested
- [ ] Performance tested
- [ ] [ ] Signed off: _________________ Date: _______

### Product Manager
- [ ] Requirements met
- [ ] User experience verified
- [ ] Documentation complete
- [ ] [ ] Signed off: _________________ Date: _______

### Operations
- [ ] Infrastructure ready
- [ ] Monitoring configured
- [ ] Rollback plan ready
- [ ] [ ] Signed off: _________________ Date: _______

## Deployment Instructions

```bash
# 1. Verify all checklist items completed
# 2. Tag release
git tag -a v2.0.0 -m "Phase 2 complete: Performance optimizations and provider PWA"

# 3. Build and test
npm run build
npm run test:e2e

# 4. Deploy each service
# Consumer: EAS submit
eas submit --platform ios
eas submit --platform android

# Provider: Vercel deploy
vercel deploy --prod

# Admin: Vercel deploy
vercel deploy --prod --cwd apps/admin

# 5. Verify production
curl https://api.travelhealthbridge.com/health
curl https://provider.travelhealthbridge.com/health

# 6. Monitor
./scripts/monitor-deployment.sh

# 7. Communicate
./scripts/send-notification.sh "Travel Health Bridge v2.0.0 deployed successfully"
```

## Rollback Procedure (If Needed)

```bash
# 1. Identify issue and severity
# 2. Notify stakeholders
# 3. Redeploy previous version
git checkout v1.9.0

# 4. Re-run tests
npm run test:e2e

# 5. Deploy previous version
vercel rollback

# 6. Verify rollback successful
curl https://api.travelhealthbridge.com/health

# 7. Incident postmortem
# Schedule within 24 hours
```

---

**Deployment Status**: [ ] Ready for Production
**Last Updated**: [Date]
**Prepared By**: [Name]
