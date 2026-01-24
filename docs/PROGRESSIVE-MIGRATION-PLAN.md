# 渐进式Monorepo迁移方案

## 📋 总体原则

**零风险、渐进式、双轨并行**

- ✅ member-system 完全不动，继续生产使用
- ✅ apps/web 作为新架构实验环境
- ✅ 两套系统可以独立部署
- ✅ 随时可以回滚到原系统
- ✅ 新系统稳定后再切换

---

## 🎯 迁移目标

### 长期目标
1. 统一多个系统（member、bk、fuplan、xinli）到一个Monorepo
2. 共享代码复用（auth、database、ui组件）
3. 统一构建和部署流程
4. 提高开发效率

### 短期目标（当前阶段）
1. ✅ 保持member-system正常运行
2. ✅ 在apps/web中复制并测试新架构
3. ✅ 验证Monorepo可行性
4. ⏳ 积累经验，等待时机切换

---

## 📁 目录结构设计

### 当前状态（保持不变）

```
我的会员体系/
├── member-system/              # 🟢 生产环境，继续使用
│   ├── src/
│   ├── public/
│   ├── package.json
│   ├── .env                    # 生产配置
│   ├── database-init-v3.sql
│   └── ecosystem.config.js     # PM2配置
├── .github/
│   └── workflows/
│       └── deploy-optimized.yml  # 🟢 当前部署流程
└── ... (其他文件保持不变)
```

### 新增Monorepo结构（并行开发）

```
我的会员体系/
├── member-system/              # 🟢 继续使用（原封不动）
│
├── apps/                       # 🆕 新架构
│   └── web/                    # member-system的副本
│       ├── src/                # 从member-system复制
│       ├── public/
│       ├── package.json
│       ├── .env.example        # 示例配置
│       └── ecosystem.config.js
│
├── packages/                   # 🆕 共享包（暂未使用）
│   ├── ui/                     # UI组件库
│   ├── auth/                   # 认证逻辑
│   ├── database/               # 数据库工具
│   ├── config/                 # 配置管理
│   └── utils/                  # 工具函数
│
├── .github/
│   └── workflows/
│       ├── deploy-optimized.yml      # 🟢 部署member-system（主）
│       └── deploy-monorepo.yml       # 🔵 部署apps/web（备用）
│
├── docs/                       # 🆕 文档
│   ├── PROGRESSIVE-MIGRATION-PLAN.md    # 迁移计划
│   ├── DUAL-TRACK-GUIDE.md              # 双轨运行指南
│   ├── SWITCH-TIMING.md                 # 切换时机建议
│   └── ROLLBACK-PLAN.md                 # 回滚方案
│
├── pnpm-workspace.yaml         # PNPM工作区配置
├── turbo.json                  # Turborepo配置
└── package.json                # 根package.json
```

---

## 🔄 迁移阶段规划

### 阶段0：准备阶段（已完成）
- [x] 分析现有架构
- [x] 设计Monorepo结构
- [x] 创建迁移文档

### 阶段1：环境搭建（1-2天）
**目标**: 建立Monorepo基础环境，不影响生产

#### 任务清单
- [ ] 保留member-system完整不动
- [ ] 创建apps/web（完整复制member-system）
- [ ] 创建packages基础结构
- [ ] 配置pnpm workspace
- [ ] 配置Turborepo
- [ ] 测试本地开发环境

#### 验证标准
```bash
# member-system继续工作
cd member-system
npm run dev        # ✅ 正常启动

# apps/web也能工作
cd apps/web
pnpm dev           # ✅ 正常启动（端口3001）
```

### 阶段2：代码提取（1周）
**目标**: 将通用代码提取到packages，apps/web使用新包

#### 任务清单
- [ ] 提取@repo/database（数据库工具）
- [ ] 提取@repo/auth（认证逻辑）
- [ ] 提取@repo/ui（UI组件）
- [ ] 提取@repo/utils（工具函数）
- [ ] 更新apps/web导入路径
- [ ] 完整功能测试

#### 验证标准
- [ ] apps/web所有功能正常
- [ ] 登录/注册正常
- [ ] 会员系统正常
- [ ] 管理后台正常
- [ ] 数据库操作正常

