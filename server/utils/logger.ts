/**
 * Centralized logging utility for server-side code
 * Provides structured logging with consistent formatting and context
 * Replaces direct console.log usage throughout the application
 * 
 * @example
 * ```typescript
 * logger.info('User logged in', 'AuthService', { userId: '123' });
 * logger.error('Database connection failed', 'DatabaseService', error);
 * ```
 */

/**
 * Log level enumeration for categorizing log severity
 */
export enum LogLevel {
  /** Debug information for development (not shown in production) */
  DEBUG = 'DEBUG',
  /** General informational messages */
  INFO = 'INFO',
  /** Warning messages for non-critical issues */
  WARN = 'WARN',
  /** Error messages for critical failures */
  ERROR = 'ERROR',
}

/**
 * Structured log entry format
 */
interface LogEntry {
  /** ISO 8601 timestamp */
  timestamp: string;
  /** Log severity level */
  level: LogLevel;
  /** Optional context identifier (e.g., service name, module name) */
  context?: string;
  /** Human-readable log message */
  message: string;
  /** Additional structured data to log */
  data?: unknown;
}

/**
 * Centralized logger class for structured logging
 * Singleton pattern ensures consistent logging across the application
 */
class Logger {
  private isDevelopment = process.env.NODE_ENV !== 'production';

  /**
   * Formats a log entry into a human-readable string
   * @param entry - The log entry to format
   * @returns Formatted log string
   */
  private formatLog(entry: LogEntry): string {
    const { timestamp, level, context, message, data } = entry;
    const contextStr = context ? `[${context}]` : '';
    const dataStr = data ? `\n${JSON.stringify(data, null, 2)}` : '';
    return `${timestamp} ${level} ${contextStr} ${message}${dataStr}`;
  }

  /**
   * Core logging method that handles log formatting and output
   * @param level - Log severity level
   * @param message - Log message
   * @param context - Optional context identifier
   * @param data - Optional structured data
   */
  private log(level: LogLevel, message: string, context?: string, data?: unknown): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      context,
      message,
      data,
    };

    const formattedLog = this.formatLog(entry);

    switch (level) {
      case LogLevel.ERROR:
        console.error(formattedLog);
        break;
      case LogLevel.WARN:
        console.warn(formattedLog);
        break;
      case LogLevel.DEBUG:
        if (this.isDevelopment) {
          console.debug(formattedLog);
        }
        break;
      default:
        console.log(formattedLog);
    }
  }

  /**
   * Logs debug-level messages (development only)
   * @param message - Debug message
   * @param context - Optional context identifier
   * @param data - Optional structured data
   */
  debug(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, context, data);
  }

  /**
   * Logs informational messages
   * @param message - Info message
   * @param context - Optional context identifier
   * @param data - Optional structured data
   */
  info(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, context, data);
  }

  /**
   * Logs warning messages
   * @param message - Warning message
   * @param context - Optional context identifier
   * @param data - Optional structured data
   */
  warn(message: string, context?: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, context, data);
  }

  /**
   * Logs error messages with stack traces
   * @param message - Error message
   * @param context - Optional context identifier
   * @param error - Optional error object or data
   */
  error(message: string, context?: string, error?: unknown): void {
    const errorData = error instanceof Error
      ? { message: error.message, stack: error.stack }
      : error;
    this.log(LogLevel.ERROR, message, context, errorData);
  }
}

/**
 * Singleton logger instance for application-wide use
 * @example
 * ```typescript
 * import { logger } from './utils/logger';
 * logger.info('Operation completed successfully');
 * ```
 */
export const logger = new Logger();
