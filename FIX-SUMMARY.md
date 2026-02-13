# 502错误修复总结

## 修复时间
2026-02-13 11:00 (北京时间)

## 问题描述
- 网站访问返回 502 Bad Gateway
- member-web 应用反复崩溃重启（15次+）
- 错误信息：`Cannot find module 'next'`

## 根本原因
Next.js standalone构建缺少运行时依赖。`.next/standalone/server.js` 需要 `next` 模块，但该目录没有 `node_modules`。

## 修复方案
在 `/www/wwwroot/member-system/.next/standalone/node_modules/` 中安装核心依赖：
```bash
npm install next@14.2.35 react@18.3.1 react-dom@18.3.1 sharp@0.33.5
```

## 修复结果
✅ 网站恢复正常访问
✅ member-web 稳定运行
✅ 所有应用状态正常

## 如果再次出现此问题

### 快速修复（1分钟）
```bash
ssh root@yushuofupan.com
cd /www/wwwroot/member-system/.next/standalone/node_modules
npm install next@14.2.35 react@18.3.1 react-dom@18.3.1 sharp@0.33.5 --no-save --legacy-peer-deps
pm2 restart member-web
```

### 使用自动化脚本
```bash
# 上传脚本
scp fix-standalone-dependencies.sh root@yushuofupan.com:/tmp/

# 执行修复
ssh root@yushuofupan.com "bash /tmp/fix-standalone-dependencies.sh && pm2 restart all"
```

## 预防措施

### 1. 每次部署后检查
```bash
# 检查依赖是否存在
test -f /www/wwwroot/member-system/.next/standalone/node_modules/next/dist/server/lib/start-server.js && echo "OK" || echo "需要修复"
```

### 2. 添加到部署流程
在部署脚本中添加依赖安装步骤（见 `DEPLOYMENT-FIX.md`）

### 3. 监控应用重启次数
如果 member-web 重启次数超过5次，说明有问题需要排查

## 相关文档
- `DEPLOYMENT-FIX.md` - 详细的修复和预防指南
- `fix-standalone-dependencies.sh` - 自动修复脚本
- `server-fix.sh` - 综合服务器修复脚本
- `SERVER-TROUBLESHOOTING.md` - 完整故障排查手册

## 验证清单
- [x] 网站可以访问（https://yushuofupan.com）
- [x] PM2进程状态正常
- [x] 应用日志无错误
- [x] 端口3000响应正常
- [x] Nginx配置正确

## 技术细节
- **问题文件**: `/www/wwwroot/member-system/.next/standalone/server.js`
- **缺失模块**: `next`, `react`, `react-dom`, `sharp`
- **PM2配置**: `/www/wwwroot/member-system/ecosystem.config.js`
- **应用端口**: 3000 (web), 3001 (bk), 3002 (fuplan), 3003 (xinli)

## Git历史参考
之前已经尝试过类似修复：
- `179c96f` - 在standalone目录中npm install核心依赖
- `c099c8b` - 用npm install替换pnpm符号链接
- `ac1dbcb` - 递归解引用standalone中所有pnpm符号链接

这次修复采用了最直接有效的方法：直接在standalone的node_modules中安装依赖。
