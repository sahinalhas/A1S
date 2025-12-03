import { Router } from 'express';
import { SocialNetworkAnalysisService } from '../../../services/social-network-analysis.service';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

const router = Router();
router.use(validateSchoolAccess);
const socialNetworkService = new SocialNetworkAnalysisService();

router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params;
    const analysis = await socialNetworkService.analyzeStudentNetwork(studentId);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Student network analysis error:', error);
    res.status(500).json({
      success: false,
      error: (error instanceof Error ? error.message : String(error)) || 'Sosyal ağ analizi yapılamadı'
    });
  }
});

router.get('/class/:className', async (req, res) => {
  try {
    const { className } = req.params;
    const analysis = await socialNetworkService.analyzeClassNetwork(className);
    
    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Class network analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
