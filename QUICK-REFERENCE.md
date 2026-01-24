# Monorepo迁移速查卡

---

## 📋 3种方案对比（30秒决策）

| 方案 | 成本 | 收益 | 推荐度 |
|------|------|------|--------|
| **A: Monorepo** | 1-2周 | ⭐⭐⭐⭐⭐ | 🟢 **强烈推荐** |
| B: Submodules | 3-5天 | ⭐⭐⭐ | 🟡 备选 |
| C: API集成 | 1-2天 | ⭐⭐ | 🔴 不推荐 |

**结论：选择方案A（Monorepo）**

---

## ⏱️ 7天执行计划

| Day | 任务 | 产出 |
|-----|------|------|
| 1 | 搭建Monorepo骨架 + 共享包 | 基础架构 |
| 2 | 会员系统 + 心理测评 | 2个apps |
| 3-4 | 复盘系统（数据迁移） | Supabase→MySQL |
| 5 | 板块节奏系统 | Pages→App Router |
| 6 | CI/CD配置 | 自动化部署 |
| 7 | 测试优化发布 | 系统上线 |

---

## 🛠️ 常用命令

### 开发
```bash
pnpm dev                              # 启动所有apps
pnpm --filter @yushuo/web dev         # 单独启动web
pnpm build                            # 构建所有apps
```

### 依赖管理
```bash
pnpm add react                        # 添加到根
pnpm --filter @yushuo/web add axios   # 添加到web app
```

### 部署
```bash
gh workflow run deploy-monorepo.yml   # 手动触发部署
pm2 logs member-web --lines 50        # 查看日志
```

---

## 🚨 故障排查（1分钟解决）

### 问题1：pnpm install失败
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 问题2：Turborepo缓存问题
```bash
rm -rf .turbo
pnpm turbo run build --force
```

### 问题3：端口被占用
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -i :3000 | kill -9 <PID>
```

---

## 🔙 5分钟回滚方案

```bash
# 1. SSH登录
ssh root@server

# 2. 停止新服务
pm2 stop all

# 3. 恢复旧版本
mv /www/wwwroot/member-system.backup /www/wwwroot/member-system

# 4. 重启
pm2 start ecosystem.config.js
```

---

## ✅ 完成检查清单

**迁移前：**
- [ ] 备份所有仓库（创建backup分支）
- [ ] 备份数据库
- [ ] 安装pnpm 8+

**迁移中：**
- [ ] Day 1: Monorepo结构可用
- [ ] Day 2: 2个apps运行正常
- [ ] Day 4: 数据迁移验证通过
- [ ] Day 6: CI/CD部署成功
- [ ] Day 7: 系统上线监控正常

**迁移后：**
- [ ] 所有页面正常访问
- [ ] 认证功能正常
- [ ] 首屏加载 < 2秒
- [ ] TypeScript无错误
- [ ] Lighthouse评分 > 90

---

## 📊 预期收益速览

| 指标 | 改善 |
|------|------|
| 代码复用率 | 0% → 70% |
| 维护成本 | ⬇️ 60% |
| 新功能开发 | ⬆️ 50% |
| Bug修复 | ⬇️ 40% |
| 部署时间 | ⬇️ 50% |

---

## 📚 文档索引

| 文档 | 内容 | 适用对象 |
|------|------|---------|
| **ARCHITECTURE-ANALYSIS.md** | 详细技术方案（60页） | 架构师 |
| **MIGRATION-GUIDE.md** | 实操手册 | 开发者 |
| **CODE-ORGANIZATION.md** | 代码规范 | 所有开发者 |
| **README-INTEGRATION.md** | 项目总结 | 所有人 |
| **本文档** | 速查卡 | 快速参考 |

---

## 🎯 关键数字

- **迁移时间：** 8-14天
- **投资回报：** 3个月回本
- **代码复用：** 70-80%
- **维护降低：** 40-60%
- **效率提升：** 50%+

---

## 💡 一句话总结

**投入1-2周，换来长期40-60%维护成本降低和50%+开发效率提升！**

---

*快速参考卡 v1.0 | 2026-01-24*