**重要**: member-system保持不变，不使用新包

### 阶段3：双轨运行（2-4周）
**目标**: 两套系统并行运行，积累经验

#### 运行模式

**模式A：生产环境（当前）**
- 部署：member-system → /www/wwwroot/member-system
- 端口：3000
- 域名：production.domain.com
- GitHub Actions: deploy-optimized.yml
- 用户访问：✅ 生产流量

**模式B：测试环境（新）**
- 部署：apps/web → /www/wwwroot/member-system-test
- 端口：3001
- 域名：test.domain.com（可选）
- GitHub Actions: deploy-monorepo.yml (手动触发)
- 用户访问：仅内部测试

#### 任务清单
- [ ] 配置apps/web独立部署流程
- [ ] 设置独立PM2进程（member-web-test）
- [ ] 配置独立测试数据库（可选）
- [ ] 每周同步功能更新到两个系统
- [ ] 收集问题和性能数据

#### 监控指标
- [ ] apps/web启动成功率
- [ ] 内存占用对比
- [ ] 构建时间对比
- [ ] 功能完整性检查

### 阶段4：灰度切换（待定）
**目标**: 逐步将流量切换到apps/web

#### 前置条件（全部满足才能切换）
- [ ] apps/web稳定运行超过2周
- [ ] 所有功能测试通过
- [ ] 性能指标不低于member-system
- [ ] 已有完整回滚方案
- [ ] 团队成员熟悉新架构

#### 切换步骤
1. **准备阶段**
   - [ ] 备份member-system代码和数据库
   - [ ] 准备回滚脚本
   - [ ] 通知相关人员

2. **切换阶段**
   - [ ] Nginx配置切换端口（3000→3001）
   - [ ] 停止member-system PM2进程
   - [ ] 启动apps/web PM2进程（端口3000）
   - [ ] 验证访问正常

3. **验证阶段**
   - [ ] 核心功能测试
   - [ ] 监控系统日志
   - [ ] 收集用户反馈
   - [ ] 观察24小时

4. **确认阶段**
   - [ ] 确认无严重问题
   - [ ] 更新主部署流程
   - [ ] 归档member-system代码

### 阶段5：完全迁移（未来）
**目标**: 整合所有子系统

#### 长期规划
- [ ] 迁移bk系统到apps/bk
- [ ] 迁移fuplan系统到apps/fuplan
- [ ] 迁移xinli系统到apps/xinli
- [ ] 统一认证和权限
- [ ] 统一数据库管理
- [ ] 统一部署流程

---

## 🔀 双轨运行指南

### 开发流程

#### 新功能开发
```bash
# 选择A: 在member-system开发（生产优先）
cd member-system
# 开发、测试、部署

# 选择B: 在apps/web开发（新架构测试）
cd apps/web
# 开发、测试，手动部署到测试环境
```

#### Bug修复
```bash
# 紧急Bug: 只修member-system
cd member-system
# 修复、测试、立即部署

# 非紧急Bug: 同步修复两个系统
cd member-system && 修复
cd apps/web && 修复
```

#### 代码同步策略
- **功能新增**: 优先在member-system开发 → 验证稳定 → 同步到apps/web
- **Bug修复**: member-system修复 → 立即部署 → 同步到apps/web
- **架构优化**: 在apps/web实验 → 验证可行 → 反向同步到member-system（可选）

### 部署流程

#### 生产部署（member-system）
```bash
# 自动部署（GitHub Actions）
git add member-system/
git commit -m "feat: 新功能"
git push origin main
# → 触发 deploy-optimized.yml
# → 自动部署到 /www/wwwroot/member-system

# 手动部署
ssh root@server
cd /www/wwwroot/member-system
git pull
npm install
npm run build
pm2 restart member-system
```

#### 测试部署（apps/web）
```bash
# 手动触发GitHub Actions
# 在GitHub仓库页面: Actions → Deploy Monorepo → Run workflow

# 或SSH手动部署
ssh root@server
cd /www/wwwroot/member-system-test
git pull
pnpm install
pnpm build
pm2 restart member-web-test
```

### 环境隔离

