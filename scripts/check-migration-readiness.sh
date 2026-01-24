#!/bin/bash
# check-migration-readiness.sh
# 检查迁移就绪度评分脚本
# 使用方法: bash check-migration-readiness.sh

echo "🎯 ===== Monorepo迁移就绪度评估 ====="
echo ""

# 评分变量
TECH_SCORE=0
BUSINESS_SCORE=0
TEAM_SCORE=0
TIMING_SCORE=0

# 检查apps/web是否存在
echo "📋 检查基础环境..."
echo ""

if [ ! -d "apps/web" ]; then
    echo "❌ apps/web目录不存在"
    exit 1
fi

echo "✅ apps/web目录存在"
echo ""

# ===== 技术就绪度检查 (100分) =====
echo "🔧 ===== 技术就绪度检查 (满分100分) ====="
echo ""

# 1. 稳定性指标 (30分)
echo "1️⃣ 稳定性指标 (30分):"
read -p "   apps/web连续运行超过2周无崩溃? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TECH_SCORE=$((TECH_SCORE + 10))
    echo "   ✅ +10分"
else
    echo "   ❌ +0分"
fi

read -p "   内存泄漏测试通过（24小时稳定）? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TECH_SCORE=$((TECH_SCORE + 10))
    echo "   ✅ +10分"
else
    echo "   ❌ +0分"
fi

read -p "   错误率 < 0.1%? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TECH_SCORE=$((TECH_SCORE + 10))
    echo "   ✅ +10分"
else
    echo "   ❌ +0分"
fi

echo ""

# 2. 性能指标 (30分)
echo "2️⃣ 性能指标 (30分):"
read -p "   启动时间达标（≤member-system+10%）? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TECH_SCORE=$((TECH_SCORE + 6))
    echo "   ✅ +6分"
else
    echo "   ❌ +0分"
fi

read -p "   内存占用达标（≤member-system+20%）? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TECH_SCORE=$((TECH_SCORE + 6))
    echo "   ✅ +6分"
else
    echo "   ❌ +0分"
fi

read -p "   API响应时间达标（≤member-system+15%）? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TECH_SCORE=$((TECH_SCORE + 6))
    echo "   ✅ +6分"
else
    echo "   ❌ +0分"
fi

read -p "   首页加载时间达标（≤member-system+10%）? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TECH_SCORE=$((TECH_SCORE + 6))
    echo "   ✅ +6分"
else
    echo "   ❌ +0分"
fi

read -p "   并发处理能力达标（≥member-system）? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TECH_SCORE=$((TECH_SCORE + 6))
    echo "   ✅ +6分"
else
    echo "   ❌ +0分"
fi

echo ""

# 3. 功能完整性 (25分)
echo "3️⃣ 功能完整性 (25分):"
read -p "   核心功能全部通过（登录、注册、会员系统等）? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TECH_SCORE=$((TECH_SCORE + 15))
    echo "   ✅ +15分"
else
    echo "   ❌ +0分"
fi

read -p "   管理功能全部通过（会员管理、激活码管理）? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TECH_SCORE=$((TECH_SCORE + 10))
    echo "   ✅ +10分"
else
    echo "   ❌ +0分"
fi

echo ""

# 4. 兼容性和安全性 (15分)
echo "4️⃣ 兼容性和安全性 (15分):"
read -p "   数据库100%兼容? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TECH_SCORE=$((TECH_SCORE + 5))
    echo "   ✅ +5分"
else
    echo "   ❌ +0分"
fi

read -p "   API端点和响应格式一致? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TECH_SCORE=$((TECH_SCORE + 5))
    echo "   ✅ +5分"
else
    echo "   ❌ +0分"
fi

read -p "   安全检查全部通过? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TECH_SCORE=$((TECH_SCORE + 5))
    echo "   ✅ +5分"
else
    echo "   ❌ +0分"
fi

echo ""
echo "📊 技术就绪度得分: $TECH_SCORE / 100"
echo ""

# ===== 业务就绪度检查 (100分) =====
echo "💼 ===== 业务就绪度检查 (满分100分) ====="
echo ""

# 1. 数据准备 (40分)
echo "1️⃣ 数据准备 (40分):"
read -p "   生产数据库完整备份? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    BUSINESS_SCORE=$((BUSINESS_SCORE + 20))
    echo "   ✅ +20分"
