/**
 * Backup and Security Routes
 * Yedekleme ve Güvenlik Rotaları
 */

import { Router } from 'express';
import multer from 'multer';
import { backupRateLimiter } from '../../../middleware/rate-limit.middleware.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';
import { backupService } from '../services/backup.service';
import { auditService } from '../services/audit.service';
import { encryptionService } from '../services/encryption.service';
import { requireSecureAuth, requireRoleSecure, type AuthenticatedRequest } from '../../../middleware/auth-secure.middleware.js';
import { logger } from '../../../utils/logger.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.originalname.endsWith('.sql') || file.originalname.endsWith('.sql.gz')) {
      cb(null, true);
    } else {
      cb(new Error('Sadece .sql veya .sql.gz dosyaları yüklenebilir'));
    }
  },
});

const router = Router();
router.use(validateSchoolAccess);

router.post('/create', requireSecureAuth, requireRoleSecure(['counselor']), backupRateLimiter, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { type = 'manual', options = {} } = req.body;
    
    const backup = await backupService.createBackup(authReq.user!.id, type, options);
    
    await auditService.logAccess({
      userId: authReq.user!.id,
      userName: authReq.user!.name,
      action: 'CREATE_BACKUP',
      resource: 'backup',
      resourceId: backup.id,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
    });
    
    res.json(backup);
  } catch (error) {
    console.error('Create backup error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: `Failed to create backup: ${errorMessage}` });
  }
});

router.get('/list', requireSecureAuth, async (req, res) => {
  try {
    const backups = await backupService.listBackups();
    res.json(backups);
  } catch (error) {
    console.error('List backups error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: `Failed to list backups: ${errorMessage}` });
  }
});

router.get('/download/:backupId', requireSecureAuth, requireRoleSecure(['counselor']), async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { backupId } = req.params;
    
    const result = await backupService.downloadBackup(backupId);
    
    await auditService.logAccess({
      userId: authReq.user!.id,
      userName: authReq.user!.name,
      action: 'DOWNLOAD_BACKUP',
      resource: 'backup',
      resourceId: backupId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
    });
    
    res.setHeader('Content-Type', result.compressed ? 'application/gzip' : 'application/sql');
    res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
    res.setHeader('Content-Length', result.size);
    res.send(result.data);
  } catch (error) {
    console.error('Download backup error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: `Failed to download backup: ${errorMessage}` });
  }
});

router.post('/restore/:backupId', requireSecureAuth, requireRoleSecure(['counselor']), backupRateLimiter, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { backupId } = req.params;
    
    await backupService.restoreBackup(backupId);
    
    await auditService.logAccess({
      userId: authReq.user!.id,
      userName: authReq.user!.name,
      action: 'RESTORE_BACKUP',
      resource: 'backup',
      resourceId: backupId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
    });
    
    res.json({ success: true, message: 'Backup restored successfully' });
  } catch (error) {
    console.error('Restore backup error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: `Failed to restore backup: ${errorMessage}` });
  }
});

router.post('/upload-restore', requireSecureAuth, requireRoleSecure(['counselor']), backupRateLimiter, upload.single('backup'), async (req, res) => {
  const authReq = req as AuthenticatedRequest;
  
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'Dosya yüklenmedi' });
    }
    
    console.log(`📤 Yedek dosyası yükleme başlatıldı: ${req.file.originalname} (${req.file.size} bytes) - Kullanıcı: ${authReq.user!.name}`);
    
    const isCompressed = req.file.originalname.endsWith('.gz');
    
    await backupService.uploadAndRestoreBackup(
      req.file.buffer,
      req.file.originalname,
      isCompressed
    );
    
    await auditService.logAccess({
      userId: authReq.user!.id,
      userName: authReq.user!.name,
      action: 'UPLOAD_RESTORE_BACKUP',
      resource: 'backup',
      resourceId: req.file.originalname,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
    });
    
    console.log(`✅ Yedek dosyası başarıyla yüklendi ve geri yüklendi: ${req.file.originalname}`);
    
    res.json({ success: true, message: 'Yedekleme dosyası başarıyla yüklendi ve geri yüklendi' });
  } catch (error) {
    console.error('❌ Upload and restore backup error:', error);
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isValidationError = errorMessage.includes('tehlikeli komutlar') || 
                             errorMessage.includes('geçersiz komutlar') ||
                             errorMessage.includes('boş veya geçersiz');
    
    await auditService.logAccess({
      userId: authReq.user!.id,
      userName: authReq.user!.name,
      action: 'UPLOAD_RESTORE_BACKUP',
      resource: 'backup',
      resourceId: req.file?.originalname || 'unknown',
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: false,
    }).catch(err => {
      logger.warn(`Failed to log audit trail: ${err instanceof Error ? err.message : 'unknown error'}`, 'BackupRoutes');
    });
    
    res.status(isValidationError ? 400 : 500).json({ success: false, error: `Failed to upload and restore backup: ${errorMessage}` });
  }
});