#### 端口分配
- member-system: 3000（生产）
- apps/web: 3001（测试）

#### PM2进程名
- member-system: `member-system`
- apps/web: `member-web-test`

#### 数据库
**选项A: 共享数据库（推荐初期）**
- 两个系统使用同一个数据库
- 优点：数据一致，易于测试
- 缺点：测试可能影响生产数据

**选项B: 独立测试数据库（推荐后期）**
- member-system: `member_system`（生产）
- apps/web: `member_system_test`（测试）
- 定期从生产同步数据到测试

---

## ⏰ 切换时机建议

### 🟢 可以切换的信号
1. ✅ apps/web稳定运行超过2周无重大问题
2. ✅ 所有功能测试通过（登录、会员、管理后台等）
3. ✅ 性能指标正常（启动时间、内存、响应速度）
4. ✅ 团队成员熟悉新架构
5. ✅ 已有详细回滚方案
6. ✅ 选择低峰期（如周末或夜间）

### 🔴 不应该切换的信号
1. ❌ apps/web出现随机崩溃
2. ❌ 功能测试未完成或有失败
3. ❌ 性能明显低于member-system
4. ❌ 团队成员不熟悉新架构
5. ❌ 业务高峰期或重要活动前
6. ❌ 没有回滚方案

### 推荐切换时间表

**乐观场景（4-6周）**
- 第1周：环境搭建和代码提取
- 第2-3周：功能测试和性能验证
- 第4周：内部试用和问题修复
- 第5周：准备切换
- 第6周：正式切换

**保守场景（8-12周）**
- 第1-2周：环境搭建
- 第3-6周：代码提取和测试
- 第7-10周：双轨运行和观察
- 第11周：准备切换
- 第12周：正式切换

**稳健场景（建议）**
- 先运行3个月，充分验证
- 期间持续完善和优化
- 确保万无一失再切换

---

## 🔙 回滚方案

### 快速回滚（5分钟内）

**场景**: apps/web切换后出现严重问题

#### 步骤
```bash
# 1. SSH登录服务器
ssh root@server

# 2. 切换Nginx回member-system
cd /etc/nginx/sites-available
# 编辑配置，端口改回3000

# 3. 重启member-system进程
pm2 restart member-system

# 4. 停止apps/web进程
pm2 stop member-web-test

# 5. 重载Nginx
nginx -t && systemctl reload nginx

# 6. 验证
curl http://localhost:3000
```

#### 预准备回滚脚本
```bash
# 创建 rollback.sh
#!/bin/bash
set -e

echo "⚠️  开始回滚到member-system..."

# 停止新进程
pm2 stop member-web-test || true

# 启动旧进程
pm2 restart member-system

# Nginx切换（需手动修改配置文件）
echo "📝 请手动切换Nginx端口到3000"
echo "   编辑: /etc/nginx/sites-available/member-system"
echo "   修改: proxy_pass http://localhost:3000;"
echo "   执行: nginx -t && systemctl reload nginx"

# 验证
sleep 2
curl -I http://localhost:3000

echo "✅ 回滚完成！"
```

### 数据库回滚

**如果修改了数据库结构**

```bash
# 1. 恢复数据库备份
mysql -u root -p member_system < backup_before_migration.sql

# 2. 或使用时间点恢复
# （需要提前配置MySQL binlog）
```

### GitHub Actions回滚

```bash
# 1. 修改 deploy-optimized.yml
# 确保触发路径只包含member-system

# 2. 禁用 deploy-monorepo.yml
# 在工作流文件中添加条件跳过
```

---

## 📊 风险评估

### 高风险项（需要特别注意）

| 风险项 | 影响程度 | 可能性 | 缓解措施 |
|--------|---------|--------|----------|
| 数据库兼容性问题 | 🔴 高 | 🟡 中 | 共享数据库架构，先测试后切换 |
| 性能下降 | 🔴 高 | 🟡 中 | 性能测试，监控对比 |
| 功能遗漏 | 🟡 中 | 🟡 中 | 完整功能测试清单 |
| 环境变量配置错误 | 🟡 中 | 🟢 低 | 对比检查.env文件 |

### 低风险项（相对安全）