else
    echo "   ❌ +0分"
fi

read -p "   备份验证成功（可恢复）? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    BUSINESS_SCORE=$((BUSINESS_SCORE + 10))
    echo "   ✅ +10分"
else
    echo "   ❌ +0分"
fi

read -p "   数据一致性检查通过? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    BUSINESS_SCORE=$((BUSINESS_SCORE + 10))
    echo "   ✅ +10分"
else
    echo "   ❌ +0分"
fi

echo ""

# 2. 流量准备 (30分)
echo "2️⃣ 流量准备 (30分):"
read -p "   并发测试通过? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    BUSINESS_SCORE=$((BUSINESS_SCORE + 15))
    echo "   ✅ +15分"
else
    echo "   ❌ +0分"
fi

read -p "   流量激增场景测试通过? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    BUSINESS_SCORE=$((BUSINESS_SCORE + 15))
    echo "   ✅ +15分"
else
    echo "   ❌ +0分"
fi

echo ""

# 3. 监控准备 (30分)
echo "3️⃣ 监控准备 (30分):"
read -p "   应用监控配置完成? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    BUSINESS_SCORE=$((BUSINESS_SCORE + 10))
    echo "   ✅ +10分"
else
    echo "   ❌ +0分"
fi

read -p "   错误报警配置完成? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    BUSINESS_SCORE=$((BUSINESS_SCORE + 10))
    echo "   ✅ +10分"
else
    echo "   ❌ +0分"
fi

read -p "   日志收集配置完成? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    BUSINESS_SCORE=$((BUSINESS_SCORE + 10))
    echo "   ✅ +10分"
else
    echo "   ❌ +0分"
fi

echo ""
echo "📊 业务就绪度得分: $BUSINESS_SCORE / 100"
echo ""

# ===== 团队就绪度检查 (100分) =====
echo "👥 ===== 团队就绪度检查 (满分100分) ====="
echo ""

# 1. 技能准备 (40分)
echo "1️⃣ 技能准备 (40分):"
read -p "   团队了解新架构（Monorepo、pnpm、Turborepo）? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TEAM_SCORE=$((TEAM_SCORE + 20))
    echo "   ✅ +20分"
else
    echo "   ❌ +0分"
fi

read -p "   至少1人完全掌握新系统? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TEAM_SCORE=$((TEAM_SCORE + 20))
    echo "   ✅ +20分"
else
    echo "   ❌ +0分"
fi

echo ""

# 2. 文档准备 (40分)
echo "2️⃣ 文档准备 (40分):"
read -p "   迁移文档完整? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TEAM_SCORE=$((TEAM_SCORE + 10))
    echo "   ✅ +10分"
else
    echo "   ❌ +0分"
fi

read -p "   部署文档更新? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TEAM_SCORE=$((TEAM_SCORE + 10))
    echo "   ✅ +10分"
else
    echo "   ❌ +0分"
fi

read -p "   故障排查文档准备? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TEAM_SCORE=$((TEAM_SCORE + 10))
    echo "   ✅ +10分"
else
    echo "   ❌ +0分"
fi

read -p "   回滚文档准备? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TEAM_SCORE=$((TEAM_SCORE + 10))
    echo "   ✅ +10分"
else
    echo "   ❌ +0分"
fi

echo ""

# 3. 应急准备 (20分)
echo "3️⃣ 应急准备 (20分):"
read -p "   回滚方案测试通过? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TEAM_SCORE=$((TEAM_SCORE + 10))
    echo "   ✅ +10分"
else
    echo "   ❌ +0分"
fi

read -p "   应急流程明确? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TEAM_SCORE=$((TEAM_SCORE + 10))
    echo "   ✅ +10分"
else
    echo "   ❌ +0分"
fi

echo ""
echo "📊 团队就绪度得分: $TEAM_SCORE / 100"
echo ""

# ===== 时机选择检查 (100分) =====
echo "⏰ ===== 时机选择检查 (满分100分) ====="
echo ""

# 1. 业务时机 (50分)
echo "1️⃣ 业务时机 (50分):"
read -p "   当前是非业务高峰期? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TIMING_SCORE=$((TIMING_SCORE + 20))
    echo "   ✅ +20分"
