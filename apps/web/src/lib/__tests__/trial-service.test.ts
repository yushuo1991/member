/**
 * Trial Service Tests
 * Tests for trial functionality and utility functions
 */

import {
  getTrialFieldName,
  isTrialSupported,
  getTrialStatus,
  createTrialResult,
  getProductRedirectUrl,
  formatTrialCount,
  getTrialButtonText,
  canUseTrial,
  TRIAL_PRODUCTS,
} from '../trial-service';

describe('Trial Service', () => {
  describe('getTrialFieldName', () => {
    it('should return correct field name for supported products', () => {
      expect(getTrialFieldName('bk')).toBe('trial_bk');
      expect(getTrialFieldName('xinli')).toBe('trial_xinli');
      expect(getTrialFieldName('fuplan')).toBe('trial_fuplan');
    });

    it('should return null for unsupported products', () => {
      expect(getTrialFieldName('circle')).toBeNull();
      expect(getTrialFieldName('qingxubiaoge')).toBeNull();
      expect(getTrialFieldName('nonexistent')).toBeNull();
    });
  });

  describe('isTrialSupported', () => {
    it('should return true for supported trial products', () => {
      expect(isTrialSupported('bk')).toBe(true);
      expect(isTrialSupported('xinli')).toBe(true);
      expect(isTrialSupported('fuplan')).toBe(true);
    });

    it('should return false for unsupported products', () => {
      expect(isTrialSupported('circle')).toBe(false);
      expect(isTrialSupported('qingxubiaoge')).toBe(false);
      expect(isTrialSupported('bankuaizhushou')).toBe(false);
    });

    it('should have correct trial products list', () => {
      expect(TRIAL_PRODUCTS).toEqual(['bk', 'xinli', 'fuplan']);
      expect(TRIAL_PRODUCTS.length).toBe(3);
    });
  });

  describe('getTrialStatus', () => {
    it('should return correct status for supported product with trials remaining', () => {
      const status = getTrialStatus('bk', 3);

      expect(status.productSlug).toBe('bk');
      expect(status.productName).toBe('板块节奏系统');
      expect(status.trialEnabled).toBe(true);
      expect(status.trialRemaining).toBe(3);
      expect(status.canUseTrial).toBe(true);
    });

    it('should return correct status when trials are exhausted', () => {
      const status = getTrialStatus('xinli', 0);

      expect(status.productSlug).toBe('xinli');
      expect(status.trialEnabled).toBe(true);
      expect(status.trialRemaining).toBe(0);
      expect(status.canUseTrial).toBe(false);
    });

    it('should return correct status for unsupported product', () => {
      const status = getTrialStatus('circle', 5);

      expect(status.productSlug).toBe('circle');
      expect(status.trialEnabled).toBe(false);
      expect(status.canUseTrial).toBe(false);
    });

    it('should handle negative trial count', () => {
      const status = getTrialStatus('bk', -1);

      expect(status.trialRemaining).toBe(-1);
      expect(status.canUseTrial).toBe(false);
    });
  });

  describe('createTrialResult', () => {
    it('should create success result', () => {
      const result = createTrialResult(true, 4, '试用成功', 'https://bk.example.com');

      expect(result.success).toBe(true);
      expect(result.trialRemaining).toBe(4);
      expect(result.message).toBe('试用成功');
      expect(result.redirectUrl).toBe('https://bk.example.com');
    });

    it('should create failure result', () => {
      const result = createTrialResult(false, 0, '试用次数已用完');

      expect(result.success).toBe(false);
      expect(result.trialRemaining).toBe(0);
      expect(result.message).toBe('试用次数已用完');
      expect(result.redirectUrl).toBeUndefined();
    });

    it('should handle result without redirect URL', () => {
      const result = createTrialResult(true, 3, '试用成功');

      expect(result.success).toBe(true);
      expect(result.redirectUrl).toBeUndefined();
    });
  });

  describe('getProductRedirectUrl', () => {
    it('should return correct URL for products with URL', () => {
      expect(getProductRedirectUrl('bk')).toBe('https://bk.yushuofupan.com');
      expect(getProductRedirectUrl('xinli')).toBe('https://xinli.yushuofupan.com');
      expect(getProductRedirectUrl('fuplan')).toBe('https://fupan.yushuofupan.com');
    });

    it('should return fallback URL for products without URL', () => {
      const url = getProductRedirectUrl('nonexistent');
      expect(url).toBe('/products/nonexistent');
    });
  });

  describe('formatTrialCount', () => {
    it('should format remaining trials correctly', () => {
      expect(formatTrialCount(5, 5)).toBe('剩余5/5次试用');
      expect(formatTrialCount(3, 5)).toBe('剩余3/5次试用');
      expect(formatTrialCount(1, 5)).toBe('剩余1/5次试用');
    });

    it('should show exhausted message when no trials left', () => {
      expect(formatTrialCount(0, 5)).toBe('试用已用完');
      expect(formatTrialCount(-1, 5)).toBe('试用已用完');
    });

    it('should use default total of 5 if not provided', () => {
      expect(formatTrialCount(3)).toBe('剩余3/5次试用');
    });
  });

  describe('getTrialButtonText', () => {
    it('should return correct button text with remaining trials', () => {
      expect(getTrialButtonText(5)).toBe('免费试用（剩5次）');
      expect(getTrialButtonText(3)).toBe('免费试用（剩3次）');
      expect(getTrialButtonText(1)).toBe('免费试用（剩1次）');
    });

    it('should return exhausted text when no trials left', () => {
      expect(getTrialButtonText(0)).toBe('试用已用完');
      expect(getTrialButtonText(-1)).toBe('试用已用完');
    });
  });

  describe('canUseTrial', () => {
    it('should return true when product supports trial and has remaining trials', () => {
      expect(canUseTrial('bk', 5)).toBe(true);
      expect(canUseTrial('xinli', 3)).toBe(true);
      expect(canUseTrial('fuplan', 1)).toBe(true);
    });

    it('should return false when trials are exhausted', () => {
      expect(canUseTrial('bk', 0)).toBe(false);
      expect(canUseTrial('xinli', -1)).toBe(false);
    });

    it('should return false when product does not support trial', () => {
      expect(canUseTrial('circle', 5)).toBe(false);
      expect(canUseTrial('qingxubiaoge', 10)).toBe(false);
    });

    it('should return false for non-existent products', () => {
      expect(canUseTrial('nonexistent', 5)).toBe(false);
    });
  });

  describe('Integration Tests', () => {
    it('should handle complete trial usage flow', () => {
      const productSlug = 'bk';
      let trialRemaining = 5;

      // Check initial status
      let status = getTrialStatus(productSlug, trialRemaining);
      expect(status.canUseTrial).toBe(true);
      expect(getTrialButtonText(trialRemaining)).toBe('免费试用（剩5次）');

      // Use trial 1
      trialRemaining = 4;
      status = getTrialStatus(productSlug, trialRemaining);
      expect(status.canUseTrial).toBe(true);
      expect(formatTrialCount(trialRemaining)).toBe('剩余4/5次试用');

      // Use trial 2
      trialRemaining = 3;
      expect(canUseTrial(productSlug, trialRemaining)).toBe(true);

      // Use trial 3
      trialRemaining = 2;
      expect(canUseTrial(productSlug, trialRemaining)).toBe(true);

      // Use trial 4
      trialRemaining = 1;
      expect(canUseTrial(productSlug, trialRemaining)).toBe(true);
      expect(getTrialButtonText(trialRemaining)).toBe('免费试用（剩1次）');

      // Use trial 5 (last one)
      trialRemaining = 0;
      status = getTrialStatus(productSlug, trialRemaining);
      expect(status.canUseTrial).toBe(false);
      expect(getTrialButtonText(trialRemaining)).toBe('试用已用完');
      expect(formatTrialCount(trialRemaining)).toBe('试用已用完');
    });

    it('should handle trial result creation for different scenarios', () => {
      // Success scenario
      const successResult = createTrialResult(
        true,
        4,
        '试用成功，正在跳转...',
        'https://bk.yushuofupan.com'
      );
      expect(successResult.success).toBe(true);
      expect(successResult.redirectUrl).toBeDefined();

      // Failure - no trials left
      const noTrialsResult = createTrialResult(
        false,
        0,
        '试用次数已用完，请升级会员'
      );
      expect(noTrialsResult.success).toBe(false);
      expect(noTrialsResult.trialRemaining).toBe(0);

      // Failure - not supported
      const notSupportedResult = createTrialResult(
        false,
        5,
        '该产品不支持试用'
      );
      expect(notSupportedResult.success).toBe(false);
    });

    it('should validate trial field mapping', () => {
      // Ensure all trial products have field mappings
      TRIAL_PRODUCTS.forEach(productSlug => {
        const fieldName = getTrialFieldName(productSlug);
        expect(fieldName).not.toBeNull();
        expect(fieldName).toContain('trial_');
      });
    });
  });
});
