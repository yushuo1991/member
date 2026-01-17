# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A Next.js 14-based membership management system with tiered access control, activation code system, and admin dashboard. Manages user memberships across multiple levels (monthly, quarterly, yearly, lifetime) with access to different products.

**Tech Stack:** Next.js 14, React 18, TypeScript, MySQL 8.0, Tailwind CSS, bcryptjs, JWT, PM2, Nginx

## Common Commands

### Development
```bash
npm install              # Install dependencies
npm run dev              # Start dev server at http://localhost:3000
npm run build            # Production build
npm start                # Start production server
npm run type-check       # TypeScript type checking
npm run lint             # Run ESLint
```

### Database
```bash
# Initialize database (first time setup)
mysql -u root -p < scripts/init-database-v2.sql

# Backup database
bash scripts/backup-database.sh

# Access MySQL
mysql -u root -p member_system
```

### Deployment
```bash
# Automated deployment via GitHub Actions
git add . && git commit -m "message" && git push

# Manual deployment (server)
cd /root/member-system
bash scripts/update-and-deploy.sh

# Server setup (first time)
bash scripts/server-setup.sh
```

### Server Management (PM2)
```bash
pm2 restart member-system    # Restart application
pm2 logs member-system       # View logs
pm2 status                   # Check status
pm2 flush                    # Clear logs
pm2 monit                    # Monitor resources
```

## Architecture & Data Flow

### Core Authentication Flow

1. **User Registration** → Hash password with bcrypt (10 rounds) → Create user + default membership (level: 'none')
2. **User Login** → Verify password → Generate JWT → Set HttpOnly cookie → Return user data with membership info
3. **Protected Routes** → Verify JWT via middleware → Check membership expiry → Grant/deny access
4. **Admin Login** → Separate admin table → Admin-specific JWT → Access admin routes

### Membership System

**Membership Levels** (ascending order):
- `none` - Free user (no expiry)
- `monthly` - 30 days access to bk + xinli products
- `quarterly` - 90 days access to bk + xinli + fuplan products
- `yearly` - 365 days access to all products
- `lifetime` - Permanent access (expiry = NULL)

**Permission Check Logic:**
1. Compare user level weight vs required level weight
2. Check if membership expired (skip for lifetime)
3. Return boolean access decision

**Activation Code Flow:**
1. Admin generates codes → Store in `activation_codes` table (used=0)
2. User inputs code → Validate existence + not used + not expired
3. Transaction: Mark code used → Update user membership → Update expiry date
4. Handle special cases: Same level = extend duration, Higher level = upgrade + reset expiry, Lifetime = set expiry to NULL

### Database Schema

**Core Tables:**
- `users` - User accounts (username, email, password_hash)
- `memberships` - One-to-one with users (user_id, level, expires_at, activated_at)
- `activation_codes` - Codes with level, duration, usage tracking (used, used_by, used_at, admin_id, batch_id)
- `products` - Product definitions (slug, name, url, required_level, icon)
- `admins` - Admin accounts (username, email, password_hash, role)
- `login_logs` - Security audit trail (user_id, email, ip_address, success, failure_reason)
- `rate_limits` - Anti-brute-force (ip_address, action_type, attempt_count, blocked_until)
- `member_operation_logs` - Admin operations audit (admin_id, user_id, action, old_value, new_value)

**Database Singleton:** `MemberDatabase.getInstance()` in `src/lib/database.ts`
- Connection pool (20 max connections, 60s timeout)
- Timezone: +08:00 (Beijing Time)
- Auto-initialization of tables via `initializeTables()`
- Built-in query wrapper with error handling

### TypeScript Type System

Located in `src/types/`:

**Key Types:**
- `User` - User account data (id, username, email, password_hash, created_at, updated_at)
- `Membership` - Membership details (user_id, level, expires_at, activated_at)
- `MembershipLevel` - Literal type: 'none' | 'monthly' | 'quarterly' | 'yearly' | 'lifetime'
- `ActivationCode` - Activation code structure (code, level, duration_days, used, used_by, batch_id)
- `Product` - Product definition (slug, name, url, required_level, icon, features[])
- `Admin` - Admin account (username, email, role)

