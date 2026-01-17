/**
 * 共享数据库查询函数
 * 统一管理常用查询，避免代码重复
 */

import { memberDatabase } from './database';
import { MembershipLevel } from '@/types/membership';

/**
 * 用户会员信息结构
 */
export interface UserWithMembership {
  id: number;
  username: string;
  email: string;
  password_hash?: string;
  membership_level: MembershipLevel | null;
  membership_expiry: Date | null;
  created_at: Date;
  updated_at: Date;
}

/**
 * 根据用户ID查询用户和会员信息
 * @param userId 用户ID
 * @returns 用户信息（包含会员信息）
 */
export async function getUserWithMembership(userId: number): Promise<UserWithMembership | null> {
  const db = memberDatabase.getPool();

  const [rows] = await db.execute<any[]>(
    `SELECT u.id, u.username, u.email, u.password_hash, u.created_at, u.updated_at,
            m.level as membership_level, m.expires_at as membership_expiry
     FROM users u
     LEFT JOIN memberships m ON u.id = m.user_id
     WHERE u.id = ?`,
    [userId]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0] as UserWithMembership;
}

/**
 * 根据邮箱查询用户和会员信息
 * @param email 用户邮箱
 * @returns 用户信息（包含会员信息）
 */
export async function getUserByEmail(email: string): Promise<UserWithMembership | null> {
  const db = memberDatabase.getPool();

  const [rows] = await db.execute<any[]>(
    `SELECT u.id, u.username, u.email, u.password_hash, u.created_at, u.updated_at,
            m.level as membership_level, m.expires_at as membership_expiry
     FROM users u
     LEFT JOIN memberships m ON u.id = m.user_id
     WHERE u.email = ?`,
    [email]
  );

  if (rows.length === 0) {
    return null;
  }

  return rows[0] as UserWithMembership;
}

/**
 * 查询会员列表（带分页和搜索）
 * @param options 查询选项
 * @returns 会员列表和总数
 */
export async function getMembersList(options: {
  page: number;
  limit: number;
  membershipLevel?: string;
  searchQuery?: string;
}): Promise<{ members: UserWithMembership[]; total: number }> {
  const { page, limit, membershipLevel, searchQuery } = options;
  const offset = (page - 1) * limit;
  const db = memberDatabase.getPool();

  // 构建查询条件
  let whereClause = 'WHERE 1=1';
  const queryParams: any[] = [];

  if (membershipLevel) {
    whereClause += ' AND m.level = ?';
    queryParams.push(membershipLevel);
  }

  if (searchQuery) {
    whereClause += ' AND (u.username LIKE ? OR u.email LIKE ?)';
    const searchPattern = `%${searchQuery}%`;
    queryParams.push(searchPattern, searchPattern);
  }

  // 查询总数
  const [countResult] = await db.execute<any[]>(
    `SELECT COUNT(DISTINCT u.id) as total
     FROM users u
     LEFT JOIN memberships m ON u.id = m.user_id
     ${whereClause}`,
    queryParams
  );

  const total = countResult[0].total;

  // 查询会员列表
  const [members] = await db.execute<any[]>(
    `SELECT u.id, u.username, u.email, u.created_at, u.updated_at,
            m.level as membership_level, m.expires_at as membership_expiry
     FROM users u
     LEFT JOIN memberships m ON u.id = m.user_id
     ${whereClause}
     ORDER BY u.created_at DESC
     LIMIT ? OFFSET ?`,
    [...queryParams, limit, offset]
  );

  return {
    members: members as UserWithMembership[],
    total
  };
}

/**
 * 更新用户会员等级
 * @param userId 用户ID
 * @param adminId 管理员ID
 * @param level 新会员等级
 * @param expiresAt 新过期时间
 * @returns 是否成功
 */
export async function updateUserMembership(
  userId: number,
  adminId: number,
  level: MembershipLevel,
  expiresAt: Date | null
): Promise<boolean> {
  const db = memberDatabase.getPool();
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    // 查询旧的会员信息（用于日志记录）
    const [oldData] = await connection.execute<any[]>(
      'SELECT level, expires_at FROM memberships WHERE user_id = ?',
      [userId]
    );

    const oldLevel = oldData.length > 0 ? oldData[0].level : 'none';
    const oldExpiry = oldData.length > 0 ? oldData[0].expires_at : null;

    // 更新或插入会员信息
    await connection.execute(
      `INSERT INTO memberships (user_id, level, expires_at, activated_at)
       VALUES (?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE
         level = VALUES(level),
         expires_at = VALUES(expires_at)`,
      [userId, level, expiresAt]
    );

    // 记录操作日志
    await connection.execute(
      `INSERT INTO member_operation_logs
       (admin_id, user_id, action, old_value, new_value)
       VALUES (?, ?, '调整会员等级', ?, ?)`,
      [
        adminId,
        userId,
        JSON.stringify({ level: oldLevel, expires_at: oldExpiry }),
        JSON.stringify({ level, expires_at: expiresAt })
      ]
    );

    await connection.commit();
    return true;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}
