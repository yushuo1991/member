# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**宇硕会员体系 (Yushuo Membership System)** - A comprehensive SaaS platform for trading education and analysis tools, built as a Turborepo monorepo with 4 Next.js applications and shared packages.

**Tech Stack**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, MySQL, Turborepo, pnpm workspaces

## Monorepo Structure

### Applications (apps/)

| App | Port | Description | Database |
|-----|------|-------------|----------|
| **web** | 3000 | Member management system (会员管理系统) | member_system |
| **bk** | 3001 | Stock sector rhythm system (板块节奏系统) | bk_system |
| **fuplan** | 3002 | Trading review system (复盘系统) | fuplan_system |
| **xinli** | 3003 | Psychology assessment system (心理测评系统) | xinli_system |

### Shared Packages (packages/)

- **@repo/ui** - Shared UI components
- **@repo/auth** - Authentication logic (JWT, bcrypt)
- **@repo/database** - MySQL connection pool with graceful shutdown
- **@repo/utils** - Utility functions (validation, logging, shutdown, rate limiting)
- **@repo/config** - Configuration management

## Development Commands

### Installation
```bash
# Install all dependencies
pnpm install

# Install for specific app
pnpm install --filter web
```

### Development
```bash
# Start all apps in parallel
pnpm dev:all

# Start individual apps
pnpm dev:web      # http://localhost:3000
pnpm dev:bk       # http://localhost:3001
pnpm dev:fuplan   # http://localhost:3002
pnpm dev:xinli    # http://localhost:3003

# Start with Turbo (with caching)
pnpm dev
```

### Building
```bash
# Build all apps
pnpm build

# Build specific app
pnpm build:web
pnpm build:bk
pnpm build:fuplan
pnpm build:xinli

# Force rebuild (ignore cache)
pnpm turbo run build --force
```

### Code Quality
```bash
# Lint all apps
pnpm lint

# Type check all apps
pnpm type-check

# Lint specific app
pnpm turbo run lint --filter=web
```

### Testing
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Generate coverage report
pnpm test:coverage

# Run tests for specific package
pnpm test --filter @repo/auth
```

### Cleanup
```bash
# Clean build artifacts (keep node_modules)
pnpm clean

# Clean everything including node_modules
pnpm clean:all

