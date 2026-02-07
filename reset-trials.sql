-- Reset all users' trial counts to 5
UPDATE users
SET trial_bk = 5,
    trial_xinli = 5,
    trial_fuplan = 5;

-- Verify the results
SELECT
    COUNT(*) as total_users,
    SUM(CASE WHEN trial_bk = 5 THEN 1 ELSE 0 END) as bk_reset,
    SUM(CASE WHEN trial_xinli = 5 THEN 1 ELSE 0 END) as xinli_reset,
    SUM(CASE WHEN trial_fuplan = 5 THEN 1 ELSE 0 END) as fuplan_reset
FROM users;
