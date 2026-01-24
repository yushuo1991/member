# Database v3 Migration Quick Guide

## 🎯 Quick Summary

**Before (Old Schema):**
- Users table contains `membership_level` + `membership_expiry`
- No trial system
- Simple activation codes (membership only)

**After (v3 Schema):**
- Independent `memberships` table (user_id → level + expires_at)
- Trial tracking in users table (`trial_bk`, `trial_xinli`, `trial_fuplan`)
- Support for both membership and product activation codes
- Comprehensive logging (trial, access, audit)

---

## 📋 Table Structure Changes

### 1. users Table
```diff
- membership_level ENUM(...)
- membership_expiry DATETIME
+ phone VARCHAR(20)
+ real_name VARCHAR(100)
+ avatar_url VARCHAR(500)
+ status TINYINT DEFAULT 1
+ trial_bk INT DEFAULT 5
+ trial_xinli INT DEFAULT 5
+ trial_fuplan INT DEFAULT 5
+ last_login_at TIMESTAMP NULL
+ deleted_at TIMESTAMP NULL
```

### 2. NEW: memberships Table
```sql
CREATE TABLE memberships (
  user_id INT UNSIGNED UNIQUE,    -- One membership per user
  level ENUM('none', 'monthly', 'quarterly', 'yearly', 'lifetime'),
  expires_at TIMESTAMP NULL,      -- NULL = lifetime
  activated_at TIMESTAMP NULL
)
```

### 3. activation_codes Table
```diff
+ code_type ENUM('membership', 'product')
+ product_slug VARCHAR(50)         -- For product codes
+ product_duration ENUM(...)       -- For product codes
+ batch_id VARCHAR(100)            -- Batch generation
```

### 4. products Table
```diff
+ url VARCHAR(500)
+ icon VARCHAR(50)
+ price_type ENUM('membership', 'standalone', 'both')
+ standalone_prices JSON
+ trial_enabled TINYINT
+ trial_count INT
+ status TINYINT
- content LONGTEXT                 -- Removed
```

### 5. NEW Tables
- `user_product_purchases` - Standalone product purchases
- `trial_logs` - Trial usage history
- `product_access_logs` - Product access tracking
- `admin_audit_logs` - Admin operation audit trail

---

## 🔧 Required Code Changes

### Registration API (CRITICAL)
**File:** `src/app/api/auth/register/route.ts`

**Before:**
```typescript
await db.query(
  `INSERT INTO users (username, email, password_hash, membership_level)
   VALUES (?, ?, ?, 'none')`
);
```

**After:**
```typescript
// 1. Insert user
const [userResult] = await db.query(
  `INSERT INTO users (username, email, password_hash, status, trial_bk, trial_xinli, trial_fuplan)
   VALUES (?, ?, ?, 1, 5, 5, 5)`,
  [username, email, passwordHash]
);

// 2. Create membership record
await db.query(
  `INSERT INTO memberships (user_id, level, expires_at, activated_at)
   VALUES (?, 'none', NULL, NOW())`,
  [userResult.insertId]
);
```

### User Info API
**File:** `src/app/api/auth/me/route.ts`

**Before:**
```typescript
const [rows] = await db.query(
  `SELECT id, username, email, membership_level, membership_expiry
   FROM users WHERE id = ?`
);
```

**After:**
```typescript
const [rows] = await db.query(
  `SELECT
    u.id, u.username, u.email, u.status,
    u.trial_bk, u.trial_xinli, u.trial_fuplan,
    m.level as membership_level,
    m.expires_at as membership_expiry
   FROM users u
   LEFT JOIN memberships m ON u.id = m.user_id
   WHERE u.id = ? AND u.deleted_at IS NULL`
);
```

### Activation API
**File:** `src/app/api/activation/activate/route.ts`

**Before:**
```typescript
await db.query(
  `UPDATE users
   SET membership_level = ?, membership_expiry = ?
   WHERE id = ?`
);
```

**After:**
```typescript
// Update memberships table instead
await db.query(
  `INSERT INTO memberships (user_id, level, expires_at, activated_at)
   VALUES (?, ?, ?, NOW())
   ON DUPLICATE KEY UPDATE
     level = VALUES(level),
     expires_at = VALUES(expires_at),
     activated_at = NOW()`,
  [userId, level, expiresAt]
);
```

