/**
 * Password Hashing and Verification Tests
 * Tests for bcrypt password utilities
 */

import { hashPassword, verifyPassword } from '../password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash a password successfully', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
      expect(hash).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt hash format
    });

    it('should generate different hashes for the same password', async () => {
      const password = 'testPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Different salts
    });

    it('should handle empty password', async () => {
      const password = '';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should handle special characters in password', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });

    it('should handle Chinese characters in password', async () => {
      const password = '测试密码123';
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'testPassword123';
      const wrongPassword = 'wrongPassword456';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hash);

      expect(isValid).toBe(false);
    });

    it('should be case sensitive', async () => {
      const password = 'TestPassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('testpassword123', hash);

      expect(isValid).toBe(false);
    });

    it('should reject empty password against valid hash', async () => {
      const password = 'testPassword123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword('', hash);

      expect(isValid).toBe(false);
    });

    it('should handle invalid hash format', async () => {
      const password = 'testPassword123';
      const invalidHash = 'not-a-valid-hash';

      // bcrypt.compare returns false for invalid hash instead of throwing
      const result = await verifyPassword(password, invalidHash);
      expect(result).toBe(false);
    });

    it('should verify password with special characters', async () => {
      const password = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });

    it('should verify password with Chinese characters', async () => {
      const password = '测试密码123';
      const hash = await hashPassword(password);
      const isValid = await verifyPassword(password, hash);

      expect(isValid).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete password lifecycle', async () => {
      // User registration
      const userPassword = 'mySecurePassword123!';
      const storedHash = await hashPassword(userPassword);

      // User login - correct password
      const loginAttempt1 = await verifyPassword(userPassword, storedHash);
      expect(loginAttempt1).toBe(true);

      // User login - incorrect password
      const loginAttempt2 = await verifyPassword('wrongPassword', storedHash);
      expect(loginAttempt2).toBe(false);

      // User login - correct password again
      const loginAttempt3 = await verifyPassword(userPassword, storedHash);
      expect(loginAttempt3).toBe(true);
    });

    it('should handle multiple users with same password', async () => {
      const password = 'commonPassword123';

      const user1Hash = await hashPassword(password);
      const user2Hash = await hashPassword(password);

      // Hashes should be different (different salts)
      expect(user1Hash).not.toBe(user2Hash);

      // Both should verify correctly
      expect(await verifyPassword(password, user1Hash)).toBe(true);
      expect(await verifyPassword(password, user2Hash)).toBe(true);
    });
  });
});
