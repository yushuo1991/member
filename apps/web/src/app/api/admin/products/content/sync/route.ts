import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@repo/database';
import { verifyAdminToken, errorResponse } from '@repo/auth';
import { PRODUCTS } from '@/lib/membership-levels';

/**
 * POST /api/admin/products/content/sync
 * 从代码同步产品数据到数据库
 */
export async function POST(request: NextRequest) {
  let connection;

  try {
    // 验证管理员权限
    const { isValid, admin, error } = verifyAdminToken(request);
    if (!isValid || !admin) {
      return errorResponse(error || '未授权访问', 401);
    }
    const adminId = admin.userId;

    connection = await getConnection();

    let syncedCount = 0;
    let skippedCount = 0;

    // 遍历所有产品
    for (const product of PRODUCTS) {
      // 检查产品是否已存在
      const [existing] = await connection.execute(
        'SELECT id FROM product_contents WHERE product_slug = ?',
        [product.slug]
      );

      if ((existing as any[]).length === 0) {
        // 插入新产品
        await connection.execute(
          `INSERT INTO product_contents (
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
            updated_by
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            product.slug,
            product.name,
            null, // subtitle
            product.description,
            product.detailDescription || product.description,
            JSON.stringify(product.features),
            JSON.stringify(product.imageUrl ? [product.imageUrl] : []),
            null, // video_url
            product.sortOrder,
            1, // status
            adminId
          ]
        );
        syncedCount++;
      } else {
        skippedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      message: `同步完成：新增 ${syncedCount} 个产品，跳过 ${skippedCount} 个已存在的产品`,
      data: {
        synced: syncedCount,
        skipped: skippedCount,
        total: PRODUCTS.length
      }
    });

  } catch (error) {
    console.error('同步产品数据失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '同步产品数据失败',
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
