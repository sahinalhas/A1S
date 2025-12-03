/**
 * Audit Middleware
 * KVKK Uyumluluk için otomatik loglama
 */

import { Request, Response, NextFunction } from 'express';
import { auditService } from '../services/audit.service';

export function auditMiddleware(action: string, resource: string) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const userId = (req as any).user?.id || 'anonymous';
    const userName = (req as any).user?.name || 'Anonymous';
    const resourceId = req.params.id || req.params.studentId || req.body.id;
    
    const originalSend = res.send.bind(res);
    let responseBody: any;
    
    res.send = function(body: any) {
      responseBody = body;
      return originalSend(body);
    };
    
    res.on('finish', async () => {
      const duration = Date.now() - startTime;
      const success = res.statusCode < 400;
      
      try {
        await auditService.logAccess({
          userId,
          userName,
          action,
          resource,
          resourceId,
          ipAddress: req.ip,
          userAgent: req.get('user-agent'),
          details: {
            method: req.method,
            path: req.path,
            query: req.query,
            statusCode: res.statusCode,
            duration,
          },
          success,
          errorMessage: success ? undefined : responseBody?.error || responseBody?.message,
        });
      } catch (error) {
        console.error('Audit logging failed:', error);
      }
    });
    
    next();
  };
}
