/**
 * Winston 日志系统
 * 提供统一的日志记录功能，支持多种日志级别和输出方式
 */

import winston from 'winston';
import path from 'path';
import fs from 'fs';

// 日志级别定义
export type LogLevel = 'error' | 'warn' | 'info' | 'http' | 'verbose' | 'debug' | 'silly';

// 日志元数据接口
export interface LogMetadata {
  [key: string]: any;
  userId?: string;
  requestId?: string;
  ip?: string;
  method?: string;
  url?: string;
  statusCode?: number;
  duration?: number;
  error?: Error;
}

// 环境变量
const NODE_ENV = process.env.NODE_ENV || 'development';
const LOG_LEVEL = process.env.LOG_LEVEL || (NODE_ENV === 'production' ? 'info' : 'debug');

// 日志目录
const LOG_DIR = process.env.LOG_DIR || path.join(process.cwd(), 'logs');

// 确保日志目录存在
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// 自定义日志格式
const customFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.printf(({ timestamp, level, message, stack, ...metadata }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    // 添加元数据
    if (Object.keys(metadata).length > 0) {
      log += ` ${JSON.stringify(metadata)}`;
    }

    // 添加堆栈跟踪
    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  })
);

// 控制台彩色格式（开发环境）
const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...metadata }) => {
    let log = `${timestamp} ${level}: ${message}`;

    // 添加元数据（格式化输出）
    if (Object.keys(metadata).length > 0) {
      const metaStr = JSON.stringify(metadata, null, 2);
      log += `\n${metaStr}`;
    }

    // 添加堆栈跟踪
    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  })
);

// JSON 格式（生产环境）
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// 创建传输器
const transports: winston.transport[] = [];

// 开发环境：彩色控制台输出
if (NODE_ENV === 'development') {
  transports.push(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
} else {
  // 生产环境：文件输出

  // 错误日志文件（只记录 error 级别）
  transports.push(
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'error.log'),
      level: 'error',
      format: jsonFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 10, // 保留最近 10 个文件
      tailable: true, // 启用日志轮转
    })
  );

  // 综合日志文件（记录所有级别）
  transports.push(
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'combined.log'),
      format: jsonFormat,
      maxsize: 10 * 1024 * 1024, // 10MB
      maxFiles: 30, // 保留最近 30 个文件
      tailable: true,
    })
  );

  // 生产环境也输出到控制台（简化格式）
  transports.push(
    new winston.transports.Console({
      format: customFormat,
    })
  );
}

// 创建 Winston logger 实例
const winstonLogger = winston.createLogger({
  level: LOG_LEVEL,
  levels: winston.config.npm.levels,
  transports,
  exitOnError: false,
  // 处理未捕获的异常和拒绝
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'exceptions.log'),
      format: jsonFormat,
    }),
  ],
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(LOG_DIR, 'rejections.log'),
      format: jsonFormat,
    }),
  ],
});

/**
 * Logger 类 - 提供便捷的日志记录方法
 */
class Logger {
  private context?: string;

  constructor(context?: string) {
    this.context = context;
  }

  /**
   * 创建带上下文的 logger 实例
   */
  static create(context: string): Logger {
    return new Logger(context);
  }

  /**
   * 格式化日志消息
   */
  private formatMessage(message: string): string {
    return this.context ? `[${this.context}] ${message}` : message;
  }

  /**
   * 错误日志
   */
  error(message: string, error?: Error | LogMetadata, metadata?: LogMetadata): void {
    const meta = this.buildMetadata(error, metadata);
    winstonLogger.error(this.formatMessage(message), meta);
  }

  /**
   * 警告日志
   */
  warn(message: string, metadata?: LogMetadata): void {
    winstonLogger.warn(this.formatMessage(message), metadata || {});
  }

  /**
   * 信息日志
   */
  info(message: string, metadata?: LogMetadata): void {
    winstonLogger.info(this.formatMessage(message), metadata || {});
  }

  /**
   * HTTP 请求日志
   */
  http(message: string, metadata?: LogMetadata): void {
    winstonLogger.http(this.formatMessage(message), metadata || {});
  }

  /**
   * 详细日志
   */
  verbose(message: string, metadata?: LogMetadata): void {
    winstonLogger.verbose(this.formatMessage(message), metadata || {});
  }

