/**
 * Membership Levels Tests
 * Tests for membership permission checking and utility functions
 */

import {
  MembershipLevel,
  hasAccess,
  canAccessProductByMembership,
  getProductBySlug,
  getMembershipConfig,
  calculateExpiry,
  calculateProductExpiry,
  isValidMembershipLevel,
  extendMembership,
  getProductPriceText,
  getLevelBadgeColor,
  getMembershipProducts,
  getStandaloneProducts,
  getTrialProducts,
} from '../membership-levels';

describe('Membership Levels', () => {
  describe('hasAccess', () => {
    it('should allow access to none level content for all users', () => {
      expect(hasAccess('none', 'none')).toBe(true);
      expect(hasAccess('monthly', 'none')).toBe(true);
      expect(hasAccess('yearly', 'none')).toBe(true);
      expect(hasAccess('lifetime', 'none')).toBe(true);
    });

    it('should allow monthly member to access monthly content', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      expect(hasAccess('monthly', 'monthly', futureDate)).toBe(true);
    });

    it('should deny access if membership is expired', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      expect(hasAccess('monthly', 'monthly', pastDate)).toBe(false);
    });

    it('should allow higher level members to access lower level content', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      expect(hasAccess('yearly', 'monthly', futureDate)).toBe(true);
      expect(hasAccess('yearly', 'quarterly', futureDate)).toBe(true);
      expect(hasAccess('lifetime', 'monthly', futureDate)).toBe(true);
      expect(hasAccess('lifetime', 'yearly', futureDate)).toBe(true);
    });

    it('should deny lower level members access to higher level content', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      expect(hasAccess('monthly', 'quarterly', futureDate)).toBe(false);
      expect(hasAccess('monthly', 'yearly', futureDate)).toBe(false);
      expect(hasAccess('quarterly', 'yearly', futureDate)).toBe(false);
    });

    it('should allow lifetime members access without expiry check', () => {
      expect(hasAccess('lifetime', 'monthly')).toBe(true);
      expect(hasAccess('lifetime', 'yearly')).toBe(true);
      expect(hasAccess('lifetime', 'lifetime')).toBe(true);
    });

    it('should deny none level access to paid content', () => {
      expect(hasAccess('none', 'monthly')).toBe(false);
      expect(hasAccess('none', 'quarterly')).toBe(false);
      expect(hasAccess('none', 'yearly')).toBe(false);
    });
  });

  describe('canAccessProductByMembership', () => {
    it('should allow access to products based on membership level', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      // Circle requires monthly
      expect(canAccessProductByMembership('monthly', 'circle', futureDate)).toBe(true);
      expect(canAccessProductByMembership('yearly', 'circle', futureDate)).toBe(true);

      // BK requires quarterly
      expect(canAccessProductByMembership('quarterly', 'bk', futureDate)).toBe(true);
      expect(canAccessProductByMembership('yearly', 'bk', futureDate)).toBe(true);
      expect(canAccessProductByMembership('monthly', 'bk', futureDate)).toBe(false);
    });

    it('should deny access to standalone products via membership', () => {
      expect(canAccessProductByMembership('lifetime', 'qingxubiaoge')).toBe(false);
      expect(canAccessProductByMembership('yearly', 'fupanbanmian')).toBe(false);
    });

    it('should return false for non-existent products', () => {
      expect(canAccessProductByMembership('yearly', 'nonexistent')).toBe(false);
    });
  });

  describe('getProductBySlug', () => {
    it('should return product by slug', () => {
      const product = getProductBySlug('circle');
      expect(product).toBeDefined();
      expect(product?.slug).toBe('circle');
      expect(product?.name).toContain('学习圈');
    });

    it('should return undefined for non-existent slug', () => {
      const product = getProductBySlug('nonexistent');
      expect(product).toBeUndefined();
    });
  });

  describe('getMembershipConfig', () => {
    it('should return correct config for each level', () => {
      const noneConfig = getMembershipConfig('none');
      expect(noneConfig.level).toBe('none');
      expect(noneConfig.price).toBe(0);

      const monthlyConfig = getMembershipConfig('monthly');
      expect(monthlyConfig.level).toBe('monthly');
      expect(monthlyConfig.duration).toBe(30);
      expect(monthlyConfig.price).toBe(300);

      const lifetimeConfig = getMembershipConfig('lifetime');
      expect(lifetimeConfig.level).toBe('lifetime');
      expect(lifetimeConfig.duration).toBeNull();
    });
  });

  describe('calculateExpiry', () => {
    it('should calculate correct expiry for monthly membership', () => {
      const startDate = new Date('2024-01-01');
      const expiry = calculateExpiry('monthly', startDate);

      expect(expiry).not.toBeNull();
      expect(expiry?.getDate()).toBe(31); // 30 days later
      expect(expiry?.getMonth()).toBe(0); // Still January
    });

    it('should calculate correct expiry for yearly membership', () => {
      const startDate = new Date('2024-01-01');
      const expiry = calculateExpiry('yearly', startDate);

      expect(expiry).not.toBeNull();
      // 365 days from Jan 1, 2024 is Dec 31, 2024 (2024 is a leap year)
      expect(expiry?.getFullYear()).toBe(2024);
      expect(expiry?.getMonth()).toBe(11); // December
      expect(expiry?.getDate()).toBe(31);
    });

    it('should return null for lifetime membership', () => {
      const expiry = calculateExpiry('lifetime');
      expect(expiry).toBeNull();
    });

    it('should use current date if no start date provided', () => {
      const before = new Date();
      const expiry = calculateExpiry('monthly');
      const after = new Date();

      expect(expiry).not.toBeNull();
      expect(expiry!.getTime()).toBeGreaterThan(before.getTime());
      expect(expiry!.getTime()).toBeGreaterThan(after.getTime());
    });
  });

  describe('calculateProductExpiry', () => {
    it('should calculate monthly product expiry', () => {
      const startDate = new Date('2024-01-01');
      const expiry = calculateProductExpiry('monthly', startDate);

      expect(expiry).not.toBeNull();
      expect(expiry?.getDate()).toBe(31);
    });

    it('should calculate yearly product expiry', () => {
      const startDate = new Date('2024-01-01');
      const expiry = calculateProductExpiry('yearly', startDate);

      expect(expiry).not.toBeNull();
      // 365 days from Jan 1, 2024 is Dec 31, 2024 (2024 is a leap year)
      expect(expiry?.getFullYear()).toBe(2024);
      expect(expiry?.getMonth()).toBe(11); // December
      expect(expiry?.getDate()).toBe(31);
    });

    it('should return null for lifetime purchase', () => {
      const expiry = calculateProductExpiry('lifetime');
      expect(expiry).toBeNull();
    });
  });

  describe('isValidMembershipLevel', () => {
    it('should validate correct membership levels', () => {
      expect(isValidMembershipLevel('none')).toBe(true);
      expect(isValidMembershipLevel('monthly')).toBe(true);
      expect(isValidMembershipLevel('quarterly')).toBe(true);
      expect(isValidMembershipLevel('yearly')).toBe(true);
      expect(isValidMembershipLevel('lifetime')).toBe(true);
    });

    it('should reject invalid membership levels', () => {
      expect(isValidMembershipLevel('invalid')).toBe(false);
      expect(isValidMembershipLevel('premium')).toBe(false);
      expect(isValidMembershipLevel('')).toBe(false);
    });
  });

  describe('extendMembership', () => {
    it('should extend from current expiry if not expired', () => {
      // Use a future date to ensure it's not expired
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10); // 10 days in the future

      const newExpiry = extendMembership(futureDate, 'monthly');

      expect(newExpiry).not.toBeNull();
      // Should extend from the future date, not from now
      const expected = new Date(futureDate);
      expected.setDate(expected.getDate() + 30);
      expect(newExpiry?.getTime()).toBe(expected.getTime());
    });

    it('should extend from now if expiry is in the past', () => {
      const pastExpiry = new Date('2023-01-01');
      const before = new Date();
      const newExpiry = extendMembership(pastExpiry, 'monthly');
      const after = new Date();

      expect(newExpiry).not.toBeNull();
      expect(newExpiry!.getTime()).toBeGreaterThan(before.getTime());
    });

    it('should return null for lifetime membership', () => {
      const currentExpiry = new Date('2024-06-01');
      const newExpiry = extendMembership(currentExpiry, 'lifetime');

      expect(newExpiry).toBeNull();
    });
  });

  describe('getProductPriceText', () => {
    it('should return membership requirement for membership products', () => {
      const circle = getProductBySlug('circle');
      const priceText = getProductPriceText(circle!);

      expect(priceText).toContain('月费会员');
    });

    it('should return price for standalone products', () => {
      const qingxu = getProductBySlug('qingxubiaoge');
      const priceText = getProductPriceText(qingxu!);

      expect(priceText).toContain('600');
      expect(priceText).toContain('买断');
    });
  });

  describe('getLevelBadgeColor', () => {
    it('should return correct colors for each level', () => {
      expect(getLevelBadgeColor('none')).toContain('gray');
      expect(getLevelBadgeColor('monthly')).toContain('blue');
      expect(getLevelBadgeColor('quarterly')).toContain('green');
      expect(getLevelBadgeColor('yearly')).toContain('purple');
      expect(getLevelBadgeColor('lifetime')).toContain('yellow');
    });
  });

  describe('Product Filtering', () => {
    it('should get membership products', () => {
      const products = getMembershipProducts();
      expect(products.length).toBeGreaterThan(0);
      expect(products.every(p => p.priceType === 'membership' || p.priceType === 'both')).toBe(true);
    });

    it('should get standalone products', () => {
      const products = getStandaloneProducts();
      expect(products.length).toBeGreaterThan(0);
      expect(products.every(p => p.priceType === 'standalone' || p.priceType === 'both')).toBe(true);
    });

    it('should get trial products', () => {
      const products = getTrialProducts();
      expect(products.length).toBeGreaterThan(0);
      expect(products.every(p => p.trialEnabled === true)).toBe(true);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete membership upgrade flow', () => {
      // User starts as free user
      expect(hasAccess('none', 'monthly')).toBe(false);

      // User purchases monthly membership
      const monthlyExpiry = calculateExpiry('monthly');
      expect(hasAccess('monthly', 'monthly', monthlyExpiry!)).toBe(true);
      expect(canAccessProductByMembership('monthly', 'circle', monthlyExpiry!)).toBe(true);

      // User upgrades to yearly
      const yearlyExpiry = calculateExpiry('yearly');
      expect(hasAccess('yearly', 'monthly', yearlyExpiry!)).toBe(true);
      expect(hasAccess('yearly', 'yearly', yearlyExpiry!)).toBe(true);
      expect(canAccessProductByMembership('yearly', 'xinli', yearlyExpiry!)).toBe(true);
    });

    it('should handle membership expiry correctly', () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 10);

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      // Active membership
      expect(hasAccess('monthly', 'monthly', futureDate)).toBe(true);

      // Expired membership
      expect(hasAccess('monthly', 'monthly', pastDate)).toBe(false);

      // After expiry, user should only have free access
      expect(hasAccess('none', 'none')).toBe(true);
      expect(hasAccess('none', 'monthly')).toBe(false);
    });
  });
});