**API Response Types:**
- `ApiResponse<T>` - Generic wrapper with success/error handling
- `AuthResponse` - Login/register response with user + token
- `MembershipResponse` - Membership data with user info

### API Routes

All routes follow Next.js 14 App Router convention (`src/app/api/*/route.ts`):

**User Authentication:**
- `POST /api/auth/register` - User registration (username, email, password validation)
- `POST /api/auth/login` - User login (returns JWT cookie)
- `POST /api/auth/logout` - Clear JWT cookie
- `GET /api/auth/me` - Get current user info (requires auth)

**Activation System:**
- `POST /api/activation/activate` - Activate membership with code (requires auth)
- `POST /api/activation/generate` - Generate codes (admin only)

**Product Access:**
- `GET /api/products/access/[slug]` - Check access to product (requires auth)

**Admin Endpoints:**
- `POST /api/admin/auth/login` - Admin login (separate from user login)
- `GET /api/admin/members` - List all members with pagination/search (admin only)
- `PUT /api/admin/members/[id]/adjust` - Manually adjust user membership (admin only)
- `GET /api/admin/dashboard/stats` - Dashboard statistics (admin only)
- `GET /api/admin/codes/list` - List activation codes (admin only)

### Security Features

**Authentication & Authorization:**
- Password hashing: bcryptjs with 10 salt rounds
- JWT tokens: HttpOnly cookies with SameSite=Strict
- Token expiry: 7 days
- Middleware: `authMiddleware` and `adminMiddleware` for route protection
- Role-based access control (user vs admin)

**Attack Prevention:**
- SQL injection: Parameterized queries throughout
- XSS: Content-Security-Policy headers
- CSRF: Origin verification + SameSite cookies
- Rate limiting: IP-based with configurable thresholds (login: 5/15min, register: 3/60min, activate: 10/15min)
- Brute force protection: Automatic IP blocking after threshold

**Audit Logging:**
- All login attempts logged (success + failures)
- Admin operations tracked with before/after values
- Rate limit violations recorded

### Component Architecture

**Page Components:**
- `src/app/page.tsx` - Landing page with product cards
- `src/app/login/page.tsx` - User login page
- `src/app/register/page.tsx` - User registration page
- `src/app/member/page.tsx` - Member center (activation, profile)
- `src/app/membership/page.tsx` - Membership pricing/upgrade
- `src/app/upgrade/page.tsx` - Upgrade membership flow
- `src/app/admin/*` - Admin dashboard pages (members, codes, stats)

**UI Components:**
- `src/components/Navbar.tsx` - Navigation with auth state
- `src/components/MemberBadge.tsx` - Visual membership level indicator
- `src/components/ProductCard.tsx` - Product display with access check
- `src/components/ActivationForm.tsx` - Activation code input form
- `src/components/AdminSidebar.tsx` - Admin navigation sidebar
- `src/components/ClientLayout.tsx` - Client-side layout wrapper
- `src/components/Loading.tsx` - Loading spinner component

**Context Providers:**
- `src/contexts/AuthContext.tsx` - Global auth state management (user, loading, login, logout, refresh)

**Core Libraries:**
- `src/lib/database.ts` - Database singleton with connection pooling
- `src/lib/auth-middleware.ts` - JWT verification and user extraction
- `src/lib/membership-levels.ts` - Membership configs, products, access checks
- `src/lib/rate-limiter.ts` - IP-based rate limiting utilities
- `src/lib/utils.ts` - General utilities (validation, formatting)

## Deployment System

### Automated Deployment (Primary Method)

Every `git push` to `main` branch triggers GitHub Actions (`.github/workflows/deploy.yml`):

1. Checkout code
2. Validate GitHub Secrets (SERVER_HOST, SERVER_USER, SERVER_SSH_KEY, DB_PASSWORD)
3. SSH to server (8.153.110.212)
4. Pull latest code
5. Backup database (if schema changes detected)
6. Run database migrations (if needed)
7. Install dependencies (`npm install --production`)
8. Build project (`npm run build`)
9. Restart PM2 (`pm2 restart member-system`)
10. Health check API endpoints

