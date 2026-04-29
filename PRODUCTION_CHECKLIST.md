# Production Deployment Checklist

This checklist covers all critical items that must be addressed before deploying Automation Factory to production.

## ✅ Completed (Implemented in this refactor)

### Security
- [x] Remove hardcoded credentials from codebase
- [x] Add `.env.local` to `.gitignore`
- [x] Implement environment variable validation with Zod
- [x] Add input validation for all API endpoints
- [x] Implement centralized error handling
- [x] Add security warnings for VM sandbox limitations
- [x] Validate and sanitize generated code before execution
- [x] Add rate limiting for console.log in sandbox

### Configuration
- [x] Create comprehensive `.env.example` file
- [x] Validate all environment variables at startup
- [x] Use validated config throughout application
- [x] Add proper database connection pool configuration
- [x] Enable SSL/TLS for database connections (configurable)
- [x] Add keep-alive for database connections

### Error Handling
- [x] Implement structured logging with levels
- [x] Add centralized error handler middleware
- [x] Wrap all async routes with error handler
- [x] Add graceful shutdown handlers (SIGTERM/SIGINT)
- [x] Close database pool on shutdown
- [x] Handle uncaught exceptions and unhandled rejections

### Code Quality
- [x] Remove hardcoded fallback values
- [x] Add JSDoc comments for key functions
- [x] Implement proper error messages with context
- [x] Add request logging middleware
- [x] Validate UUID parameters

## 🔄 TODO (Critical for Production)

### Security - High Priority
- [ ] **Replace VM sandbox with isolated-vm or Docker containers**
  - Current VM module is NOT a security boundary
  - See: https://nodejs.org/api/vm.html#vm-executing-javascript
  - Recommended: Use `isolated-vm` npm package or containerization

- [ ] **Implement secrets management**
  - Use HashiCorp Vault, AWS Secrets Manager, or similar
  - Never pass secrets directly to worker threads
  - Rotate secrets regularly

- [ ] **Add rate limiting**
  - Install `express-rate-limit` package
  - Limit API requests per IP/user
  - Prevent DoS attacks

- [ ] **Add authentication and authorization**
  - Implement JWT or session-based auth
  - Protect all mutation endpoints
  - Add role-based access control (RBAC)

- [ ] **Add CSRF protection**
  - Use `csurf` middleware
  - Or use token-based API design

- [ ] **Add security headers**
  - Install `helmet` middleware
  - Configure CSP, HSTS, X-Frame-Options, etc.

- [ ] **Implement API key authentication for tool integrations**
  - Don't store API keys in database plaintext
  - Use encryption at rest

### Database - High Priority
- [ ] **Implement database migrations**
  - Use `node-pg-migrate`, `db-migrate`, or Prisma
  - Version control schema changes
  - Add rollback capability

- [ ] **Add database indexes**
  - Index foreign keys
  - Index frequently queried columns
  - Monitor slow queries

- [ ] **Implement connection retry logic**
  - Exponential backoff for failed connections
  - Circuit breaker pattern

- [ ] **Add database backups**
  - Automated daily backups
  - Test restore procedures
  - Store backups off-site

### Monitoring & Observability - High Priority
- [ ] **Add application monitoring**
  - Use Prometheus, DataDog, or New Relic
  - Track request latency, error rates, throughput

- [ ] **Add error tracking**
  - Use Sentry, Rollbar, or similar
  - Capture stack traces and context

- [ ] **Add structured logging**
  - Use Winston or Pino for production
  - Log to files or external service
  - Add correlation IDs for request tracing

- [ ] **Add health check endpoints**
  - Deep health checks (database, Redis, LLM)
  - Readiness and liveness probes for Kubernetes

### Testing - High Priority
- [ ] **Add unit tests**
  - Test all service functions
  - Test validation schemas
  - Test error handling

- [ ] **Add integration tests**
  - Test API endpoints
  - Test database operations
  - Test WebSocket connections

