# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A **membership SaaS ecosystem** for stock trading education and tools (宇硕短线). The main application is a Next.js-based membership management system with multiple supporting products including stock analysis tools, trading review systems, and educational resources.

**Primary Stack:** Next.js 14 (App Router), TypeScript, React 18, MySQL 8.0, Tailwind CSS, JWT authentication

## Repository Structure

This is a **multi-project workspace** organized as follows:

- **`member-system/`** - Main production application (Next.js membership system)
- **`index.html`** - Single-file HTML demo/prototype (1700+ lines, React + LocalStorage)
- **`temp_*` repos** - Historical snapshots and related systems (fuplan, bk, xinli)
- **`ops/`** - Nginx configuration and deployment scripts
- **`AGENTS.md`** - Repository development guidelines
- **`DEPLOYMENT.md`** - Deployment workflow documentation

**Active Development:** Focus on `member-system/` for production changes.

## Common Commands

All commands run from `member-system/` directory:

### Development
```bash
npm install              # Install dependencies
npm run dev              # Start dev server (http://localhost:3000)
npm run build            # Production build (standalone output)
npm run start            # Run production build locally
npm run lint             # ESLint checks
npm run type-check       # TypeScript validation (tsc --noEmit)
```

### Database Management
```bash
# Initialize database (choose one schema version)
mysql -u root -p member_system < member-system/database-init-v3.sql

# Latest schema is database-init-v3.sql (includes trial system)
```

### Deployment
```bash
# Automated deployment via GitHub Actions on push to main branch
git push origin main

# Manual deployment on server
pm2 startOrReload ecosystem.config.js --env production
pm2 logs member-system
pm2 restart member-system
```

### Demo/Prototype
```bash
# Run single-file demo from root directory
python -m http.server 8000
# Then open http://localhost:8000/index.html
```

## Architecture & Core Systems

### 1. Authentication & Authorization

**JWT-based authentication** with httpOnly cookies:

- **Login Flow:** Username/email + password → bcrypt verification → JWT token (7-day expiry)
- **Middleware:** `src/lib/auth-middleware.ts` handles token verification
- **Cookie Settings:** httpOnly, sameSite=strict, secure in production
- **Rate Limiting:** IP-based rate limiting in `src/lib/rate-limiter.ts`

**Key API Routes:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login (returns JWT cookie)
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Clear auth cookie
- `POST /api/admin/auth/login` - Admin login (separate from user login)

### 2. Membership System

**Five-tier membership model** defined in `src/lib/membership-levels.ts`:

1. **none** (Free) - View products, 5 trials for trial-enabled products
2. **monthly** (¥99/30 days) - Learning circle + board assistant
3. **quarterly** (¥249/90 days) - Monthly features + board rhythm system
4. **yearly** (¥899/365 days) - Quarterly features + psychology + review system
5. **lifetime** (¥2999/永久) - All features forever

**Permission Logic:**
- Membership levels are hierarchical (yearly users get monthly benefits)
- Expiry checking happens on every protected API call
- `hasAccess()` in membership-levels.ts compares level weights
- Trial system allows 5 uses per product per user

**Key Functions:**
- `hasAccess(userLevel, requiredLevel, expiry)` - Check membership permission
- `calculateExpiry(level, startDate)` - Calculate expiry date
- `canAccessProductByMembership(userLevel, slug, expiry)` - Product access check

### 3. Product & Access Control

**Product Types:**
- **membership** - Requires membership tier (e.g., 学习圈, 板块节奏系统)
- **standalone** - Purchase separately (e.g., 情绪表格 buyout products)
- **both** - Can be accessed via membership OR standalone purchase

**Access Gate System:**
- `/api/gate/[slug]` - Universal product access check endpoint
- Returns: `{ hasAccess: boolean, reason: string, trialRemaining?: number }`
- Checks: membership level, expiry, standalone purchases, trial count

**Trial System:**
- Implemented in `src/lib/trial-service.ts`
- Tracks trial usage per user per product in `user_product_trials` table
- Free users get 5 trials for: 板块节奏系统, 心理测评系统, 复盘系统

### 4. Activation Code System

**Format:** `YS-M-XXXX` (monthly), `YS-Q-XXXX` (quarterly), `YS-Y-XXXX` (yearly), `YS-L-XXXX` (lifetime)

**Admin Operations:**
- Generate codes: `POST /api/activation/generate` (admin only)
- View codes: `GET /api/admin/codes/list`
- Activate code: `POST /api/activation/activate` (authenticated users)

