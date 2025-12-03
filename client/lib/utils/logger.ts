/**
 * Client-side structured logger
 * Provides consistent logging interface for browser environment
 */

export enum LogLevel {
 DEBUG = 'DEBUG',
 INFO = 'INFO',
 WARN = 'WARN',
 ERROR = 'ERROR',
}

interface LogEntry {
 timestamp: string;
 level: LogLevel;
 message: string;
 context?: string;
 data?: unknown;
}

class ClientLogger {
 private isDevelopment = import.meta.env.DEV;

 private formatLog(entry: LogEntry): string {
 const { timestamp, level, context, message } = entry;
 const contextStr = context ? `[${context}]` : '';
 return `${timestamp} ${level} ${contextStr} ${message}`;
 }

 private log(level: LogLevel, message: string, context?: string, data?: unknown): void {
 if (!this.isDevelopment && level === LogLevel.DEBUG) {
 return;
 }

 const entry: LogEntry = {
 timestamp: new Date().toISOString(),
 level,
 context,
 message,
 data,
 };

 const formattedMessage = this.formatLog(entry);

 switch (level) {
 case LogLevel.ERROR:
 if (data) {
 console.error(formattedMessage, data);
 } else {
 console.error(formattedMessage);
 }
 break;
 case LogLevel.WARN:
 if (data) {
 console.warn(formattedMessage, data);
 } else {
 console.warn(formattedMessage);
 }
 break;
 case LogLevel.DEBUG:
 if (data) {
 console.debug(formattedMessage, data);
 } else {
 console.debug(formattedMessage);
 }
 break;
 default:
 if (data) {
 console.log(formattedMessage, data);
 } else {
 console.log(formattedMessage);
 }
 }
 }

 debug(message: string, context?: string, data?: unknown): void {
 this.log(LogLevel.DEBUG, message, context, data);
 }

 info(message: string, context?: string, data?: unknown): void {
 this.log(LogLevel.INFO, message, context, data);
 }

 warn(message: string, context?: string, data?: unknown): void {
 this.log(LogLevel.WARN, message, context, data);
 }

 error(message: string, context?: string, error?: unknown): void {
 const errorData = error instanceof Error
 ? { message: error.message, stack: error.stack }
 : error;
 this.log(LogLevel.ERROR, message, context, errorData);
 }
}

export const logger = new ClientLogger();
