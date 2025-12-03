import { Router } from 'express';
import { EnhancedRiskPredictionService } from '../../../services/enhanced-risk-prediction.service';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

const router = Router();
router.use(validateSchoolAccess);
const riskService = new EnhancedRiskPredictionService();

router.get('/score/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const riskScore = await riskService.calculateEnhancedRiskScore(studentId);
    
    await riskService.saveRiskScoreToHistory(riskScore);
    
    res.json({
      success: true,
      data: riskScore
    });
  } catch (error) {
    console.error('Enhanced risk score error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

router.get('/trend/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const trendAnalysis = await riskService.calculateTrendAnalysis(studentId);
    
    res.json({
      success: true,
      data: trendAnalysis
    });
  } catch (error) {
    console.error('Trend analysis error:', error);
    res.status(500).json({
      success: false,
      error: (error instanceof Error ? error.message : String(error)) || 'Trend analizi yapılamadı'
    });
  }
});

router.post('/batch-calculate', async (req, res) => {
  try {
    const { studentIds } = req.body;
    
    if (!Array.isArray(studentIds)) {
      return res.status(400).json({
        success: false,
        error: 'studentIds bir dizi olmalıdır'
      });
    }

    const results = await Promise.all(
      studentIds.map(id => riskService.calculateEnhancedRiskScore(id).catch(err => ({
        studentId: id,
        error: err.message
      })))
    );

    for (const result of results) {
      if (!('error' in result)) {
        await riskService.saveRiskScoreToHistory(result);
      }
    }

    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Batch calculation error:', error);
    res.status(500).json({
      success: false,
      error: (error instanceof Error ? error.message : String(error)) || 'Toplu hesaplama başarısız'
    });
  }
});

export default router;
