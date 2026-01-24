# Monorepo配置快速参考

## 端口分配

| 应用 | 开发端口 | 生产端口 | PM2名称 | 服务器路径 |
|------|---------|---------|---------|-----------|
| Web | 3000 | 3000 | member-web | /www/wwwroot/member-system |
| BK | 3001 | 3001 | member-bk | /www/wwwroot/bk-system |
| Fuplan | 3002 | 3002 | member-fuplan | /www/wwwroot/fuplan-system |
| Xinli | 3003 | 3003 | member-xinli | /www/wwwroot/xinli-system |

## 快速命令

### 开发环境

```bash
# 单独启动
pnpm dev:web      # Port 3000
pnpm dev:bk       # Port 3001
pnpm dev:fuplan   # Port 3002
pnpm dev:xinli    # Port 3003

# 并行启动所有
pnpm dev:all

# 构建
pnpm build:web
pnpm build:bk
pnpm build:fuplan
pnpm build:xinli
```

### 生产环境

```bash
# PM2管理
pm2 start ecosystem.config.monorepo.js --env production
pm2 reload ecosystem.config.monorepo.js
pm2 list
pm2 logs

# 单独重启
pm2 restart member-web
pm2 restart member-bk
pm2 restart member-fuplan
pm2 restart member-xinli
```

## 文件清单

### 配置文件

- ✅ `turbo.json` - Turborepo配置
- ✅ `pnpm-workspace.yaml` - pnpm workspace配置
- ✅ `package.json` - 根package.json（带并行命令）
- ✅ `ecosystem.config.monorepo.js` - PM2配置（4个进程）
- ✅ `nginx-monorepo.conf` - Nginx配置（4个域名）
- ✅ `.github/workflows/deploy-monorepo.yml` - CI/CD配置

### 应用配置

- ✅ `apps/web/package.json` - Port 3000
- ✅ `apps/bk/package.json` - Port 3001
- ✅ `apps/fuplan/package.json` - Port 3002
- ✅ `apps/xinli/package.json` - Port 3003

### 共享包

- ✅ `packages/ui` - UI组件库
- ✅ `packages/auth` - 认证模块
- ✅ `packages/database` - 数据库连接
- ✅ `packages/utils` - 工具函数
- ✅ `packages/config` - 配置管理

## GitHub Actions变更检测

```yaml
# 自动检测并只部署变更的应用
apps/web/** → 部署web
apps/bk/** → 部署bk
apps/fuplan/** → 部署fuplan
apps/xinli/** → 部署xinli
packages/** → 部署所有应用
turbo.json → 部署所有应用
```

## Nginx域名配置

```nginx
member.example.com → 127.0.0.1:3000 (Web)
bk.member.example.com → 127.0.0.1:3001 (BK)
fuplan.member.example.com → 127.0.0.1:3002 (Fuplan)
xinli.member.example.com → 127.0.0.1:3003 (Xinli)
```

## 部署流程

### 自动部署
```bash
git add .
git commit -m "feat: new feature"
git push origin main
# → GitHub Actions自动检测变更并部署
```

### 手动部署
```bash
# 在GitHub: Actions → Deploy Monorepo → Run workflow
# 输入: all (或 web,bk,fuplan,xinli)
```

## 环境变量

每个应用需要独立的`.env`文件：

```bash
apps/web/.env
apps/bk/.env
apps/fuplan/.env
apps/xinli/.env
```

**重要**: 部署时`.env`文件会被保留，不会被覆盖。

## 健康检查

```bash
# Web应用
curl http://127.0.0.1:3000

# BK应用
curl http://127.0.0.1:3001

# Fuplan应用
curl http://127.0.0.1:3002

# Xinli应用
curl http://127.0.0.1:3003

# PM2状态
pm2 list
pm2 monit
```

## 故障排查

```bash
# 查看日志
pm2 logs member-web --lines 100
pm2 logs member-bk --err

# 重启进程
pm2 restart member-web

# 端口检查
lsof -i :3000
lsof -i :3001
lsof -i :3002
lsof -i :3003

# Nginx检查
sudo nginx -t
sudo systemctl status nginx
```

## 完成状态

### ✅ 已完成

1. ✅ 更新turbo.json配置（增强缓存策略）
2. ✅ 为bk/fuplan/xinli创建package.json
3. ✅ 统一端口配置（3000/3001/3002/3003）
4. ✅ 更新根package.json（添加并行命令）
5. ✅ 优化GitHub Actions（智能检测+独立部署）
6. ✅ PM2配置完善（4个进程）
7. ✅ Nginx配置完善（4个域名）
8. ✅ 创建开发文档（MONOREPO-DEVELOPMENT-GUIDE.md）

### 📋 下一步操作

1. **安装依赖**
   ```bash
   pnpm install
   ```

2. **验证配置**
   ```bash
   pnpm dev:web
   pnpm dev:bk
   pnpm dev:fuplan
   pnpm dev:xinli
   ```

3. **测试构建**
   ```bash
   pnpm build
   ```

4. **配置GitHub Secrets**（如果需要）
   - `DEPLOY_HOST` - 服务器IP
   - `DEPLOY_SSH_KEY` - SSH私钥

5. **服务器部署**
   ```bash
   # 推送代码触发自动部署
   git push origin main

   # 或手动部署
   pm2 start ecosystem.config.monorepo.js --env production
   ```

6. **配置Nginx**
   ```bash
   sudo cp nginx-monorepo.conf /etc/nginx/sites-available/member-system-monorepo
   sudo ln -s /etc/nginx/sites-available/member-system-monorepo /etc/nginx/sites-enabled/
   sudo nginx -t && sudo systemctl reload nginx
   ```

---

**配置完成时间**: 2026-01-24
**版本**: v1.0.0
