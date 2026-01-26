# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **membership SaaS ecosystem** for stock trading education (宇硕短线). This is a **pnpm Monorepo** with 4 Next.js applications and shared packages.

**Stack:** Next.js 14 (App Router), TypeScript, React 18, MySQL 8.0, Tailwind CSS, JWT authentication, Turborepo

## Repository Structure

```
├── apps/
│   ├── web/          # Main membership site (port 3000) - yushuofupan.com
│   ├── bk/           # Stock tracker system (port 3001) - bk.yushuofupan.com
│   ├── fuplan/       # Review system (port 3002) - fupan.yushuofupan.com (静态HTML)
│   └── xinli/        # Psychology assessment (port 3003) - xinli.yushuofupan.com
├── packages/
│   ├── auth/         # JWT authentication, password hashing, cookies
│   ├── database/     # MySQL connection pool, shared database utilities
│   ├── ui/           # Shared React components
│   └── utils/        # Common utilities
├── turbo.json        # Turborepo configuration
├── pnpm-workspace.yaml
└── ecosystem.config.monorepo.js  # PM2 configuration for all apps
```

## Common Commands

```bash
# Install all dependencies
pnpm install

# Development (all apps)
pnpm dev

# Development (single app)
pnpm dev --filter=web
pnpm dev --filter=bk

# Build all apps
pnpm build

# Build single app
pnpm build --filter=web
pnpm build --filter=bk

# Type check
pnpm type-check

# Lint
pnpm lint
```

## Deployment

**Server:** 8.153.110.212
**Path:** /www/wwwroot/member-monorepo

```bash
# Build locally and deploy
pnpm build --filter=<app>
tar -czf <app>-update.tar.gz apps/<app>/.next
scp <app>-update.tar.gz root@8.153.110.212:/tmp/
ssh root@8.153.110.212 'cd /www/wwwroot/member-monorepo && pm2 stop member-<app> && rm -rf apps/<app>/.next && tar -xzf /tmp/<app>-update.tar.gz && pm2 start member-<app>'

# PM2 commands on server
pm2 list
pm2 logs member-web
pm2 restart member-bk
```

## Architecture

### Authentication (packages/auth)

- JWT tokens with httpOnly cookies
- `COOKIE_DOMAIN=.yushuofupan.com` for cross-subdomain sharing
- `SameSite=Lax` to allow subdomain navigation
- Functions: `verifyUserToken()`, `createAuthCookie()`, `hashPassword()`, `verifyPassword()`

### Database (packages/database)

- MySQL connection pool singleton: `MemberDatabase.getInstance()`
- BK app has separate `StockDatabase` class for stock data
- Tables: `users`, `memberships`, `activation_codes`, `user_products`, `user_product_trials`

### Membership Levels (apps/web/src/lib/membership-levels.ts)

| Level | Price | Duration | Access |
|-------|-------|----------|--------|
| none | Free | - | 5 trials per product |
| monthly | ¥300 | 30 days | 学习圈, 板块助手 |
| quarterly | ¥799 | 90 days | + BK板块节奏系统 |
| yearly | ¥2999 | 365 days | + 心理测评系统 |
| lifetime | 陪伴营 | Forever | + 复盘系统 |

### Product Access Control

- Gate API: `/api/gate/[slug]` - Nginx auth_request checks this before serving protected content
- `canAccessProductByMembership(userLevel, productSlug, expiry)` - Permission check
- Products: bk (quarterly+), xinli (yearly+), fuplan (lifetime)

### BK System (apps/bk)

- Stock limit-up tracker with 7/15 day analysis
- Data source: Tushare API + longhuvip.com proxy
- Cron API: `/api/cron?date=YYYY-MM-DD` - Fetches and caches stock data
- Cache: Memory cache + MySQL `stock_performance` table
- Key fix: Tushare date format YYYYMMDD → YYYY-MM-DD conversion

### Fuplan System (apps/fuplan → /www/wwwroot/fuplan-static)

- Pure static HTML deployment (not Next.js)
- Files: index.html + MP3 audio files
- Nginx serves static files with auth_request to main site

## Environment Variables

**apps/web/.env:**
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=ChangeMe2026!Secure
DB_NAME=member_system
JWT_SECRET=yushuo_member_system_jwt_secret_key_2026
COOKIE_DOMAIN=.yushuofupan.com
```

**apps/bk/.env:**
```env
DB_HOST=localhost
DB_NAME=stock_tracker
TUSHARE_TOKEN=<token>
```

## Key Files

- `apps/web/src/lib/membership-levels.ts` - Product definitions, access control
- `apps/web/src/app/api/gate/[slug]/route.ts` - Product access gate
- `apps/web/src/middleware.ts` - Admin route protection
- `apps/bk/src/app/api/stocks/route.ts` - Stock data API
- `apps/bk/src/app/api/cron/route.ts` - Data fetching cron
- `apps/bk/src/components/desktop/DesktopStockTracker.tsx` - Main BK UI
- `packages/auth/src/auth-middleware.ts` - JWT and cookie handling

## Common Issues

### Cross-domain cookie not working
- Ensure `COOKIE_DOMAIN=.yushuofupan.com` in web app .env
- User must re-login to get new cookie with Domain attribute
- Check `SameSite=Lax` in auth-middleware.ts

### BK data shows 0% for all prices
- Check Tushare date format conversion (YYYYMMDD → YYYY-MM-DD)
- Verify `stock_performance` table has non-zero `pct_change` values
- Re-run cron: `curl http://localhost:3001/api/cron?date=YYYY-MM-DD`

### 15-day modal causes page refresh
- `fetch7DaysData()` must use `silentMode=true` to avoid triggering global loading state
- Global `loading` state causes component to return `<SkeletonScreen />`

### Admin page 404
- Admin login is at `/admin` (not `/admin/login`)
- Middleware redirects to `/admin` for unauthenticated requests

## Server Nginx Configuration

Each subdomain uses auth_request to check permissions:

```nginx
location = /_auth {
  internal;
  proxy_pass http://127.0.0.1:3000/api/gate/<product>;
  proxy_set_header Cookie $http_cookie;
  proxy_set_header Host yushuofupan.com;
}

location / {
  auth_request /_auth;
  error_page 401 = @auth_redirect;
  # ... proxy or static file serving
}
```

## Admin Access

- URL: https://yushuofupan.com/admin
- Username: admin
- Password: 7287843Wu
