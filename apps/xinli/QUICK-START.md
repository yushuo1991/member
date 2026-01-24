# 🚀 心理测评系统 - 快速启动指南

## 一、数据库初始化

```bash
# 1. 登录MySQL
mysql -u root -p

# 2. 创建数据库(如果还没有)
CREATE DATABASE member_system;

# 3. 退出MySQL
exit;

# 4. 导入心理测评表结构
cd C:\Users\yushu\Desktop\我的会员体系
mysql -u root -p member_system < apps/xinli/database-psychology.sql
```

验证表创建:
```sql
USE member_system;
SHOW TABLES LIKE 'user_psychology%';
-- 应该显示3张表:
-- user_psychology_tests
-- user_psychology_answers
-- user_psychology_reports
```

## 二、环境变量配置

```bash
# 1. 复制环境变量模板
cd apps/xinli
cp .env.example .env

# 2. 编辑.env文件
notepad .env  # Windows
# 或
vim .env      # Linux/Mac
```

填入实际配置:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=你的MySQL密码
DB_NAME=member_system

JWT_SECRET=你的JWT密钥
JWT_EXPIRES_IN=7d

NODE_ENV=development
APP_URL=http://localhost:3004
PORT=3004
```

## 三、安装依赖

```bash
# 回到项目根目录
cd C:\Users\yushu\Desktop\我的会员体系

# 安装所有依赖(使用pnpm)
pnpm install

# 或使用npm
npm install
```

## 四、启动开发服务器

### 方式1: 只启动心理测评系统

```bash
pnpm dev:xinli
```

### 方式2: 启动所有应用

```bash
pnpm dev:all
```

启动成功后会看到:
```
ready - started server on 0.0.0.0:3004, url: http://localhost:3004
```

## 五、访问测试

### 1. 打开浏览器

访问: http://localhost:3004

### 2. 测试功能

**首页**:
- [ ] 显示欢迎页面
- [ ] 显示使用说明链接

**权限检查**:
- [ ] 未登录会跳转登录页
- [ ] 登录后检查会员等级

**测评页面** (http://localhost:3004/xinli):
- [ ] 显示场景1
- [ ] 侧边栏导航正常
- [ ] 进度条显示
- [ ] 填写操作/想法输入框
- [ ] 前后导航按钮
- [ ] 键盘快捷键(←/→/Ctrl+S)

**保存功能**:
- [ ] 自动保存(等待30秒)
- [ ] 手动保存按钮
- [ ] 刷新页面后数据仍在

**导出功能**:
- [ ] 点击"导出问卷"下载MD文件

**历史记录** (http://localhost:3004/xinli/history):
- [ ] 显示测评历史
- [ ] 显示进度
- [ ] 导出按钮工作

## 六、常用命令

### 开发相关

```bash
# 启动开发服务器
pnpm dev:xinli

# 类型检查
cd apps/xinli
npm run type-check

# 代码检查
npm run lint
```

### 构建相关

```bash
# 构建生产版本
pnpm build:xinli

# 启动生产服务器
cd apps/xinli
npm start
```

### 清理缓存

```bash
cd apps/xinli
npm run clean

# 或完全清理
rm -rf .next node_modules
npm install
```

## 七、故障排查

### 问题1: 端口被占用

```bash
# Windows - 查找占用端口3004的进程
netstat -ano | findstr :3004

# 结束进程
taskkill /PID <进程ID> /F

# Linux/Mac
lsof -i :3004
kill -9 <PID>
```

### 问题2: 数据库连接失败

检查清单:
- [ ] MySQL服务是否运行
- [ ] .env文件配置是否正确
- [ ] 数据库用户权限是否正确
- [ ] 数据库名称是否正确

### 问题3: 依赖安装失败

```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install

# 或使用pnpm
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### 问题4: 构建失败

```bash
# 清理.next缓存
rm -rf .next
npm run build

# 检查TypeScript错误
npm run type-check
```

## 八、开发工具

### 推荐VSCode扩展

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

### 浏览器开发工具

- React Developer Tools
- Redux DevTools (如果使用)

## 九、API测试

### 使用curl测试

```bash
# 权限检查
curl http://localhost:3004/api/gate/xinli

# 加载数据(需要登录token)
curl -H "Cookie: token=你的JWT" http://localhost:3004/api/psychology/load

# 保存数据
curl -X POST http://localhost:3004/api/psychology/save \
  -H "Content-Type: application/json" \
  -H "Cookie: token=你的JWT" \
  -d '{"answers":[{"scenarioId":1,"operation":"持有","thought":"测试"}]}'
```

### 使用Postman测试

1. 导入API集合
2. 设置环境变量
3. 测试各个端点

## 十、下一步

### 完成基础测试后

1. [ ] 测试完整问卷流程(填写所有80个场景)
2. [ ] 测试导出功能
3. [ ] 测试历史记录
4. [ ] 测试权限控制
5. [ ] 准备生产部署

### 准备部署

参考文档:
- `apps/xinli/README.md` - 详细文档
- `apps/xinli/MIGRATION-REPORT.md` - 迁移报告
- `MONOREPO-DEPLOYMENT.md` - 部署指南

---

## 📞 获取帮助

### 查看日志

```bash
# 开发服务器日志在终端直接显示

# 生产服务器日志
pm2 logs xinli

# 查看最近50行
pm2 logs xinli --lines 50
```

### 常见问题文档

- `apps/xinli/README.md` - 常见问题章节
- `XINLI-MIGRATION-COMPLETE.md` - 完整迁移报告

---

**祝您使用愉快！** 🎯
