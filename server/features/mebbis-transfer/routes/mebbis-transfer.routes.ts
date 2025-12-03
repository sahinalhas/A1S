import { validateSchoolAccess, type SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';
import { Router, type Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { mebbisTransferManager } from '../services/mebbis-transfer-manager.service.js';
import type { StartTransferRequest } from '@shared/types/mebbis-transfer.types';
import { logger } from '../../../utils/logger.js';
import { readFileSync, existsSync } from 'fs';

const router = Router();
router.use(validateSchoolAccess);

router.post('/start-transfer', async (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const bodyRequest = req.body as Omit<StartTransferRequest, 'schoolId'>;
    
    const request: StartTransferRequest = {
      ...bodyRequest,
      schoolId
    };
    
    if (!request.sessionIds || request.sessionIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'En az bir görüşme seçilmelidir'
      });
    }

    const transferId = uuidv4();
    
    logger.info(`Starting MEBBIS transfer ${transferId} for ${request.sessionIds.length} sessions (school: ${schoolId})`, 'MEBBISRoutes');
    
    mebbisTransferManager.startTransfer(transferId, request);
    
    res.json({
      success: true,
      transferId,
      totalSessions: request.sessionIds.length,
      message: 'MEBBIS aktarımı başlatıldı'
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to start MEBBIS transfer', 'MEBBISRoutes', error);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

router.post('/cancel-transfer', async (req, res) => {
  try {
    const { transferId } = req.body;
    
    if (!transferId) {
      return res.status(400).json({
        success: false,
        error: 'transferId gereklidir'
      });
    }

    logger.info(`Cancelling MEBBIS transfer ${transferId}`, 'MEBBISRoutes');
    
    await mebbisTransferManager.cancelTransfer(transferId);
    
    res.json({
      success: true,
      message: 'Aktarım iptal edildi'
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to cancel MEBBIS transfer', 'MEBBISRoutes', error);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

router.get('/status/:transferId', async (req, res) => {
  try {
    const { transferId } = req.params;
    
    if (!transferId) {
      return res.status(400).json({
        success: false,
        error: 'transferId gereklidir'
      });
    }

    const status = mebbisTransferManager.getStatus(transferId);
    
    if (!status) {
      return res.status(404).json({
        success: false,
        error: 'Aktarım bulunamadı'
      });
    }
    
    res.json({
      success: true,
      transferId,
      status: status.status,
      progress: status.progress,
      errors: status.errors
    });
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to get MEBBIS transfer status', 'MEBBISRoutes', error);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

router.get('/qr-code', async (req, res) => {
  try {
    const qrPath = './data/mebbis-qr-code.png';
    
    if (!existsSync(qrPath)) {
      return res.status(404).json({
        success: false,
        error: 'QR code bulunamadı'
      });
    }
    
    const imageBuffer = readFileSync(qrPath);
    res.set('Content-Type', 'image/png');
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.send(imageBuffer);
  } catch (error) {
    const err = error as Error;
    logger.error('Failed to get QR code', 'MEBBISRoutes', error);
    res.status(500).json({
      success: false,
      error: err.message
    });
  }
});

export default router;