**GitHub Secrets Required:**
- `SERVER_HOST` - 8.153.110.212
- `SERVER_USER` - root
- `SERVER_SSH_KEY` - SSH private key
- `DB_PASSWORD` - MySQL root password

**Deployment Time:** ~3-5 minutes

### Server Configuration

**PM2 Configuration** (`ecosystem.config.js`):
- App name: `member-system`
- Mode: cluster (1 instance)
- Port: 3000
- Auto-restart: enabled
- Max memory: 1G
- Logs: `./logs/pm2-*.log`
- Graceful shutdown: 5s timeout
- Ready signal: wait_ready=true

**Nginx Configuration:**
- Reverse proxy: Port 80 → 3000
- Client max body: 10M
- Gzip compression: enabled
- Access logs: `/var/log/nginx/member-system-access.log`

**Server Paths:**
- Primary: `/root/member-system`
- Backups: `/root/backup_*.sql`
- Logs: `/root/member-system/logs/`

**Access URLs:**
- Production: http://8.153.110.212 (Port 80)
- Direct: http://8.153.110.212:3000
- Domain: yushuofupan.com (pending ICP filing)

## Environment Variables

Required in `.env.production` or `.env.local`:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your-secure-password
DB_NAME=member_system

# JWT Secret (CRITICAL - change in production!)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars

# Application
NEXT_PUBLIC_APP_URL=http://8.153.110.212
NODE_ENV=production
PORT=3000
```

## Important Development Notes

### When Working with Authentication

1. **JWT Tokens are HttpOnly** - Cannot be accessed via JavaScript, read from cookies server-side only
2. **Token Expiry Handling** - Check expiry in middleware, return 401 if expired (frontend should redirect to login)
3. **Password Updates** - Always hash with bcrypt before storing, never log or return passwords
4. **Admin vs User Routes** - Use separate middleware (`adminMiddleware` vs `authMiddleware`)
5. **Rate Limiting** - Check IP limits before processing login/register/activate requests

### When Working with Memberships

1. **Always Check Expiry** - Use `hasAccess()` function, don't manually compare levels
2. **Lifetime Members** - Expiry is NULL, handle this edge case in all queries
3. **Transaction Safety** - Wrap activation code usage in database transactions
4. **Level Weights** - Use predefined weights (none:0, monthly:1, quarterly:2, yearly:3, lifetime:4)
5. **Expiry Calculation** - Use `calculateExpiry()` and `extendMembership()` functions, respect timezone

### When Adding New Products

1. Add product definition to `src/lib/membership-levels.ts` in PRODUCTS array
2. Set `requiredLevel` to minimum membership tier
3. Update product URLs to point to actual deployed applications
4. Insert into database `products` table for persistence
5. Update product cards on frontend pages

### Database Upgrade Pattern

When adding new fields to existing tables:
1. Check if column exists using `SHOW COLUMNS`
2. Add column with `ALTER TABLE` if missing
3. Don't throw errors (prevents system startup issues)
4. Add upgrade logic to `database.ts:upgradeDatabase()`
5. Log all upgrade steps for debugging

### API Error Handling

All API routes should:
- Use try-catch blocks
- Return structured JSON responses (`{ success: boolean, message: string, data?: any }`)
- Log errors server-side
- Never expose internal errors to client
- Use appropriate HTTP status codes (200, 400, 401, 403, 404, 500)

### Security Best Practices

1. **Never commit secrets** - Use .env files (gitignored)
2. **Validate all inputs** - Email format, password strength, username length
3. **Sanitize SQL** - Always use parameterized queries (never string concatenation)
4. **Check authorization** - Verify user owns resource before modifying
5. **Log security events** - Login failures, rate limit hits, admin actions

## Common Issues

### Login Fails with "邮箱或密码错误" (Incorrect Credentials)

**Symptom:** User enters correct credentials but login fails

**Common Causes:**
1. Password hash mismatch (bcrypt rounds changed)
2. Membership record not created during registration
3. User account exists but membership table entry missing

**Fix:**
```bash
# Check user + membership
mysql -u root -p member_system -e "
SELECT u.id, u.username, u.email, m.level, m.expires_at
FROM users u
LEFT JOIN memberships m ON u.id = m.user_id
WHERE u.email = 'user@example.com';
"