# Clean Turbo cache
rm -rf .turbo apps/*/.turbo
```

## Database Setup

### Initialize Database
```bash
# Run the database initialization script
mysql -u root -p < database-init-v2.1-FIXED.sql
```

### Key Tables
- **users** - User accounts
- **memberships** - Membership tiers and expiry
- **activation_codes** - Activation code management
- **products** - Product catalog
- **product_contents** - Product detailed content (descriptions, features, pricing)
- **user_product_purchases** - User product purchase records
- **trial_logs** - Trial usage tracking
- **rate_limits** - API rate limiting
- **admins** - Admin accounts
- **login_logs** - Login audit trail
- **admin_audit_logs** - Admin action logs

### Database Optimization
```bash
# Apply database indexes for performance optimization
mysql -u root -p member_system < database-indexes.sql

# Analyze tables after adding indexes
mysql -u root -p member_system -e "ANALYZE TABLE users, memberships, activation_codes, trial_logs, login_logs;"
```

### Reset Trial Counts
```bash
# Reset trial counts for all users
mysql -u root -p member_system < reset-trials.sql

# Or use Node.js script
node reset-trial-counts.js
```

## Environment Configuration

Each app requires its own `.env` file. Copy from `.env.example`:

```bash
# apps/web/.env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=member_system

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_at_least_32_characters
JWT_EXPIRES_IN=7d

# Sentry Error Monitoring
SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
NEXT_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
SENTRY_ORG=your-organization-slug
SENTRY_PROJECT=web
SENTRY_AUTH_TOKEN=your-auth-token-here
SENTRY_RELEASE=web@1.0.0
NEXT_PUBLIC_SENTRY_RELEASE=web@1.0.0

# Application Configuration
NODE_ENV=development
APP_URL=http://localhost:3000
PORT=3000
LOG_LEVEL=info
```

Similar configuration needed for `apps/bk/.env`, `apps/fuplan/.env`, and `apps/xinli/.env` with their respective database names and ports.

## Architecture Patterns

### Authentication Flow
1. User login via `/api/auth/login` (web app)
2. JWT token generated using `@repo/auth` package
3. Token stored in httpOnly cookie
4. Middleware validates token on protected routes
5. User session managed via `@repo/auth/verifyToken`

### Database Connection
- Shared connection pool via `@repo/database`
- Each app connects to its own database
- Connection pooling configured in `packages/database/src/index.ts`
- Always use parameterized queries to prevent SQL injection

### Membership System
- **Tiers**: guest → monthly (月费) → quarterly (季度) → yearly (年费)
- **Activation codes**: Format `YS-{M|Q|Y|T|P}-XXXX`
  - `YS-M-XXXX` - Monthly (30 days)
  - `YS-Q-XXXX` - Quarterly (90 days)
  - `YS-Y-XXXX` - Yearly (365 days)
  - `YS-T-XXXX` - Emotion Table buyout (permanent)
  - `YS-P-XXXX` - Product-specific codes (陪伴营等)
- **Permission logic**: Located in `apps/web/src/lib/membership-levels.ts`
- **Trial system**: Rate-limited trials via `apps/web/src/lib/trial-service.ts`
- **Rate limiting**: IP-based rate limiting with database and memory fallback in `apps/web/src/lib/rate-limiter.ts`

### Products
- **情绪表 (Emotion Table)** - Trading psychology assessment tool
- **板块助手 (Sector Assistant)** - Stock sector analysis tool
- **陪伴营 (Companion Camp)** - Trading education and mentorship program

### API Routes Structure
```
apps/web/src/app/api/
├── auth/              # Authentication endpoints
├── activation/        # Activation code management
├── admin/            # Admin-only endpoints
│   ├── auth/         # Admin login/logout
│   ├── codes/        # Code generation
│   ├── members/      # Member management
│   ├── products/     # Product content management
│   └── dashboard/    # Statistics
├── products/         # Product information endpoints
│   └── content/      # Product content API
└── trial/            # Trial access endpoints
```

### Input Validation (Zod)
All API endpoints use Zod schemas for type-safe input validation:

```typescript
import { LoginSchema, validateRequest } from '@repo/utils';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const validation = validateRequest(LoginSchema, body);

  if (!validation.success) {
    return errorResponse(validation.error, 400);
  }

  const { username, password } = validation.data;
  // Process request...
}
```

Available schemas:
- `LoginSchema` - User login validation
- `RegisterSchema` - User registration validation
- `ActivationCodeSchema` - Activation code validation
- `MemberAdjustSchema` - Member adjustment validation
- `AdminLoginSchema` - Admin login validation
- `GenerateCodeSchema` - Code generation validation
- `UpdateUserStatusSchema` - User status update validation
- `ResetTrialsSchema` - Trial reset validation

## Deployment

### Production Deployment (PM2)
```bash
# Start all apps
pm2 start ecosystem.config.monorepo.js --env production

# Restart specific app
pm2 restart member-web
pm2 restart member-bk
pm2 restart member-fuplan
pm2 restart member-xinli

# View logs
pm2 logs member-web
pm2 logs member-bk --lines 100

# Monitor
pm2 monit
pm2 list
```

### Server Directory Structure
```
/www/wwwroot/
├── member-system/    # Web app (Port 3000)
├── bk-system/        # BK app (Port 3001)
├── fuplan-system/    # Fuplan app (Port 3002)
└── xinli-system/     # Xinli app (Port 3003)
```

### Nginx Configuration
- Config file: `nginx-monorepo.conf`
- Reverse proxy setup for all 4 apps
- Domain mapping: `member.example.com`, `bk.member.example.com`, etc.

### CI/CD (GitHub Actions)
- Workflow: `.github/workflows/deploy-monorepo.yml`
- Triggers on push to `main` branch
- Smart deployment: Only deploys changed apps
- Modifying `packages/**` triggers deployment of all apps

## Turborepo Configuration

### Task Pipeline (turbo.json)
- **build**: Depends on `^build` (builds dependencies first)
- **dev**: No cache, persistent
- **lint**: Cached
- **type-check**: Cached

### Cache Strategy
- Build outputs cached in `.turbo/` and `apps/*/.turbo/`
- Shared cache across team (if configured)
- Force rebuild: `pnpm turbo run build --force`

### Filtering
```bash
# Run task for specific app and its dependencies
pnpm turbo run build --filter=web...

