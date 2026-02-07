-- 重置所有会员的试用次数为 5
-- 执行前先查看当前状态
SELECT '=== 重置前的统计 ===' as info;
SELECT
  COUNT(*) as total_users,
  AVG(trial_bk) as avg_bk,
  AVG(trial_xinli) as avg_xinli,
  AVG(trial_fuplan) as avg_fuplan,
  SUM(CASE WHEN trial_bk != 5 OR trial_xinli != 5 OR trial_fuplan != 5 THEN 1 ELSE 0 END) as need_reset
FROM users;

-- 执行重置
UPDATE users
SET trial_bk = 5,
    trial_xinli = 5,
    trial_fuplan = 5;

-- 验证重置结果
SELECT '=== 重置后的统计 ===' as info;
SELECT
  COUNT(*) as total_users,
  SUM(CASE WHEN trial_bk = 5 THEN 1 ELSE 0 END) as bk_ok,
  SUM(CASE WHEN trial_xinli = 5 THEN 1 ELSE 0 END) as xinli_ok,
  SUM(CASE WHEN trial_fuplan = 5 THEN 1 ELSE 0 END) as fuplan_ok
FROM users;

SELECT '=== 重置完成 ===' as info;
