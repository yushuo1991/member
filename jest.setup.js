/**
 * Jest Setup File
 * Runs before each test suite
 */

// Set test environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '7d';
process.env.BCRYPT_ROUNDS = '10'; // Lower rounds for faster tests
process.env.NODE_ENV = 'test';
process.env.APP_URL = 'http://localhost:3000';
process.env.COOKIE_SECURE = 'false';

// Set test timeout
jest.setTimeout(10000);
