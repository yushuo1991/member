import { NextRequest, NextResponse } from 'next/server';
import { getConnection } from '@repo/database';
import { verifyAdminToken, errorResponse } from '@repo/auth';

/**
 * GET /api/admin/products/content/[slug]
 * 获取单个产品内容
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  let connection;

  try {
    // 验证管理员权限
    const { isValid, admin, error } = verifyAdminToken(request);
    if (!isValid || !admin) {
      return errorResponse(error || '未授权访问', 401);
    }

    connection = await getConnection();

    // 查询产品内容
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
      WHERE product_slug = ?`,
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

    return NextResponse.json({
      success: true,
      data: product
    });

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

/**
 * PUT /api/admin/products/content/[slug]
 * 更新产品内容
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  let connection;

  try {
    // 验证管理员权限
    const { isValid, admin, error } = verifyAdminToken(request);
    if (!isValid || !admin) {
      return errorResponse(error || '未授权访问', 401);
    }
    const adminId = admin.userId;

    const body = await request.json();
    const {
      title,
      subtitle,
      description,
      detail_description,
      features,
      images,
      video_url,
      sort_order,
      status
    } = body;

    // 验证必填字段
    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: '标题和描述不能为空' },
        { status: 400 }
      );
    }

    connection = await getConnection();

    // 检查产品是否存在
    const [existing] = await connection.execute(
      'SELECT id FROM product_contents WHERE product_slug = ?',
      [params.slug]
    );

    if ((existing as any[]).length === 0) {
      // 如果不存在，创建新记录
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
          params.slug,
          title,
          subtitle || null,
          description,
          detail_description || null,
          JSON.stringify(features || []),
          JSON.stringify(images || []),
          video_url || null,
          sort_order || 0,
          status !== undefined ? status : 1,
          adminId
        ]
      );
    } else {
      // 更新现有记录
      await connection.execute(
        `UPDATE product_contents SET
          title = ?,
          subtitle = ?,
          description = ?,
          detail_description = ?,
          features = ?,
          images = ?,
          video_url = ?,
          sort_order = ?,
          status = ?,
          updated_by = ?
        WHERE product_slug = ?`,
        [
          title,
          subtitle || null,
          description,
          detail_description || null,
          JSON.stringify(features || []),
          JSON.stringify(images || []),
          video_url || null,
          sort_order || 0,
          status !== undefined ? status : 1,
          adminId,
          params.slug
        ]
      );
    }

    // 获取更新后的数据
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
      WHERE product_slug = ?`,
      [params.slug]
    );

    const product = {
      ...(rows as any[])[0],
      features: JSON.parse((rows as any[])[0].features),
      images: JSON.parse((rows as any[])[0].images)
    };

    return NextResponse.json({
      success: true,
      message: '产品内容更新成功',
      data: product
    });

  } catch (error) {
    console.error('更新产品内容失败:', error);
    return NextResponse.json(
      {
        success: false,
        message: '更新产品内容失败',
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
