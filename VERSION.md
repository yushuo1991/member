# 版本管理指南

## 当前版本

**v1.1.0** - 管理后台功能增强版本 (2026-01-24)

## 查看所有版本

### 在GitHub上查看
- **Releases页面**: https://github.com/yushuo1991/member/releases
- **Tags页面**: https://github.com/yushuo1991/member/tags

### 使用Git命令
```bash
# 查看所有标签
git tag

# 查看标签详情
git show v1.0.0

# 查看所有发布版本
gh release list
```

## 创建新版本

### 1. 修复Bug发布（PATCH版本）
```bash
# 完成修复后
git add .
git commit -m "fix: 描述修复的问题"
git push origin main

# 创建新版本标签（例如 v1.0.1）
git tag -a v1.0.1 -m "v1.0.1 - Bug修复版本

修复内容：
- 修复xxx问题
- 修复yyy问题
"
git push origin v1.0.1

# 创建GitHub Release
gh release create v1.0.1 \
  --title "v1.0.1 - Bug修复版本" \
  --notes "修复内容..."
```

### 2. 新功能发布（MINOR版本）
```bash
# 完成新功能后
git add .
git commit -m "feat: 添加xxx功能"
git push origin main

# 创建新版本标签（例如 v1.1.0）
git tag -a v1.1.0 -m "v1.1.0 - 新增功能版本

新增功能：
- 添加xxx功能
- 优化yyy功能
"
git push origin v1.1.0

# 创建GitHub Release
gh release create v1.1.0 \
  --title "v1.1.0 - 新增功能版本" \
  --notes "新增内容..."
```

### 3. 重大更新（MAJOR版本）
```bash
# 重大架构变更后
git add .
git commit -m "feat!: 重大架构升级"
git push origin main

# 创建新版本标签（例如 v2.0.0）
git tag -a v2.0.0 -m "v2.0.0 - 重大版本更新

重大变更：
- 数据库架构升级
- API接口变更
- 不兼容的改动
"
git push origin v2.0.0

# 创建GitHub Release
gh release create v2.0.0 \
  --title "v2.0.0 - 重大版本更新" \
  --notes "重大变更..."
```

## 版本回退

### 回退到特定版本
```bash
# 查看可用版本
git tag

# 回退到指定版本
git checkout v1.0.0

# 如果要基于旧版本创建新分支
git checkout -b hotfix-v1.0 v1.0.0
```

### 回滚生产环境
```bash
# SSH到服务器
ssh root@8.153.110.212

# 进入项目目录
cd /www/wwwroot/member-system

# 查看当前版本
git describe --tags

# 回退到指定版本
git fetch --tags
git checkout v1.0.0

# 重新构建和部署
npm ci
npm run build
pm2 restart member-system
```

## 版本命名规范

遵循[语义化版本](https://semver.org/lang/zh-CN/)：

### 格式：MAJOR.MINOR.PATCH

- **MAJOR（主版本号）**: 不兼容的API变更
  - 示例：v1.0.0 → v2.0.0
  - 场景：数据库架构重大变更、API接口不兼容

- **MINOR（次版本号）**: 向下兼容的功能新增
  - 示例：v1.0.0 → v1.1.0
  - 场景：新增功能、优化现有功能（不破坏兼容性）

- **PATCH（修订号）**: 向下兼容的问题修复
  - 示例：v1.0.0 → v1.0.1
  - 场景：Bug修复、安全补丁、小优化

### 预发布版本
- `v1.1.0-alpha.1` - Alpha测试版（内部测试）
- `v1.1.0-beta.1` - Beta测试版（公开测试）
- `v1.1.0-rc.1` - Release Candidate（候选版本）

## 提交信息规范

使用[约定式提交](https://www.conventionalcommits.org/zh-hans/)：

```
<类型>[可选的作用域]: <描述>

[可选的正文]

[可选的脚注]
```

### 常用类型
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式（不影响代码运行）
- `refactor`: 重构（既不是新增功能，也不是修复bug）
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 示例
```bash
feat: 添加用户导出功能
fix: 修复会员列表分页错误
docs: 更新API文档
chore: 升级依赖版本
```

## 更新日志

所有版本的详细变更记录在 `CHANGELOG.md` 文件中。

每次发布新版本时，应更新此文件：
1. 在顶部添加新版本段落
2. 记录所有重要变更
3. 分类：新增/修复/变更/废弃/移除/安全

## 版本历史

| 版本 | 发布日期 | 说明 |
|------|---------|------|
| v1.1.0 | 2026-01-24 | 管理后台功能增强版本 |
| v1.0.0 | 2026-01-24 | 首个稳定版本 |

## 相关文档

- **CHANGELOG.md** - 详细的版本更新日志
- **README.md** - 项目说明文档
- **DEPLOYMENT.md** - 部署流程文档

## 快速链接

- **GitHub Releases**: https://github.com/yushuo1991/member/releases
- **GitHub Tags**: https://github.com/yushuo1991/member/tags
- **GitHub Actions**: https://github.com/yushuo1991/member/actions

---

**最后更新**: 2026-01-24
**维护者**: yushuo1991
