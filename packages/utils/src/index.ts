/**
 * @yushuo/utils - 工具函数库
 * 提供剪贴板、格式化、验证等常用工具函数
 */

// 剪贴板工具
export { copyToClipboard, isClipboardSupported } from './clipboard';

// 验证工具
export { isValidEmail, isValidPhone, checkPasswordStrength, isValidUsername } from './validation';

// 格式化工具
export { formatPrice, truncate, randomString, maskPhone, maskEmail } from './format';
