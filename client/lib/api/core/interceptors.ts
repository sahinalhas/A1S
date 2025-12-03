import { toast } from "sonner";
import { logger } from "../../utils/logger";
import { getSelectedSchoolId } from "../../school-context";

export type RequestInterceptor = (config: RequestInit, endpoint: string) => RequestInit | Promise<RequestInit>;
export type ResponseInterceptor = (response: Response, endpoint: string) => Response | Promise<Response>;
export type ErrorInterceptor = (error: Error, endpoint: string, method: string) => void | Promise<void>;

export interface ToastConfig {
 showSuccessToast?: boolean;
 successMessage?: string;
 showErrorToast?: boolean;
 errorMessage?: string;
 errorDescription?: string;
}

export class InterceptorManager {
 private requestInterceptors: RequestInterceptor[] = [];
 private responseInterceptors: ResponseInterceptor[] = [];
 private errorInterceptors: ErrorInterceptor[] = [];

 addRequestInterceptor(interceptor: RequestInterceptor): void {
 this.requestInterceptors.push(interceptor);
 }

 removeRequestInterceptor(interceptor: RequestInterceptor): void {
 const index = this.requestInterceptors.indexOf(interceptor);
 if (index > -1) {
 this.requestInterceptors.splice(index, 1);
 }
 }

 addResponseInterceptor(interceptor: ResponseInterceptor): void {
 this.responseInterceptors.push(interceptor);
 }

 removeResponseInterceptor(interceptor: ResponseInterceptor): void {
 const index = this.responseInterceptors.indexOf(interceptor);
 if (index > -1) {
 this.responseInterceptors.splice(index, 1);
 }
 }

 addErrorInterceptor(interceptor: ErrorInterceptor): void {
 this.errorInterceptors.push(interceptor);
 }

 removeErrorInterceptor(interceptor: ErrorInterceptor): void {
 const index = this.errorInterceptors.indexOf(interceptor);
 if (index > -1) {
 this.errorInterceptors.splice(index, 1);
 }
 }

 async applyRequestInterceptors(config: RequestInit, endpoint: string): Promise<RequestInit> {
 let modifiedConfig = config;
 for (const interceptor of this.requestInterceptors) {
 modifiedConfig = await interceptor(modifiedConfig, endpoint);
 }
 return modifiedConfig;
 }

 async applyResponseInterceptors(response: Response, endpoint: string): Promise<Response> {
 let modifiedResponse = response;
 for (const interceptor of this.responseInterceptors) {
 modifiedResponse = await interceptor(modifiedResponse, endpoint);
 }
 return modifiedResponse;
 }

 async applyErrorInterceptors(error: Error, endpoint: string, method: string): Promise<void> {
 for (const interceptor of this.errorInterceptors) {
 await interceptor(error, endpoint, method);
 }
 }
}

export function createDefaultErrorInterceptor(toastConfig: ToastConfig): ErrorInterceptor {
 return (error: Error, endpoint: string, method: string) => {
 logger.error(`API Error [${method} ${endpoint}]`, 'APIClient', error);
 
 if (toastConfig.showErrorToast) {
 const errMsg = toastConfig.errorMessage || 'İşlem sırasında bir hata oluştu';
 toast.error(errMsg, toastConfig.errorDescription ? { description: toastConfig.errorDescription } : undefined);
 }
 };
}

export function createDefaultSuccessInterceptor(toastConfig: ToastConfig): ResponseInterceptor {
 return (response: Response) => {
 if (toastConfig.showSuccessToast && toastConfig.successMessage) {
 toast.success(toastConfig.successMessage);
 }
 return response;
 };
}

export function createSchoolHeaderInterceptor(): RequestInterceptor {
 return (config: RequestInit, endpoint: string) => {
 const authEndpoints = [
   '/api/users/login', 
   '/api/users/logout', 
   '/api/users/current', 
   '/api/users/register', 
   '/api/schools/my-schools', 
   '/api/schools',
   '/api/anket/'
 ];
 if (authEndpoints.some(e => endpoint.includes(e))) {
 return config;
 }
 
 const schoolId = getSelectedSchoolId();
 if (schoolId) {
 const headers = new Headers(config.headers);
 headers.set('X-School-Id', schoolId);
 return { ...config, headers };
 }
 
 logger.warn('No school selected for request', 'SchoolHeaderInterceptor', { endpoint });
 return config;
 };
}
