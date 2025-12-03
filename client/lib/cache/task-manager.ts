export interface TaskConfig {
 checkInterval?: number;
 timeout?: number;
}

export class TaskManager {
 private pendingTasks = new Set<string>();
 private taskPromises = new Map<string, Promise<any>>();

 async executeTask<T>(
 taskId: string,
 task: () => T | Promise<T>,
 config: TaskConfig = {}
 ): Promise<T> {
 const { checkInterval = 100, timeout = 30000 } = config;

 if (this.pendingTasks.has(taskId)) {
 const existingPromise = this.taskPromises.get(taskId);
 if (existingPromise) {
 return existingPromise as Promise<T>;
 }

 return this.waitForCompletion<T>(taskId, checkInterval, timeout);
 }

 this.pendingTasks.add(taskId);

 const taskPromise = this.runInBackground<T>(task);
 this.taskPromises.set(taskId, taskPromise);

 try {
 const result = await taskPromise;
 return result;
 } finally {
 this.pendingTasks.delete(taskId);
 this.taskPromises.delete(taskId);
 }
 }

 isProcessing(taskId: string): boolean {
 return this.pendingTasks.has(taskId);
 }

 cancelTask(taskId: string): void {
 this.pendingTasks.delete(taskId);
 this.taskPromises.delete(taskId);
 }

 private async runInBackground<T>(task: () => T | Promise<T>): Promise<T> {
 return new Promise((resolve, reject) => {
 setTimeout(async () => {
 try {
 const result = await task();
 resolve(result);
 } catch (error) {
 reject(error);
 }
 }, 0);
 });
 }

 private async waitForCompletion<T>(
 taskId: string,
 checkInterval: number,
 timeout: number
 ): Promise<T> {
 const startTime = Date.now();

 return new Promise((resolve, reject) => {
 const checkComplete = () => {
 if (Date.now() - startTime > timeout) {
 reject(new Error(`Task ${taskId} timed out`));
 return;
 }

 const promise = this.taskPromises.get(taskId);
 if (promise) {
 promise.then(resolve).catch(reject);
 } else if (!this.pendingTasks.has(taskId)) {
 reject(new Error(`Task ${taskId} completed without result`));
 } else {
 setTimeout(checkComplete, checkInterval);
 }
 };
 checkComplete();
 });
 }
}
