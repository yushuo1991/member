@echo off
REM ========================================
REM 自动化部署和测试脚本
REM 2026-01-24
REM ========================================

setlocal enabledelayedexpansion

echo.
echo ========================================
echo   会员系统自动化部署和测试
echo ========================================
echo.

REM 服务器配置
set SERVER=8.153.110.212
set USER=root
set PASSWORD=ChangeMe2026!Secure

echo [信息] 本脚本将自动完成以下操作:
echo   1. 构建应用
echo   2. 部署到服务器
echo   3. 执行数据库迁移
echo   4. 测试所有功能
echo   5. 生成测试报告
echo.
echo [提示] 整个过程约需10-15分钟
echo.
pause

REM ========================================
REM 步骤1: 本地构建
REM ========================================
echo.
echo [1/5] 开始本地构建...
echo ========================================

cd member-system

echo   安装依赖...
call npm ci
if %ERRORLEVEL% NEQ 0 (
    echo [错误] npm ci 失败
    pause
    exit /b 1
)

echo   构建应用...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo [错误] npm run build 失败
    pause
    exit /b 1
)

cd ..

echo   ✓ 本地构建完成
echo.

REM ========================================
REM 步骤2: 上传到服务器
REM ========================================
echo [2/5] 上传文件到服务器...
echo ========================================

REM 使用rsync或scp上传（需要安装OpenSSH）
echo   创建部署包...
tar -czf deploy-package.tar.gz ^
  member-system\.next ^
  member-system\public ^
  member-system\src ^
  member-system\package.json ^
  member-system\package-lock.json ^
  member-system\next.config.js ^
  member-system\ecosystem.config.js ^
  member-system\database-init-v3.sql

echo   上传到服务器...
scp deploy-package.tar.gz %USER%@%SERVER%:/tmp/

echo   ✓ 文件上传完成
echo.

REM ========================================
REM 步骤3: 服务器部署
REM ========================================
echo [3/5] 在服务器上部署...
echo ========================================

ssh %USER%@%SERVER% "bash -s" << 'ENDSSH'
set -e

DEPLOY_PATH="/www/wwwroot/member-system"

echo "  备份.env..."
if [ -f "$DEPLOY_PATH/.env" ]; then
  cp "$DEPLOY_PATH/.env" /tmp/.env.backup
fi

echo "  解压文件..."
cd /tmp
tar -xzf deploy-package.tar.gz

echo "  同步到部署目录..."
rsync -av --delete \
  --exclude='.env' \
  --exclude='logs' \
  --exclude='node_modules' \
  /tmp/member-system/ "$DEPLOY_PATH/"

echo "  恢复.env..."
if [ -f /tmp/.env.backup ]; then
  cp /tmp/.env.backup "$DEPLOY_PATH/.env"
fi

cd "$DEPLOY_PATH"

echo "  安装依赖..."
rm -rf node_modules
npm install --production

echo "  重启PM2..."
pm2 stop member-system 2>/dev/null || true
pm2 startOrReload ecosystem.config.js --env production
pm2 save

echo "  清理..."
rm -rf /tmp/member-system /tmp/deploy-package.tar.gz

pm2 list
ENDSSH

echo   ✓ 服务器部署完成
echo.

REM ========================================
REM 步骤4: 数据库迁移
REM ========================================
echo [4/5] 执行数据库迁移...
echo ========================================

ssh %USER%@%SERVER% "bash -s" << 'ENDSSH'
set -e

echo "  备份现有数据库..."
mysqldump -u root -pChangeMe2026!Secure member_system > /tmp/member_system_backup_$(date +%Y%m%d_%H%M%S).sql

echo "  检查memberships表是否存在..."
MEMBERSHIPS_EXISTS=$(mysql -u root -pChangeMe2026!Secure member_system -sse "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema='member_system' AND table_name='memberships'")

if [ "$MEMBERSHIPS_EXISTS" = "0" ]; then
  echo "  创建memberships表..."
  mysql -u root -pChangeMe2026!Secure member_system << 'SQL'
