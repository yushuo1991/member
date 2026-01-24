# 复盘系统快速参考

## 🚀 快速启动

```bash
# 启动开发服务器
npm run dev:fuplan

# 访问
http://localhost:3002
```

## 📁 关键文件

| 文件 | 用途 |
|------|------|
| `src/app/review/page.tsx` | 复盘主页面 |
| `src/components/EmotionStageSelector.tsx` | 情绪选择器+音效 |
| `src/types/review.ts` | 类型定义 |
| `database-migration.sql` | 数据库表结构 |
| `public/audio/*.mp3` | 音效文件(4个) |

## 🎨 情绪阶段

| 阶段 | 颜色 | 音效文件 |
|------|------|----------|
| 混沌期 | 橙色 #f97316 | 混沌期.mp3 |
| 主升期 | 红色 #ef4444 | 主升期.mp3 |
| 盘顶期 | 蓝色 #3b82f6 | 盘顶期.mp3 |
| 退潮期 | 绿色 #10b981 | 退潮期.mp3 |

## 🔌 共享包

```typescript
import { verifyAuth } from '@repo/auth';
import { MemberDatabase } from '@repo/database';
import { Button } from '@repo/ui';
```

## 📊 数据库表

```sql
review_records    -- 复盘记录主表
trading_records   -- 交易记录子表
```

## ⚙️ 下一步开发

1. **实现API** - `/api/reviews/*`
2. **集成认证** - JWT验证
3. **连接数据库** - MySQL操作
4. **完善表单** - 所有字段

## 🐛 问题排查

```bash
# 类型检查
npm run type-check

# 查看日志
pm2 logs fuplan

# 重启服务
pm2 restart fuplan
```

## 📝 API端点（待实现）

```
GET    /api/reviews          # 列表
POST   /api/reviews          # 创建
GET    /api/reviews/[id]     # 详情
PUT    /api/reviews/[id]     # 更新
DELETE /api/reviews/[id]     # 删除
GET    /api/admin/reviews    # 管理员查看
```