- [ ] **Add end-to-end tests**
  - Test complete user flows
  - Test automation creation and execution

- [ ] **Add load testing**
  - Use k6, Artillery, or JMeter
  - Test under expected production load
  - Identify bottlenecks

### Performance - Medium Priority
- [ ] **Add caching**
  - Cache frequently accessed data
  - Use Redis for session storage
  - Implement cache invalidation strategy

- [ ] **Optimize database queries**
  - Add EXPLAIN ANALYZE for slow queries
  - Implement pagination for list endpoints
  - Use database connection pooling (already done)

- [ ] **Add request compression**
  - Use `compression` middleware
  - Compress responses > 1KB

- [ ] **Optimize bundle size**
  - Code splitting in Next.js
  - Tree shaking
  - Lazy loading components

### Infrastructure - Medium Priority
- [ ] **Containerize application**
  - Create Dockerfile for backend
  - Create Dockerfile for frontend
  - Use multi-stage builds

- [ ] **Set up CI/CD pipeline**
  - Automated testing on PR
  - Automated deployment to staging
  - Manual approval for production

- [ ] **Configure reverse proxy**
  - Use Nginx or Traefik
  - SSL/TLS termination
  - Load balancing

- [ ] **Set up monitoring and alerting**
  - Alert on high error rates
  - Alert on high latency
  - Alert on resource exhaustion

### Documentation - Medium Priority
- [ ] **API documentation**
  - Use Swagger/OpenAPI
  - Document all endpoints
  - Include example requests/responses

- [ ] **Deployment documentation**
  - Step-by-step deployment guide
  - Environment setup instructions
  - Troubleshooting guide

- [ ] **Architecture documentation**
  - System architecture diagram
  - Data flow diagrams
  - Security architecture

### Compliance - Low Priority (depends on use case)
- [ ] **GDPR compliance** (if handling EU user data)
  - Data retention policies
  - Right to deletion
  - Data export functionality

- [ ] **SOC 2 compliance** (if enterprise customers)
  - Access controls
  - Audit logging
  - Incident response plan

- [ ] **HIPAA compliance** (if handling health data)
  - Encryption at rest and in transit
  - Access controls
  - Audit trails

## Installation Commands

After completing the refactor, run:

```bash
# Install new dependencies
npm install

# Initialize database (if not already done)
node server/db/init.js

# Start development servers
npm run dev          # Frontend (terminal 1)
npm run server       # Backend (terminal 2)
```

## Environment Setup

1. Copy `.env.example` to `.env.local`
2. Fill in all required values
3. Ensure PostgreSQL is running
4. Ensure Redis is running
5. Ensure Ollama is running with Gemma 4 model

## Deployment Steps

1. Set all environment variables in production environment
2. Run database migrations
3. Build Next.js application: `npm run build`
4. Start backend server: `npm run server`
5. Start frontend server: `npm start`
6. Configure reverse proxy (Nginx/Traefik)
7. Set up SSL/TLS certificates
8. Configure monitoring and alerting
9. Set up automated backups
10. Test all critical flows

## Security Audit

Before going live, conduct a security audit:

1. Run `npm audit` and fix all vulnerabilities
2. Review all environment variables
3. Test authentication and authorization
4. Test rate limiting
5. Test input validation
6. Review generated code for security issues
7. Test sandbox escape attempts
8. Review database permissions
9. Test CORS configuration
10. Review error messages (don't leak sensitive info)

## Performance Baseline

Establish performance baselines:

1. Measure average response time for each endpoint
2. Measure database query performance
3. Measure LLM response time
4. Measure automation execution time
5. Measure WebSocket latency
6. Set up alerts for degradation

## Rollback Plan

Have a rollback plan ready:

1. Keep previous version deployed
2. Database migration rollback scripts
3. Feature flags for new features
4. Blue-green deployment strategy
5. Automated rollback on health check failure

---

**Last Updated:** 2026-04-17

**Status:** Phase 1 Complete - Critical security and reliability fixes implemented. See TODO section for remaining production requirements.
