import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@repo/database';

/**
 * GET /api/products/content/[slug]
 * 获取产品内容（用户端，带缓存）
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  let connection;

  try {
    connection = await getConnection();

    // 查询产品内容（只返回启用状态的）
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
        updated_at
      FROM product_contents
      WHERE product_slug = ? AND status = 1`,
      [params.slug]
    );

    const products = rows as any[];
    if (products.length === 0) {
      return NextResponse.json(
        { success: false, message: '产品内容不存在' },
        { status: 404 }
      );
    }

    // 解析 JSON 字段
    const product = {
      ...products[0],
      features: products[0].features ? JSON.parse(products[0].features) : [],
      images: products[0].images ? JSON.parse(products[0].images) : []
    };

    // 设置缓存头（5分钟）
    return NextResponse.json(
      {
        success: true,
        data: product
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
        }
      }
    );

  } catch (error) {
    console.error('获取产品内容失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '获取产品内容失败',
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

// 启用 Edge Runtime 以获得更好的性能
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
