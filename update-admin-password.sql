UPDATE admins
SET password_hash = '$2a$10$b6cHwbeic16BKo6WS/1/WesB3HEacLUu7R4Y7Yrfud5ei3sdHaFKO'
WHERE username = 'admin';

SELECT username, password_hash FROM admins WHERE username = 'admin';