**Activation Rules:**
- Codes can only be used once
- Membership duration extends from current expiry (or now if expired)
- Lifetime codes set membership_expiry to NULL

### 5. Database Architecture

**Connection Management:**
- Singleton pattern: `MemberDatabase.getInstance()` in `src/lib/database.ts`
- Connection pool: 20 max connections, 60s timeout
- Timezone: +08:00 (Beijing Time)
- Auto-initialization on first access

**Core Tables:**
- `users` - User accounts (username, email, password_hash, membership_level, membership_expiry)
- `admins` - Admin accounts (separate from users)
- `activation_codes` - Activation codes with usage tracking
- `products` - Product catalog (synchronized from membership-levels.ts)
- `user_products` - Standalone product purchases
- `user_product_trials` - Trial usage tracking
- `login_logs` - Audit trail for login attempts
- `rate_limits` - IP-based rate limiting

**Important:** The database schema includes an auto-upgrade pattern. When adding new columns, follow the pattern in `database.ts:initializeTables()` to check and add columns without breaking startup.

### 6. Security Features

**Implemented Protections:**
- **Password Security:** bcrypt with 12 rounds (configurable via BCRYPT_ROUNDS)
- **SQL Injection:** Parameterized queries throughout (mysql2 prepared statements)
- **XSS:** Content-Security-Policy headers in next.config.js
- **CSRF:** Origin verification + SameSite cookies
- **Rate Limiting:** IP-based with configurable thresholds
- **Audit Logging:** All login attempts logged to `login_logs` table

**Security Headers** (configured in next.config.js):
- Strict-Transport-Security (HSTS)
- X-Frame-Options: SAMEORIGIN
- X-Content-Type-Options: nosniff
- Content-Security-Policy (strict, relaxed for legacy routes)

### 7. Page Structure (App Router)

**Public Pages:**
- `/` - Landing page with product showcase
- `/login` - User login page
- `/register` - User registration
- `/membership` - Membership pricing page

**Protected Pages (require login):**
- `/member` - User dashboard with membership info
- `/upgrade` - Membership upgrade flow
- `/bk` - Board rhythm system (requires quarterly+)
- `/fuplan` - Review system (requires yearly+)
- `/xinli` - Psychology assessment (requires yearly+)

**Admin Pages:**
- `/admin` - Admin dashboard with stats
- `/admin/codes` - Activation code management
- `/admin/members` - User management (freeze/unfreeze, extend membership)

## Environment Variables

Required in `.env` (use `.env.example` as template):

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=member_system

# JWT
JWT_SECRET=your_secret_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Security
BCRYPT_ROUNDS=12
SESSION_SECRET=your_session_secret

# App
NODE_ENV=development
APP_URL=http://localhost:3000
PORT=3000
```

**CRITICAL:** Never commit `.env` files. The deployment workflow excludes `.env` from rsync.

## Deployment System

### Automated GitHub Actions Deployment

**Workflow:** `.github/workflows/deploy-member-system.yml`

**Trigger:** Push to `main` branch

**Steps:**
1. Checkout code
2. Setup Node.js with npm cache
3. rsync to server (excludes `.env`, `node_modules`, `.next`)
4. SSH to server and run:
   ```bash
   npm ci
   npm run build
   pm2 startOrReload ecosystem.config.js --env production
   ```

**Required GitHub Secrets:**
- `DEPLOY_HOST` - Server IP/hostname
- `DEPLOY_USER` - SSH user (non-root recommended)
- `DEPLOY_SSH_KEY` - Private key for SSH auth
- `DEPLOY_PORT` - SSH port (default: 22)
- `DEPLOY_PATH` - Server path (default: /opt/member-system)

### PM2 Configuration

**File:** `member-system/ecosystem.config.js`

**Settings:**
- App name: `member-system`
- Port: 3000
- Max memory: 1G
- Auto-restart on crash
- Error/out logs: `./logs/`

**Server Setup:**
1. Create deploy user with sudo access
2. Install Node.js 18+, npm, PM2, MySQL, Nginx
3. Create `/opt/member-system` directory
4. Copy `.env` from `.env.example` (DO NOT commit secrets)
5. Run database init script
6. Configure Nginx reverse proxy (use `ops/nginx-member-system.conf`)

### Nginx Configuration

**Template:** `ops/nginx-member-system.conf`

**Setup:**
- Reverse proxy: Port 80 → 3000
- Static file serving
- Gzip compression
- Security headers

```bash
sudo cp ops/nginx-member-system.conf /etc/nginx/sites-available/member-system
sudo ln -s /etc/nginx/sites-available/member-system /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