else
    echo "   ❌ +0分"
fi

read -p "   近期无重要活动或促销? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TIMING_SCORE=$((TIMING_SCORE + 15))
    echo "   ✅ +15分"
else
    echo "   ❌ +0分"
fi

read -p "   有充足的监控时间（至少24小时）? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TIMING_SCORE=$((TIMING_SCORE + 15))
    echo "   ✅ +15分"
else
    echo "   ❌ +0分"
fi

echo ""

# 2. 技术时机 (50分)
echo "2️⃣ 技术时机 (50分):"
read -p "   近期无其他重大变更? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TIMING_SCORE=$((TIMING_SCORE + 20))
    echo "   ✅ +20分"
else
    echo "   ❌ +0分"
fi

read -p "   团队成员在线可支持? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TIMING_SCORE=$((TIMING_SCORE + 15))
    echo "   ✅ +15分"
else
    echo "   ❌ +0分"
fi

read -p "   服务器资源充足? (yes/no): " answer
if [ "$answer" = "yes" ]; then
    TIMING_SCORE=$((TIMING_SCORE + 15))
    echo "   ✅ +15分"
else
    echo "   ❌ +0分"
fi

echo ""
echo "📊 时机选择得分: $TIMING_SCORE / 100"
echo ""

# ===== 总结 =====
TOTAL_SCORE=$((TECH_SCORE + BUSINESS_SCORE + TEAM_SCORE + TIMING_SCORE))

echo "=================================================="
echo "📊 ===== 最终评估结果 ====="
echo "=================================================="
echo ""
echo "技术就绪度: $TECH_SCORE / 100  (推荐线: 90, 及格线: 80)"
echo "业务就绪度: $BUSINESS_SCORE / 100  (推荐线: 85, 及格线: 75)"
echo "团队就绪度: $TEAM_SCORE / 100  (推荐线: 80, 及格线: 70)"
echo "时机选择:   $TIMING_SCORE / 100  (推荐线: 80, 及格线: 60)"
echo ""
echo "=================================================="
echo "总分: $TOTAL_SCORE / 400  (推荐线: 335, 及格线: 285)"
echo "=================================================="
echo ""

# 给出建议
if [ $TOTAL_SCORE -ge 335 ] && \
   [ $TECH_SCORE -ge 90 ] && \
   [ $BUSINESS_SCORE -ge 85 ] && \
   [ $TEAM_SCORE -ge 80 ] && \
   [ $TIMING_SCORE -ge 80 ]; then
    echo "🟢 建议: 强烈建议切换"
    echo "   所有指标达到推荐线，可以安全切换到apps/web"
    echo "   建议采用渐进式切换策略（5% → 20% → 50% → 100%）"
elif [ $TOTAL_SCORE -ge 285 ] && \
     [ $TECH_SCORE -ge 80 ] && \
     [ $BUSINESS_SCORE -ge 75 ] && \
     [ $TEAM_SCORE -ge 70 ] && \
     [ $TIMING_SCORE -ge 60 ]; then
    echo "🟡 建议: 可以考虑切换"
    echo "   各项指标达到及格线，可以考虑切换，但需要更谨慎"
    echo "   建议继续优化未达标项，等待更好的时机"
else
    echo "🔴 建议: 不建议切换"
    echo "   以下项未达标:"
    [ $TECH_SCORE -lt 80 ] && echo "   - 技术就绪度: $TECH_SCORE < 80（及格线）"
    [ $BUSINESS_SCORE -lt 75 ] && echo "   - 业务就绪度: $BUSINESS_SCORE < 75（及格线）"
    [ $TEAM_SCORE -lt 70 ] && echo "   - 团队就绪度: $TEAM_SCORE < 70（及格线）"
    [ $TIMING_SCORE -lt 60 ] && echo "   - 时机选择: $TIMING_SCORE < 60（及格线）"
    [ $TOTAL_SCORE -lt 285 ] && echo "   - 总分: $TOTAL_SCORE < 285（及格线）"
    echo ""
    echo "   建议继续完善和测试，等待条件成熟后再切换"
fi

echo ""
echo "📚 详细信息请参考: docs/SWITCH-TIMING.md"
echo ""
