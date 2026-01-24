# 渐进式Monorepo迁移 - 快速参考卡片

## 🎯 一句话总结
member-system保持不变继续生产，apps/web并行测试，充分验证后再决定是否切换。

---

## 📋 文档导航（按顺序阅读）

| 文档 | 用途 | 阅读时间 |
|------|------|----------|
| [docs/README.md](./docs/README.md) | 方案总览，开始看这个 | 15分钟 |
| [docs/PROGRESSIVE-MIGRATION-PLAN.md](./docs/PROGRESSIVE-MIGRATION-PLAN.md) | 详细迁移计划 | 30分钟 |
| [docs/DUAL-TRACK-GUIDE.md](./docs/DUAL-TRACK-GUIDE.md) | 日常开发操作手册 | 30分钟 |
| [docs/SWITCH-TIMING.md](./docs/SWITCH-TIMING.md) | 何时可以切换 | 20分钟 |
| [docs/ROLLBACK-PLAN.md](./docs/ROLLBACK-PLAN.md) | 回滚应急方案 | 20分钟 |

---

## 🚀 快速命令

### 开发环境

```bash
# member-system（生产，保持不变）
cd member-system/
npm run dev        # 端口3000

# apps/web（测试，并行开发）
cd apps/web/
pnpm dev           # 端口3001
```

### 辅助脚本

```bash
# 评估是否可以切换（打分系统）
bash scripts/check-migration-readiness.sh

# 紧急回滚到member-system
bash scripts/emergency-rollback.sh

# 同步代码从member-system到apps/web
bash scripts/sync-to-apps-web.sh
```

---

## ⚠️ 核心原则（必须遵守）

| 原则 | 说明 |
|------|------|
| ❌ 不动member-system | 保持生产环境稳定，所有配置和代码不变 |
| ✅ 实验apps/web | 新架构在apps/web测试，问题不影响生产 |
| ✅ 双轨并行 | 两套系统长期并行，member-system主，apps/web备 |
| ✅ 数据驱动决策 | 用评分（≥335/400）而非感觉决定是否切换 |
| ✅ 随时可回滚 | 5分钟内恢复到member-system |
| ✅ 可以放弃 | 验证后发现不适合，继续用member-system也是成功 |

---

## 📊 切换决策标准

**只有满足以下全部条件才能切换**：

| 类别 | 及格线 | 推荐线 |
|------|--------|--------|
| 技术就绪度 | 80分 | 90分 |
| 业务就绪度 | 75分 | 85分 |
| 团队就绪度 | 70分 | 80分 |
| 时机选择 | 60分 | 80分 |
| **总分** | **285分** | **335分** |

**决策规则**：
- 🟢 总分≥335且每项≥推荐线 → 强烈建议切换
- 🟡 总分≥285且每项≥及格线 → 可以考虑切换
- 🔴 总分<285或任一项<及格线 → 不建议切换

---

## 📅 时间表（保守方案）

```
现在          member-system生产 + apps/web测试
  ↓
1-2周         环境搭建和验证
  ↓
3-4周         功能完整性测试
  ↓
5-8周         双轨并行运行
  ↓
9周+          评估切换就绪度（用评分系统）
  ↓
12周+         可能的切换（仅在满足条件时）
  ↓
3-6个月后     保留member-system作为备份
```

**或者：任何阶段发现不适合，直接放弃Monorepo，继续用member-system**

---

## 🆘 常见问题

| 问题 | 答案 |
|------|------|
| apps/web启动失败 | 不影响生产，查看[双轨运行指南](./docs/DUAL-TRACK-GUIDE.md)故障排查 |
| 是否必须切换 | 不必须，可以一直用member-system |
| 何时删除member-system | 至少apps/web生产运行3个月后 |
| 切换后有问题 | 执行`emergency-rollback.sh`，5分钟恢复 |

---

## 🔄 双轨运行架构

```
生产环境（主轨）：
  member-system
    ↓
  端口 3000
    ↓
  yourdomain.com
    ↓
  真实用户流量

测试环境（副轨）：
  apps/web
    ↓
  端口 3001
    ↓
  test.yourdomain.com
    ↓
  仅内部测试
```

---

## 📞 紧急情况处理

### 场景1: apps/web崩溃
```bash
bash scripts/emergency-rollback.sh
# 5分钟内恢复到member-system
```

### 场景2: 不确定是否可以切换
```bash
bash scripts/check-migration-readiness.sh
# 查看评分和建议
```

### 场景3: 需要同步代码
```bash
bash scripts/sync-to-apps-web.sh
# 选择同步范围
```

---

## ✅ 成功定义

**Monorepo成功**：apps/web稳定运行，性能优于member-system，切换顺利
**保持现状成功**：验证后确认member-system已足够好，继续使用

**两种结果都是成功** - 因为都是基于充分测试的明智决策

---

## 🎓 记住这三点

1. **member-system是主角**，apps/web是配角
2. **不要急于切换**，至少测试3个月
3. **可以随时放弃**，Monorepo不是必须的

---

**下一步**：阅读 [docs/README.md](./docs/README.md)（15分钟）

**紧急情况**：`bash scripts/emergency-rollback.sh`

**评估就绪度**：`bash scripts/check-migration-readiness.sh`

---

**创建时间**: 2026-01-24
**版本**: v1.0
**打印此卡片** 并贴在电脑旁边随时参考