# Create missing membership
mysql -u root -p member_system -e "
INSERT INTO memberships (user_id, level, expires_at, activated_at)
VALUES (USER_ID, 'none', NULL, NOW());
"
```

### Activation Code Shows as Used But User Not Upgraded

**Symptom:** Code marked as used=1 but user membership unchanged

**Cause:** Transaction failed midway (code marked used but membership update failed)

**Fix:**
```bash
# Reset activation code
mysql -u root -p member_system -e "
UPDATE activation_codes
SET used = 0, used_by = NULL, used_at = NULL
WHERE code = 'YOUR-CODE-HERE';
"

# Verify user membership
mysql -u root -p member_system -e "
SELECT * FROM memberships WHERE user_id = USER_ID;
"
```

### PM2 App Shows "errored" Status

**Symptom:** `pm2 status` shows app in error state

**Common Causes:**
1. Database connection failure (wrong credentials)
2. Port 3000 already in use
3. Missing environment variables
4. Build artifacts missing (.next directory)

**Fix:**
```bash
# Check detailed logs
pm2 logs member-system --lines 50

# Test database connection
mysql -u root -p -e "SELECT 1;"

# Check port usage
netstat -tlnp | grep 3000

# Rebuild and restart
cd /root/member-system
npm run build
pm2 restart member-system

# If still failing, delete and recreate
pm2 delete member-system
pm2 start npm --name "member-system" -- start
```

### Database Connection Pool Exhausted

**Symptom:** "Too many connections" errors in logs

**Cause:** Connection leaks or high concurrent traffic

**Fix:**
```bash
# Check current connections
mysql -u root -p -e "SHOW PROCESSLIST;"

# Increase pool limit (database.ts)
# Change: connectionLimit: 20 → connectionLimit: 50

# Restart app
pm2 restart member-system
```

### Membership Expiry Not Updating Correctly

**Symptom:** User activates code but expiry date is wrong

**Cause:** Timezone mismatch or calculation error

**Fix:**
- Verify database timezone: `SELECT @@global.time_zone, @@session.time_zone;`
- Should be '+08:00' for Beijing Time
- Check `calculateExpiry()` function logic
- Verify `extendMembership()` handles existing expiry correctly

## Test Accounts

**Admin Account:**
- Email: `admin@example.com`
- Password: `Admin123456`
- Purpose: Access admin dashboard, generate codes

**Test User:**
- Email: `zhangsan@example.com`
- Password: `Test123456`
- Level: Monthly member
- Purpose: Test user flows

**Test Activation Codes:**
- `MONTHLY-TEST-2026-001` - 30 days
- `QUARTERLY-TEST-2026-001` - 90 days
- `YEARLY-TEST-2026-001` - 365 days
- `LIFETIME-TEST-2026-001` - Permanent

**IMPORTANT:** Change admin password immediately in production!

## Production Checklist

Before going live:

- [ ] Change `JWT_SECRET` to strong random value (32+ chars)
- [ ] Change admin password from default
- [ ] Update MySQL root password
- [ ] Configure Nginx for HTTPS (after domain ICP filing)
- [ ] Set up SSL certificate via certbot
- [ ] Configure firewall (allow 80, 443, 22 only)
- [ ] Enable PM2 startup script (`pm2 startup` + `pm2 save`)
- [ ] Set up database backup cron job
- [ ] Configure log rotation
- [ ] Test all API endpoints
- [ ] Verify GitHub Actions deployment works
- [ ] Monitor disk space and memory usage

## Repository & Access

- **GitHub:** (Repository URL to be added)
- **Server:** ssh root@8.153.110.212
- **Production URL:** http://8.153.110.212 (Port 80)
- **Direct Access:** http://8.153.110.212:3000
- **Domain:** yushuofupan.com (pending ICP filing)
- **Products:**
  - 板块节奏系统: https://bk.yushuo.click
  - 心理评估系统: https://xinli.yushuo.click
  - 交易复盘系统: https://yushuo.click