  /**
   * 调试日志
   */
  debug(message: string, metadata?: LogMetadata): void {
    winstonLogger.debug(this.formatMessage(message), metadata || {});
  }

  /**
   * 构建元数据
   */
  private buildMetadata(error?: Error | LogMetadata, metadata?: LogMetadata): LogMetadata {
    const meta: LogMetadata = { ...(metadata || {}) };

    if (error instanceof Error) {
      meta.error = {
        name: error.name,
        message: error.message,
        stack: error.stack,
      };
    } else if (error) {
      Object.assign(meta, error);
    }

    return meta;
  }

  /**
   * 记录 API 请求
   */
  logRequest(req: {
    method: string;
    url: string;
    ip?: string;
    userId?: string;
  }): void {
    this.http('API Request', {
      method: req.method,
      url: req.url,
      ip: req.ip,
      userId: req.userId,
    });
  }

  /**
   * 记录 API 响应
   */
  logResponse(req: {
    method: string;
    url: string;
    statusCode: number;
    duration: number;
    userId?: string;
  }): void {
    const level = req.statusCode >= 500 ? 'error' : req.statusCode >= 400 ? 'warn' : 'http';

    winstonLogger.log(level, this.formatMessage('API Response'), {
      method: req.method,
      url: req.url,
      statusCode: req.statusCode,
      duration: req.duration,
      userId: req.userId,
    });
  }

  /**
   * 记录数据库查询
   */
  logQuery(query: string, duration?: number, error?: Error): void {
    if (error) {
      this.error('Database Query Failed', error, { query, duration });
    } else {
      this.debug('Database Query', { query, duration });
    }
  }

  /**
   * 记录认证事件
   */
  logAuth(event: 'login' | 'logout' | 'register' | 'token_refresh', userId: string, metadata?: LogMetadata): void {
    this.info(`Auth: ${event}`, {
      event,
      userId,
      ...metadata,
    });
  }

  /**
   * 记录业务事件
   */
  logEvent(event: string, metadata?: LogMetadata): void {
    this.info(`Event: ${event}`, metadata);
  }
}

// 导出默认 logger 实例
export const logger = new Logger();

// 导出 Logger 类
export { Logger };

// 导出 Winston 实例（用于高级用法）
export { winstonLogger };

// 便捷方法
export const createLogger = (context: string): Logger => Logger.create(context);

/**
 * Express/Next.js 中间件 - 记录请求日志
 */
export function requestLogger(context?: string) {
  const log = context ? Logger.create(context) : logger;

  return (req: any, res: any, next: any) => {
    const startTime = Date.now();

    // 记录请求
    log.logRequest({
      method: req.method,
      url: req.url,
      ip: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress,
      userId: req.user?.id,
    });

    // 监听响应完成
    res.on('finish', () => {
      const duration = Date.now() - startTime;
      log.logResponse({
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        duration,
        userId: req.user?.id,
      });
    });

    next();
  };
}

/**
 * 错误日志助手
 */
export function logError(error: Error, context?: string, metadata?: LogMetadata): void {
  const log = context ? Logger.create(context) : logger;
  log.error(error.message, error, metadata);
}

/**
 * 性能监控助手
 */
export class PerformanceLogger {
  private startTime: number;
  private logger: Logger;
  private operation: string;

  constructor(operation: string, context?: string) {
    this.operation = operation;
    this.logger = context ? Logger.create(context) : logger;
    this.startTime = Date.now();
    this.logger.debug(`Starting: ${operation}`);
  }

  /**
   * 结束并记录性能
   */
  end(metadata?: LogMetadata): void {
    const duration = Date.now() - this.startTime;
    this.logger.debug(`Completed: ${this.operation}`, {
      duration,
      ...metadata,
    });
  }

  /**
   * 记录错误并结束
   */
  error(error: Error, metadata?: LogMetadata): void {
    const duration = Date.now() - this.startTime;
    this.logger.error(`Failed: ${this.operation}`, error, {
      duration,
      ...metadata,
    });
  }
}

/**
 * 性能监控装饰器（用于类方法）
 */
export function LogPerformance(context?: string) {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const perf = new PerformanceLogger(`${target.constructor.name}.${propertyKey}`, context);
      try {
        const result = await originalMethod.apply(this, args);
        perf.end();
        return result;
      } catch (error) {
        perf.error(error as Error);
        throw error;
      }
    };

    return descriptor;
  };
}
