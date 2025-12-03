import { CacheManager } from './cache-manager';
import { TaskManager, TaskConfig } from './task-manager';

export interface BackgroundProcessorConfig extends TaskConfig {
 cacheManager?: CacheManager;
 taskManager?: TaskManager;
}

export class BackgroundProcessor {
 private cacheManager: CacheManager;
 private taskManager: TaskManager;
 private defaultTaskConfig: TaskConfig;

 constructor(config: BackgroundProcessorConfig = {}) {
 this.cacheManager = config.cacheManager || new CacheManager();
 this.taskManager = config.taskManager || new TaskManager();
 this.defaultTaskConfig = {
 checkInterval: config.checkInterval,
 timeout: config.timeout
 };
 }

 async process<T>(
 taskId: string,
 calculation: () => T | Promise<T>,
 config: BackgroundProcessorConfig = {}
 ): Promise<T> {
 const cached = this.cacheManager.get<T>(taskId);
 if (cached) {
 return cached;
 }

 const taskConfig = { ...this.defaultTaskConfig, ...config };
 const result = await this.taskManager.executeTask(taskId, calculation, taskConfig);
 this.cacheManager.set(taskId, result);
 
 return result;
 }

 async processWithCallback<T>(
 taskId: string,
 calculation: () => T | Promise<T>,
 onComplete?: (result: T) => void,
 config: BackgroundProcessorConfig = {}
 ): Promise<T> {
 const result = await this.process(taskId, calculation, config);
 
 if (onComplete) {
 onComplete(result);
 }
 
 return result;
 }

 isProcessing(taskId: string): boolean {
 return this.taskManager.isProcessing(taskId);
 }

 invalidateCache(pattern?: string): void {
 this.cacheManager.invalidate(pattern);
 }

 cancelTask(taskId: string): void {
 this.taskManager.cancelTask(taskId);
 }

 getCacheManager(): CacheManager {
 return this.cacheManager;
 }

 getTaskManager(): TaskManager {
 return this.taskManager;
 }
}