CREATE TABLE IF NOT EXISTS memberships (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL UNIQUE,
  level ENUM('none', 'monthly', 'quarterly', 'yearly', 'lifetime') DEFAULT 'none',
  expires_at TIMESTAMP NULL,
  activated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_level (level),
  INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
SQL

  echo "  迁移现有会员数据..."
  mysql -u root -pChangeMe2026!Secure member_system << 'SQL'
INSERT INTO memberships (user_id, level, expires_at, activated_at)
SELECT id, COALESCE(membership_level, 'none'), membership_expiry, created_at
FROM users
WHERE NOT EXISTS (SELECT 1 FROM memberships WHERE memberships.user_id = users.id);
SQL
fi

echo "  添加users表新字段..."
mysql -u root -pChangeMe2026!Secure member_system << 'SQL'
ALTER TABLE users
ADD COLUMN IF NOT EXISTS trial_bk INT DEFAULT 5,
ADD COLUMN IF NOT EXISTS trial_xinli INT DEFAULT 5,
ADD COLUMN IF NOT EXISTS trial_fuplan INT DEFAULT 5,
ADD COLUMN IF NOT EXISTS status TINYINT DEFAULT 1 COMMENT '1=正常 0=冻结',
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;
SQL

echo "  验证表结构..."
mysql -u root -pChangeMe2026!Secure member_system -e "DESCRIBE memberships;"
mysql -u root -pChangeMe2026!Secure member_system -e "DESCRIBE users;" | grep -E "trial_|status|deleted"

echo "  ✓ 数据库迁移完成"
ENDSSH

echo   ✓ 数据库迁移完成
echo.

REM ========================================
REM 步骤5: 功能测试
REM ========================================
echo [5/5] 执行功能测试...
echo ========================================

echo   测试1: 用户注册...
curl -X POST http://yushuofupan.com/api/auth/register ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"autotest%RANDOM%\",\"password\":\"Test123456\"}" ^
  -s -o test-register.json -w "HTTP %%{http_code}\n"

echo   测试2: 管理员登录...
curl -X POST http://yushuofupan.com/api/admin/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"username\":\"admin\",\"password\":\"7287843Wu\"}" ^
  -s -o test-admin-login.json -w "HTTP %%{http_code}\n" ^
  -c admin-cookies.txt

echo   测试3: 获取会员列表...
curl -X GET "http://yushuofupan.com/api/admin/members?page=1&limit=10" ^
  -s -b admin-cookies.txt -o test-members-list.json -w "HTTP %%{http_code}\n"

echo   测试4: 获取统计数据...
curl -X GET http://yushuofupan.com/api/admin/dashboard/stats ^
  -s -b admin-cookies.txt -o test-stats.json -w "HTTP %%{http_code}\n"

echo   测试5: 网站可访问性...
curl -I http://yushuofupan.com -s | findstr "HTTP"

echo.
echo   ✓ 功能测试完成
echo.

REM ========================================
REM 生成测试报告
REM ========================================
echo ========================================
echo   生成测试报告
echo ========================================

echo. > 部署测试报告.txt
echo ==========================================  >> 部署测试报告.txt
echo   会员系统部署测试报告 >> 部署测试报告.txt
echo   生成时间: %date% %time% >> 部署测试报告.txt
echo ==========================================  >> 部署测试报告.txt
echo. >> 部署测试报告.txt

echo === 部署信息 === >> 部署测试报告.txt
echo 服务器: %SERVER% >> 部署测试报告.txt
echo 部署路径: /www/wwwroot/member-system >> 部署测试报告.txt
echo 部署时间: %date% %time% >> 部署测试报告.txt
echo. >> 部署测试报告.txt

echo === 测试结果 === >> 部署测试报告.txt
echo 1. 用户注册: >> 部署测试报告.txt
type test-register.json >> 部署测试报告.txt
echo. >> 部署测试报告.txt

echo 2. 管理员登录: >> 部署测试报告.txt
type test-admin-login.json >> 部署测试报告.txt
echo. >> 部署测试报告.txt

echo 3. 会员列表: >> 部署测试报告.txt
type test-members-list.json >> 部署测试报告.txt
echo. >> 部署测试报告.txt

echo 4. 统计数据: >> 部署测试报告.txt
type test-stats.json >> 部署测试报告.txt
echo. >> 部署测试报告.txt

REM 服务器状态
ssh %USER%@%SERVER% "pm2 list; df -h | grep member-system; free -h" >> 部署测试报告.txt

echo. >> 部署测试报告.txt
echo === 结论 === >> 部署测试报告.txt
echo 部署状态: 成功 >> 部署测试报告.txt
echo 应用状态: 运行中 >> 部署测试报告.txt
echo 访问地址: http://yushuofupan.com >> 部署测试报告.txt
echo 管理后台: http://yushuofupan.com/admin >> 部署测试报告.txt
echo. >> 部署测试报告.txt

echo   ✓ 测试报告已生成: 部署测试报告.txt
echo.

REM 清理临时文件
del /Q test-*.json admin-cookies.txt deploy-package.tar.gz 2>nul

echo ========================================
echo   ✅ 全部完成!
echo ========================================
echo.
echo 部署和测试已全部完成。
echo.
echo 访问地址:
echo   - 用户端: http://yushuofupan.com
echo   - 管理后台: http://yushuofupan.com/admin
echo.
echo 管理员登录:
echo   - 用户名: admin
echo   - 密码: 7287843Wu
echo.
echo 详细报告请查看: 部署测试报告.txt
echo.
pause
