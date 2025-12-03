/**
 * Survey AI Analysis Routes
 */

import { Router } from 'express';
import { SurveyAIAnalysisService } from '../services/modules/ai-analysis.service.js';
import getDatabase from '../../../lib/database.js';
import { validateSchoolAccess } from '../../../middleware/school-access.middleware.js';

const router = Router();
router.use(validateSchoolAccess);
const aiAnalysisService = new SurveyAIAnalysisService();

/**
 * POST /api/surveys/ai-analysis/analyze/:distributionId
 * Anket sonuçlarını AI ile analiz et
 */
router.post('/analyze/:distributionId', async (req, res) => {
  try {
    const { distributionId } = req.params;
    const db = getDatabase();

    // Get distribution data
    const distribution = db.prepare(`
      SELECT d.*, t.title, t.description 
      FROM survey_distributions d
      JOIN survey_templates t ON d.template_id = t.id
      WHERE d.id = ?
    `).get(distributionId) as any;

    if (!distribution) {
      return res.status(404).json({
        success: false,
        error: 'Anket dağıtımı bulunamadı'
      });
    }

    // Get questions
    const questions = db.prepare(`
      SELECT * FROM survey_questions 
      WHERE template_id = ?
      ORDER BY question_order
    `).all(distribution.template_id) as any[];

    // Get responses
    const responses = db.prepare(`
      SELECT * FROM survey_responses 
      WHERE distribution_id = ?
    `).all(distributionId) as any[];

    const analysis = await aiAnalysisService.analyzeSurveyResults({
      title: distribution.title,
      description: distribution.description,
      responses,
      questions
    });

    res.json({
      success: true,
      data: analysis
    });
  } catch (error: unknown) {
    console.error('Survey analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Anket analizi başarısız'
    });
  }
});

/**
 * POST /api/surveys/ai-analysis/compare-classes
 * Sınıflar arası karşılaştırma
 */
router.post('/compare-classes', async (req, res) => {
  try {
    const { distributionId } = req.body;
    const db = getDatabase();

    // Get responses grouped by class
    const responses = db.prepare(`
      SELECT sr.*, s.class 
      FROM survey_responses sr
      JOIN students s ON sr.student_id = s.id
      WHERE sr.distribution_id = ?
    `).all(distributionId);

    // Group by class
    const classeData: any = {};
    responses.forEach((r: any) => {
      if (!classeData[r.class]) {
        classeData[r.class] = [];
      }
      classeData[r.class].push(r);
    });

    // Get student counts per class
    const classStudentCounts = db.prepare(`
      SELECT class, COUNT(*) as count 
      FROM students 
      GROUP BY class
    `).all() as any[];

    const classesDataArray = Object.keys(classeData).map(className => ({
      className,
      responses: classeData[className],
      studentCount: classStudentCounts.find((c: any) => c.class === className)?.count || 0
    }));

    const analysis = await aiAnalysisService.compareClassResults(classesDataArray);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error: unknown) {
    console.error('Class comparison error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Sınıf karşılaştırması başarısız'
    });
  }
});

/**
 * POST /api/surveys/ai-analysis/trends
 * Anket trendlerini analiz et
 */
router.post('/trends', async (req, res) => {
  try {
    const { templateId } = req.body;
    const db = getDatabase();

    // Get historical data for this survey template
    const historicalData = db.prepare(`
      SELECT 
        d.created_at as date,
        t.title as surveyTitle,
        COUNT(r.id) as responseCount,
        AVG(CAST(r.answers as REAL)) as averageScore
      FROM survey_distributions d
      JOIN survey_templates t ON d.template_id = t.id
      LEFT JOIN survey_responses r ON d.id = r.distribution_id
      WHERE d.template_id = ?
      GROUP BY d.id
      ORDER BY d.created_at DESC
      LIMIT 12
    `).all(templateId) as any[];

    const analysis = await aiAnalysisService.analyzeTrends(historicalData);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error: unknown) {
    console.error('Trend analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Trend analizi başarısız'
    });
  }
});

/**
 * POST /api/surveys/ai-analysis/open-ended
 * Açık uçlu cevapları analiz et
 */
router.post('/open-ended', async (req, res) => {
  try {
    const { distributionId, questionId } = req.body;
    const db = getDatabase();

    // Get open-ended responses for this question
    const responses = db.prepare(`
      SELECT answers FROM survey_responses 
      WHERE distribution_id = ?
    `).all(distributionId);

    // Extract answers for the specific question
    const openEndedAnswers = responses
      .map((r: any) => {
        try {
          const answers = JSON.parse(r.answers);
          return answers[questionId];
        } catch {
          return null;
        }
      })
      .filter(Boolean)
      .filter((a: any) => typeof a === 'string' && a.trim().length > 0);

    const analysis = await aiAnalysisService.analyzeOpenEndedResponses(openEndedAnswers);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error: unknown) {
    console.error('Open-ended analysis error:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Açık uçlu analiz başarısız'
    });
  }
});

export default router;