---

## 🚀 Deployment Steps

### Option A: Auto-Migration (Recommended for production)

1. **Deploy updated code**
   - `database.ts` auto-detects old schema
   - Adds new columns automatically
   - No data loss

2. **Run data migration SQL**
   ```sql
   -- Migrate existing membership data
   INSERT INTO memberships (user_id, level, expires_at, activated_at)
   SELECT id, membership_level, membership_expiry, created_at
   FROM users
   WHERE NOT EXISTS (
     SELECT 1 FROM memberships WHERE memberships.user_id = users.id
   );
   ```

3. **Update API code**
   - Update register/login/activate routes
   - Test thoroughly

4. **Optional: Clean up old columns**
   ```sql
   -- Only after confirming everything works
   ALTER TABLE users DROP COLUMN membership_level;
   ALTER TABLE users DROP COLUMN membership_expiry;
   ```

### Option B: Fresh Install (For new deployments)

1. **Backup existing data** (if any)
   ```bash
   mysqldump -u root -p member_system > backup.sql
   ```

2. **Run v3 init script**
   ```bash
   mysql -u root -p member_system < database-init-v3.sql
   ```

3. **Deploy all code**
   - Already v3-compatible

---

## ✅ Testing Checklist

- [ ] User registration creates both `users` and `memberships` records
- [ ] User login returns membership info from `memberships` table
- [ ] Activation code updates `memberships` table correctly
- [ ] Trial counters decrement properly
- [ ] Product access checks work for all scenarios:
  - [ ] Membership-based access
  - [ ] Standalone purchase access
  - [ ] Trial access
- [ ] Soft delete works (users.deleted_at)
- [ ] Admin operations log to `admin_audit_logs`

---

## 🐛 Common Issues & Fixes

### Issue: "Table memberships doesn't exist"
**Cause:** Database not initialized with v3 schema
**Fix:**
```bash
mysql -u root -p member_system < database-init-v3.sql
# OR restart app (auto-creates table)
```

### Issue: "Column 'trial_bk' doesn't exist"
**Cause:** Old database schema
**Fix:**
```sql
ALTER TABLE users ADD COLUMN trial_bk INT DEFAULT 5;
ALTER TABLE users ADD COLUMN trial_xinli INT DEFAULT 5;
ALTER TABLE users ADD COLUMN trial_fuplan INT DEFAULT 5;
# OR restart app (auto-migration)
```

### Issue: "Foreign key constraint fails"
**Cause:** Creating membership before user
**Fix:**
```typescript
// Always create user first, THEN membership
const userResult = await createUser(...);
await createMembership(userResult.insertId, ...);
```

---

## 📊 Database Comparison

| Feature | Old Schema | v3 Schema |
|---------|-----------|-----------|
| Membership Storage | In users table | Separate memberships table |
| Trial System | ❌ None | ✅ Per-product counters |
| Activation Codes | Membership only | Membership + Products |
| Product Purchases | ❌ Not tracked | ✅ user_product_purchases |
| Access Logging | ❌ None | ✅ product_access_logs |
| Admin Audit | ❌ None | ✅ admin_audit_logs |
| Soft Delete | ❌ Hard delete | ✅ deleted_at timestamp |

---

## 🔗 Related Files

- `database.ts` - ✅ Updated to v3
- `database-init-v3.sql` - v3 schema reference
- `架构修复报告-v3.md` - Detailed change report
- `CLAUDE.md` - Full project documentation

---

## 💡 Key Principles

1. **Separation of Concerns**: Membership data separated from user data
2. **Extensibility**: Easy to add new product types and trial systems
3. **Audit Trail**: All critical operations logged
4. **Data Safety**: Soft deletes, no data loss during migration
5. **Performance**: Proper indexes on all foreign keys and query fields

---

## 📞 Support

If you encounter issues:
1. Check TypeScript errors: `npm run type-check`
2. Check database schema: `SHOW CREATE TABLE tablename`
3. Review migration logs in console
4. Reference `架构修复报告-v3.md` for detailed explanations
