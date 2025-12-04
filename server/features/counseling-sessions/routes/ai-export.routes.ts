import { Request, Response } from 'express';
import { 
  exportSessionsForAI, 
  generateAIAnalysisPrompt, 
  aggregateSessionDataForStudent 
} from '../services/ai-export.service.js';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';

export function exportForAI(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { sessionIds } = req.query;
    
    let ids: string[] | undefined;
    if (sessionIds) {
      ids = Array.isArray(sessionIds) ? sessionIds as string[] : [sessionIds as string];
    }

    const aiReadyData = exportSessionsForAI(schoolId, ids);
    
    res.json({
      format: 'ai-ready',
      version: '1.0',
      exportedAt: new Date().toISOString(),
      count: aiReadyData.length,
      data: aiReadyData
    });
  } catch (error) {
    console.error('Error exporting sessions for AI:', error);
    res.status(500).json({ success: false, error: 'AI formatına dönüştürme başarısız' });
  }
}

export function generatePrompt(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({ success: false, error: 'Görüşme ID gereklidir' });
    }

    const sessionData = exportSessionsForAI(schoolId, [sessionId])[0];
    
    if (!sessionData) {
      return res.status(404).json({ success: false, error: 'Görüşme bulunamadı' });
    }

    const prompt = generateAIAnalysisPrompt(sessionData);
    
    res.json({
      sessionId,
      prompt,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error generating AI prompt:', error);
    res.status(500).json({ success: false, error: 'Prompt oluşturulamadı' });
  }
}

export function getStudentAggregation(req: Request, res: Response) {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId!;
    const { studentId } = req.params;
    
    if (!studentId) {
      return res.status(400).json({ success: false, error: 'Öğrenci ID gereklidir' });
    }

    const aggregation = aggregateSessionDataForStudent(studentId, schoolId);
    
    res.json({
      studentId,
      aggregation,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error aggregating student data:', error);
    res.status(500).json({ success: false, error: 'Veri toplanamadı' });
  }
}
