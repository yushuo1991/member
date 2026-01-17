# 板块系统性能优化清单

## 🚀 立即优化（服务器端）

### 1. 启用Nginx压缩
```bash
# 编辑Nginx配置
sudo nano /etc/nginx/nginx.conf

# 添加gzip配置（参考 nginx-optimization.conf）
# 然后重启Nginx
sudo nginx -t
sudo systemctl reload nginx
```

**预期效果**: 减少70-80%的传输大小，加载速度提升3-5倍

### 2. 修复302重定向
```bash
# 检查 bk.yushuofupan.com 的Nginx配置
sudo nano /etc/nginx/sites-available/bk.yushuofupan.com

# 确保直接proxy_pass到板块系统，而不是重定向到yushuofupan.com
# 每个重定向增加200-300ms延迟
```

**预期效果**: 减少200-300ms加载时间

### 3. 优化PM2配置
```bash
# 检查板块系统是否运行在集群模式
pm2 list
pm2 describe 板块系统进程名

# 如果只有1个实例，建议增加到2-4个
pm2 scale 板块系统进程名 2
pm2 save
```

**预期效果**: 提升并发处理能力

---

## 📦 应用层优化（需要重新部署）

### 4. 分析Bundle大小
```bash
# 在板块系统项目目录
npm install --save-dev @next/bundle-analyzer

# 在package.json添加
"scripts": {
  "analyze": "ANALYZE=true next build"
}

# 运行分析
npm run analyze
```

**检查项**:
- [ ] 是否有未使用的大型库
- [ ] 是否所有组件都在首次加载
- [ ] 图片是否已优化

### 5. 实现代码分割
```typescript
// 将大型组件改为动态导入
import dynamic from 'next/dynamic'

// ❌ 错误：同步导入大组件
import HeavyChart from '@/components/HeavyChart'

// ✅ 正确：动态导入
const HeavyChart = dynamic(() => import('@/components/HeavyChart'), {
  loading: () => <div>加载中...</div>,
  ssr: false // 如果组件不需要SSR
})
```

### 6. 优化图片
```typescript
// ❌ 错误：使用<img>标签
<img src="/large-image.png" />

// ✅ 正确：使用next/image
import Image from 'next/image'
<Image
  src="/large-image.png"
  width={800}
  height={600}
  priority={false} // 非首屏图片设置为false
  placeholder="blur" // 添加模糊占位符
/>
```

### 7. 数据库查询优化
```sql
-- 检查是否有慢查询
-- 在MySQL中运行
SHOW VARIABLES LIKE 'slow_query_log';
SET GLOBAL slow_query_log = 'ON';
SET GLOBAL long_query_time = 0.5;

-- 查看慢查询日志
-- 然后针对性优化，添加索引
```

### 8. 实现API缓存
```typescript
// 在API路由中添加缓存
export async function GET(request: Request) {
  // 设置缓存头
  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
    }
  })
}
```

---

## 🔧 数据库优化

### 9. 添加必要索引
```sql
-- 检查表的索引情况
SHOW INDEX FROM your_table_name;

-- 为常用查询字段添加索引
-- 例如：如果经常按user_id查询
CREATE INDEX idx_user_id ON your_table(user_id);

-- 复合索引（如果经常组合查询）
CREATE INDEX idx_user_date ON your_table(user_id, created_at);
```

### 10. 配置连接池
```typescript
// 在database.ts中优化连接池配置
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  connectionLimit: 20, // 增加连接数
  queueLimit: 0,
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
})
```

---

## 📊 监控和测试

### 11. 性能监控
```bash
# 安装性能监控工具
npm install --save @vercel/analytics

# 或使用lighthouse测试
npx lighthouse http://bk.yushuofupan.com --view
```

### 12. 压力测试
```bash
# 使用Apache Bench测试
ab -n 1000 -c 10 http://bk.yushuofupan.com/

# 或使用autocannon
npx autocannon -c 10 -d 30 http://bk.yushuofupan.com/
```

---

## ✅ 优化优先级

### 🔴 **高优先级**（立即执行）
1. [ ] 启用Nginx Gzip压缩
2. [ ] 修复302重定向
3. [ ] 检查服务器资源使用率

### 🟡 **中优先级**（本周完成）
4. [ ] 分析Bundle大小
5. [ ] 实现代码分割
6. [ ] 优化图片加载
7. [ ] 添加数据库索引

### 🟢 **低优先级**（持续优化）
8. [ ] 实现Redis缓存
9. [ ] 配置CDN
10. [ ] 设置性能监控

---

## 📈 预期效果

完成所有优化后，预期性能提升：
- **首次加载时间**: 从5-8秒 → 1-2秒
- **重复访问**: 从3-5秒 → 0.5-1秒
- **传输大小**: 从50KB → 10-15KB（压缩后）
- **TTFB**: 从300-500ms → 100-200ms

---

## 🛠️ 快速诊断命令

```bash
# 1. 检查Nginx是否启用压缩
curl -I -H "Accept-Encoding: gzip" http://bk.yushuofupan.com/

# 2. 测试加载时间
curl -o /dev/null -s -w "总耗时: %{time_total}秒\n" http://bk.yushuofupan.com/

# 3. 检查进程状态
pm2 list
pm2 monit

# 4. 检查服务器资源
top
free -h
df -h

# 5. 查看Nginx错误日志
sudo tail -f /var/log/nginx/error.log
```