# Run for multiple apps
pnpm turbo run build --filter=web --filter=bk
```

## Common Development Tasks

### Adding a New Shared Component
1. Create component in `packages/ui/src/`
2. Export from `packages/ui/src/index.ts`
3. Import in app: `import { Component } from '@repo/ui'`
4. Turborepo handles the dependency automatically

### Adding a New API Endpoint
1. Create route file in `apps/web/src/app/api/[route]/route.ts`
2. Use Next.js 14 App Router conventions
3. Import database from `@repo/database`
4. Add authentication middleware if needed
5. Test with `curl` or Postman

### Modifying Database Schema
1. Update SQL in `database-init-v2.1-FIXED.sql`
2. Create migration script if needed
3. Test locally first
4. Apply to production database carefully
5. Update TypeScript types in `apps/*/src/types/`

### Debugging Build Issues
```bash
# Check TypeScript errors
pnpm type-check

# Check for dependency issues
pnpm list --depth 0

# Clean and rebuild
pnpm clean:all
pnpm install
pnpm build
```

## Error Monitoring and Logging

### Sentry Integration
All apps are integrated with Sentry for real-time error tracking:

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  // Your code
} catch (error) {
  Sentry.captureException(error, {
    tags: { api_route: "/api/example" },
    extra: { userId: user.id }
  });
}
```

Features:
- Client-side error tracking (browser)
- Server-side error tracking (Node.js)
- Edge Runtime error tracking (middleware)
- Session Replay for debugging
- Performance monitoring
- Source maps upload

See `SENTRY-SETUP.md` for detailed configuration.

### Logging System
Unified logging with Winston:

```typescript
import { logger } from '@repo/utils';

logger.info('User logged in', { userId: user.id });
logger.warn('High memory usage', { memory: process.memoryUsage() });
logger.error('Database error', { error: err.message });
```

Log levels: `error`, `warn`, `info`, `debug`

### Graceful Shutdown
All apps implement graceful shutdown to clean up resources:

```typescript
import { initGracefulShutdown } from '@repo/utils';

initGracefulShutdown({
  databases: [
    { instance: memberDatabase, name: 'Member Database' }
  ]
});
```

Handles: `SIGTERM`, `SIGINT`, `uncaughtException`, `unhandledRejection`

## Security Considerations

- **Passwords**: Hashed with bcrypt (12 rounds)
- **JWT**: Signed tokens with expiry
- **SQL Injection**: Always use parameterized queries
- **Rate Limiting**: IP-based with database and memory fallback
  - Login: 100 attempts per 15 minutes
  - Register: 50 attempts per 30 minutes
  - Activate: 50 attempts per 15 minutes
- **Input Validation**: Zod schemas for all API inputs
- **Admin Routes**: Protected by admin role check
- **CORS**: Configured per app in `next.config.js`
- **Error Filtering**: Sensitive data removed from Sentry reports

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000
# Kill process
kill -9 <PID>
```

### Database Connection Failed
- Check `.env` file exists and has correct credentials
- Verify MySQL is running: `mysql -u root -p`
- Check database exists: `SHOW DATABASES;`
- Verify connection pool in `packages/database/src/index.ts`

### Workspace Dependency Issues
```bash
# Verify workspace links
pnpm list --depth 0

# Reinstall dependencies
pnpm clean:all
pnpm install
```

### PM2 Process Not Starting
```bash
# Check detailed logs
pm2 logs member-web --err --lines 200

# Check process status
pm2 describe member-web

# Restart PM2
pm2 kill
pm2 start ecosystem.config.monorepo.js --env production
```

## Important Files

### Configuration
- `turbo.json` - Turborepo task configuration
- `pnpm-workspace.yaml` - Workspace definition
- `ecosystem.config.monorepo.js` - PM2 process configuration
- `nginx-monorepo.conf` - Nginx reverse proxy config
- `jest.config.js` - Jest testing configuration
- `.env.example` - Environment variable template (in each app)

### Database
- `database-init-v2.1-FIXED.sql` - Database schema initialization
- `database-indexes.sql` - Performance optimization indexes
- `scripts/create-product-contents-table.sql` - Product contents table
- `reset-trials.sql` - Trial count reset script

### Documentation
- `CLAUDE.md` - This file (project guide for Claude Code)
- `OPTIMIZATION-SUMMARY.md` - Summary of all optimizations
- `DEPLOYMENT-CHECKLIST.md` - Deployment checklist
- `SENTRY-SETUP.md` - Sentry configuration guide
- `ZOD-VALIDATION-GUIDE.md` - Input validation guide
- `ZOD-VALIDATION-SUMMARY.md` - Validation implementation summary

### Shared Packages
- `packages/utils/src/validation-schemas.ts` - Zod validation schemas
- `packages/utils/src/shutdown.ts` - Graceful shutdown manager
- `packages/utils/src/logger.ts` - Winston logger configuration
- `packages/auth/src/password.test.ts` - Password hashing tests

## Commit Conventions

Use Conventional Commits format:
```bash
feat(web): add user login feature
fix(bk): correct stock data parsing
chore(packages): update dependencies
docs: update development guide
```

## Development Best Practices

### Input Validation
- Always use Zod schemas from `@repo/utils` for API input validation
- Never trust user input - validate everything
- Use `validateRequest()` for simple validation
- Use `safeValidateRequest()` for detailed error messages

### Error Handling
- Use Sentry for production error tracking
- Add context with `Sentry.setUser()`, `Sentry.setTag()`, `Sentry.addBreadcrumb()`
- Filter sensitive data in `beforeSend` hooks
- Use try-catch blocks for critical operations

### Database Operations
- Always use parameterized queries to prevent SQL injection
- Use connection pooling from `@repo/database`
- Implement graceful shutdown for database connections
- Apply indexes for frequently queried columns

### Rate Limiting
- Use `checkRateLimit()` before processing sensitive operations
- Call `recordAttempt()` after each attempt
- Reset limits with `resetRateLimit()` on successful operations
- Rate limiter automatically falls back to memory cache if database fails

### Testing
- Write unit tests for all utility functions
- Test edge cases and error conditions
- Use Jest for testing framework
- Aim for high code coverage on critical paths

### Logging
- Use Winston logger from `@repo/utils`
- Log important events (login, errors, admin actions)
- Use appropriate log levels (error, warn, info, debug)
- Include context in log messages (userId, IP, etc.)

## Notes for Claude Code

- This is a **monorepo** - always check which app you're working in
- Each app has its **own database** - don't mix them up
- Use **pnpm**, not npm or yarn
- **Turborepo caching** is enabled - use `--force` to bypass
- **Next.js 14 App Router** - use route handlers, not pages API
- **TypeScript strict mode** - type safety is enforced
- **Workspace dependencies** - use `workspace:*` in package.json
- **PM2 cluster mode** - web app runs in cluster, others in fork mode
- **Chinese comments** are common in this codebase - they're intentional
- **Zod validation** - all API inputs must be validated
- **Sentry monitoring** - errors are automatically tracked in production
- **Graceful shutdown** - all apps handle shutdown signals properly
- **Rate limiting** - protect sensitive endpoints with rate limits
- **Database indexes** - 30+ indexes optimize query performance
