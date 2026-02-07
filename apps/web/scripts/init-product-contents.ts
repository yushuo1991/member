/**
 * 产品内容初始化脚本
 * 将代码中的产品数据同步到数据库
 */

import { getConnection } from '@repo/database';
import { PRODUCTS } from '../src/lib/membership-levels';

async function initProductContents() {
  let connection;

  try {
    console.log('开始同步产品数据到数据库...\n');

    connection = await getConnection();

    let syncedCount = 0;
    let skippedCount = 0;
    let updatedCount = 0;

    for (const product of PRODUCTS) {
      console.log(`处理产品: ${product.name} (${product.slug})`);

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
            null // updated_by (系统初始化)
          ]
        );
        console.log(`  ✓ 已创建\n`);
        syncedCount++;
      } else {
        console.log(`  - 已存在，跳过\n`);
        skippedCount++;
      }
    }

    console.log('========================================');
    console.log('同步完成！');
    console.log(`新增: ${syncedCount} 个产品`);
    console.log(`跳过: ${skippedCount} 个已存在的产品`);
    console.log(`总计: ${PRODUCTS.length} 个产品`);
    console.log('========================================');

  } catch (error) {
    console.error('同步失败:', error);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    process.exit(0);
  }
}

// 运行脚本
initProductContents();
