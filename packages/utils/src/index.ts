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

// 优雅关闭工具
export {
  shutdownManager,
  registerDatabaseCleanup,
  initGracefulShutdown
} from './shutdown';

// Zod 验证 Schemas
export {
  LoginSchema,
  RegisterSchema,
  ActivationCodeSchema,
  MemberAdjustSchema,
  AdminLoginSchema,
  GenerateCodeSchema,
  UpdateUserStatusSchema,
  ResetTrialsSchema,
  TrialProductSchema,
  validateRequest,
  safeValidateRequest,
  type LoginInput,
  type RegisterInput,
  type ActivationCodeInput,
  type MemberAdjustInput,
  type AdminLoginInput,
  type GenerateCodeInput,
  type UpdateUserStatusInput,
  type ResetTrialsInput,
  type TrialProductInput,
} from './validation-schemas';

// 日志工具
export {
  logger,
  Logger,
  createLogger,
  winstonLogger,
  requestLogger,
  logError,
  PerformanceLogger,
  LogPerformance,
  type LogLevel,
  type LogMetadata,
} from './logger';
