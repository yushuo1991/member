/**
 * 产品列表API
 * GET /api/products - 获取所有产品列表
 */

import { NextResponse } from 'next/server';
import { PRODUCTS } from '@/lib/membership-levels';

export async function GET() {
  try {
    // 返回所有产品，过滤掉重复的短slug别名
    const uniqueProducts = PRODUCTS.filter(p =>
      !['circle', 'bk'].includes(p.slug)
    );

    return NextResponse.json({
      success: true,
      data: {
        products: uniqueProducts.map(product => ({
          slug: product.slug,
          name: product.name,
          description: product.description,
          detailDescription: product.detailDescription,
          url: product.url,
          icon: product.icon,
          imageUrl: product.imageUrl,
          requiredLevel: product.requiredLevel,
          priceType: product.priceType,
          standalonePrices: product.standalonePrices,
          trialEnabled: product.trialEnabled,
          trialCount: product.trialCount,
          features: product.features,
          sortOrder: product.sortOrder
        }))
      },
      message: '获取产品列表成功',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[产品列表API] 查询失败:', error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        message: '获取产品列表失败',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
