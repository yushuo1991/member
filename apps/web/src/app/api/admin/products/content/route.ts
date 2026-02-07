import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@repo/database';
import { verifyAdminToken, errorResponse } from '@repo/auth';

/**
 * GET /api/admin/products/content
 * 获取所有产品内容列表
 */
export async function GET(request: NextRequest) {
  let connection;

  try {
    // 验证管理员权限
    const { isValid, admin, error } = verifyAdminToken(request);
    if (!isValid || !admin) {
      return errorResponse(error || '未授权访问', 401);
    }

    connection = await getConnection();

    // 查询所有产品内容
    const [rows] = await connection.execute(
      `SELECT
        id,
        product_slug,
        title,
        subtitle,
        description,
        detail_description,
        features,
        images,
        video_url,
        sort_order,
        status,
        updated_by,
        updated_at,
        created_at
      FROM product_contents
      ORDER BY sort_order ASC, created_at DESC`
    );

    // 解析 JSON 字段
    const products = (rows as any[]).map(row => ({
      ...row,
      features: row.features ? JSON.parse(row.features) : [],
      images: row.images ? JSON.parse(row.images) : []
    }));

    return NextResponse.json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('获取产品内容列表失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '获取产品内容列表失败',
        error: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      connection.release();
    }
  }
}