router.delete('/:backupId', requireSecureAuth, requireRoleSecure(['counselor']), backupRateLimiter, async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    const { backupId } = req.params;
    
    await backupService.deleteBackup(backupId);
    
    await auditService.logAccess({
      userId: authReq.user!.id,
      userName: authReq.user!.name,
      action: 'DELETE_BACKUP',
      resource: 'backup',
      resourceId: backupId,
      ipAddress: req.ip,
      userAgent: req.get('user-agent'),
      success: true,
    });
    
    res.json({ success: true, message: 'Backup deleted successfully' });
  } catch (error) {
    console.error('Delete backup error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    res.status(500).json({ success: false, error: `Failed to delete backup: ${errorMessage}` });
  }
});

router.get('/audit-logs', requireSecureAuth, requireRoleSecure(['counselor']), async (req, res) => {
  try {
    const { userId, action, resource, startDate, endDate, limit } = req.query;
    
    const logs = await auditService.queryLogs({
      userId: userId as string,
      action: action as string,
      resource: resource as string,
      startDate: startDate as string,
      endDate: endDate as string,
      limit: limit ? parseInt(limit as string) : 100,
    });
    
    res.json(logs);
  } catch (error) {
    console.error('Query audit logs error:', error);
    res.status(500).json({ success: false, error: 'Failed to query audit logs' });
  }
});

router.get('/audit-report/:userId', requireSecureAuth, requireRoleSecure(['counselor']), async (req, res) => {
  try {
    const { userId } = req.params;
    const { days = 30 } = req.query;
    
    const report = await auditService.getAccessReport(userId, parseInt(days as string));
    res.json(report);
  } catch (error) {
    console.error('Get audit report error:', error);
    res.status(500).json({ success: false, error: 'Failed to get audit report' });
  }
});

router.post('/encrypt', requireSecureAuth, requireRoleSecure(['counselor']), async (req, res) => {
  try {
    const { data, fields } = req.body;
    
    if (!data || !fields) {
      return res.status(400).json({ success: false, error: 'data and fields are required' });
    }
    
    const encrypted = encryptionService.encryptSensitiveFields(data, fields);
    res.json(encrypted);
  } catch (error) {
    console.error('Encrypt error:', error);
    res.status(500).json({ success: false, error: 'Failed to encrypt data' });
  }
});

router.post('/decrypt', requireSecureAuth, requireRoleSecure(['counselor']), async (req, res) => {
  try {
    const { data, fields } = req.body;
    
    if (!data || !fields) {
      return res.status(400).json({ success: false, error: 'data and fields are required' });
    }
    
    const decrypted = encryptionService.decryptSensitiveFields(data, fields);
    res.json(decrypted);
  } catch (error) {
    console.error('Decrypt error:', error);
    res.status(500).json({ success: false, error: 'Failed to decrypt data' });
  }
});

router.post('/anonymize', requireSecureAuth, requireRoleSecure(['counselor']), async (req, res) => {
  try {
    const { email, phone } = req.body;
    
    const result: any = {};
    
    if (email) {
      result.email = encryptionService.anonymizeEmail(email);
    }
    
    if (phone) {
      result.phone = encryptionService.anonymizePhone(phone);
    }
    
    res.json(result);
  } catch (error) {
    console.error('Anonymize error:', error);
    res.status(500).json({ success: false, error: 'Failed to anonymize data' });
  }
});

export default router;