## Design System

**Apple-inspired minimalist aesthetic:**

- **Colors:** Blue primary (#0ea5e9), gradient backgrounds
- **Typography:** System font stack (SF Pro, Segoe UI, Roboto)
- **Border Radius:** Large (16-24px for cards)
- **Shadows:** Soft, multi-layer shadows
- **Animations:** Smooth transitions, fade-in effects

**Tailwind Configuration:** `member-system/tailwind.config.js`

**Global Styles:** `member-system/src/app/globals.css`

## Key Development Patterns

### When Adding New Products

1. Add product definition to `PRODUCTS` array in `src/lib/membership-levels.ts`
2. Set `requiredLevel`, `priceType`, `trialEnabled`, `trialCount`
3. Add product entry to database via admin panel or SQL
4. Create product route if needed (e.g., `/xinli`)
5. Implement access gate check using `/api/gate/[slug]`

### When Adding New API Routes

Follow Next.js 14 App Router conventions:

1. Create `route.ts` file in `src/app/api/[endpoint]/`
2. Export named functions: `GET`, `POST`, `PUT`, `DELETE`
3. Use `verifyAuth()` from auth-middleware for protected routes
4. Use `requireAdmin()` for admin-only routes
5. Return `NextResponse.json()` with proper status codes
6. Handle errors with try-catch and return error responses

**Example:**
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyAuth } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  const authResult = await verifyAuth(request);
  if (!authResult.authenticated) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Your logic here
  return NextResponse.json({ data: 'success' });
}
```

### When Modifying Database Schema

1. Update table creation in `src/lib/database.ts`
2. Add migration logic in `initializeTables()` using `SHOW COLUMNS` check
3. Update corresponding SQL file (database-init-v3.sql)
4. Document breaking changes in commit message
5. Test locally before deploying

**Pattern for adding columns:**
```typescript
// Check if column exists
const [columns] = await this.pool.execute(
  "SHOW COLUMNS FROM users LIKE 'new_column'"
);
if ((columns as any[]).length === 0) {
  await this.pool.execute(
    "ALTER TABLE users ADD COLUMN new_column VARCHAR(255)"
  );
}
```

### When Working with Authentication

- **Never** store passwords in plain text (use bcrypt)
- **Always** use parameterized queries to prevent SQL injection
- **Validate** all user inputs on both client and server
- **Check** membership expiry on every protected route
- **Log** authentication attempts for security auditing
- **Rate limit** login endpoints to prevent brute force

## Common Issues & Solutions

### "Database connection failed"
- Check MySQL is running: `sudo systemctl status mysql`
- Verify `.env` database credentials
- Ensure database exists: `CREATE DATABASE member_system;`
- Check connection pool settings in database.ts

### "JWT token invalid or expired"
- Check JWT_SECRET in `.env` matches between client/server
- Verify JWT_EXPIRES_IN is set correctly
- Clear cookies and re-login
- Check system time (JWT uses timestamps)

### "Membership access denied despite valid membership"
- Verify membership_expiry is in the future
- Check timezone settings (database uses +08:00)
- Confirm membership_level enum matches expected values
- Check hasAccess() logic in membership-levels.ts

### Build fails with "Module not found"
- Run `npm install` to ensure all dependencies are installed
- Check import paths use `@/` alias (configured in tsconfig.json)
- Verify file names match import statements (case-sensitive)
- Clear `.next` folder and rebuild

### PM2 process crashes after deployment
- Check PM2 logs: `pm2 logs member-system --lines 50`
- Verify environment variables on server
- Ensure database is accessible from server
- Check port 3000 is available: `lsof -i :3000`

## Related Systems

This workspace includes several supporting systems documented separately:

- **BK System** (Stock Tracker) - See `temp_bk_repo/CLAUDE.md` for details
- **Fuplan System** (Review System) - React + Vite + Supabase
- **Xinli System** (Psychology Assessment) - Integrated in member-system
- **Single-file Demo** (`index.html`) - Prototype with LocalStorage

## Important Notes

- **Conventional Commits:** Use `feat:`, `fix:`, `chore:` prefixes
- **Type Safety:** Run `npm run type-check` before committing
- **No Console Logs in Production:** Currently disabled in next.config.js (debugging deployments)
- **Secrets Management:** Never commit `.env`, use `.env.example` as template
- **Database Timezone:** All dates use Beijing Time (+08:00)
- **Membership Expiry:** NULL means lifetime/no expiry