| 风险项 | 影响程度 | 可能性 | 原因 |
|--------|---------|--------|------|
| 构建失败 | 🟢 低 | 🟢 低 | 本地已测试通过 |
| 部署失败 | 🟢 低 | 🟢 低 | 有完整回滚方案 |
| 代码冲突 | 🟢 低 | 🟢 低 | member-system保持独立 |

---

## ✅ 测试清单

### 功能测试

#### 用户端
- [ ] 用户注册
- [ ] 用户登录
- [ ] 忘记密码
- [ ] 会员升级
- [ ] 激活码兑换
- [ ] 试用功能
- [ ] 产品访问权限检查

#### 管理端
- [ ] 管理员登录
- [ ] 会员列表查看
- [ ] 会员信息编辑
- [ ] 会员冻结/解冻
- [ ] 激活码生成
- [ ] 激活码查询
- [ ] 数据统计

#### 产品功能
- [ ] 板块节奏系统
- [ ] 心理测评系统
- [ ] 复盘系统
- [ ] 学习圈访问

### 性能测试

#### 启动时间
```bash
# member-system
time npm run start
# 记录时间: ___ 秒

# apps/web
time pnpm start
# 记录时间: ___ 秒
```

#### 内存占用
```bash
pm2 list
# 记录member-system内存
# 记录member-web-test内存
```

#### 响应时间
```bash
# 首页加载
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001

# API响应
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3000/api/auth/me
curl -w "@curl-format.txt" -o /dev/null -s http://localhost:3001/api/auth/me
```

### 兼容性测试

- [ ] 数据库架构一致
- [ ] 环境变量完整
- [ ] 所有依赖安装成功
- [ ] TypeScript编译通过
- [ ] ESLint检查通过

---

## 📝 文档和沟通

### 必要文档
1. ✅ 本迁移计划文档
2. ⏳ 双轨运行操作手册
3. ⏳ 切换检查清单
4. ⏳ 回滚操作手册
5. ⏳ 团队培训材料

### 沟通计划
- **启动前**: 说明迁移计划和时间表
- **过程中**: 每周同步进度和问题
- **切换前**: 详细说明切换步骤和影响
- **切换后**: 收集反馈和问题

---

## 🎓 经验总结（持续更新）

### 已知问题
（待在实施过程中补充）

### 最佳实践
（待在实施过程中补充）

### 避坑指南
（待在实施过程中补充）

---

## 📅 时间线总结

```
当前（第0周）
├── member-system 生产运行 ✅
└── apps/web 已创建 ✅

第1-2周：环境搭建
├── 完善apps/web配置
├── 配置packages基础
└── 本地开发测试

第3-4周：代码提取
├── 提取共享包
├── 更新导入路径
└── 功能完整测试

第5-8周：双轨运行
├── 独立部署测试环境
├── 持续功能同步
├── 性能监控对比
└── 问题收集修复

第9周+：准备切换
├── 全面测试
├── 准备回滚方案
├── 选择切换时机
└── 正式切换（待定）

长期：
└── 考虑整合其他子系统
```

---

## 🎯 成功标准

### 迁移成功的定义
1. ✅ apps/web独立稳定运行
2. ✅ 所有功能正常工作
3. ✅ 性能不低于member-system
4. ✅ 团队掌握新架构
5. ✅ 无需依赖member-system

### 可以宣布成功的时机
- apps/web生产运行超过1个月
- 无严重问题和回滚
- 用户体验无差异
- 团队信心充足

---

## 📞 联系和支持

### 遇到问题时
1. 查看本文档和相关文档
2. 检查系统日志（PM2、Nginx、MySQL）
3. 对比member-system和apps/web配置
4. 必要时执行回滚方案

### 文档位置
- 迁移计划：`docs/PROGRESSIVE-MIGRATION-PLAN.md`
- 双轨运行指南：`docs/DUAL-TRACK-GUIDE.md`（待创建）
- 切换时机建议：`docs/SWITCH-TIMING.md`（待创建）
- 回滚方案：`docs/ROLLBACK-PLAN.md`（待创建）

---

**最后更新**: 2026-01-24
**文档版本**: v1.0
**状态**: 📝 计划阶段
