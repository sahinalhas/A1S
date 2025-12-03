import { RequestHandler } from 'express';
import { AIProviderService } from '../../../services/ai-provider.service.js';
import { StudentContextService } from '../../../services/student-context.service.js';
import { CounselorPrompts } from '../../../prompts/counselor-prompts.js';
import type { SchoolScopedRequest } from '../../../middleware/school-access.middleware.js';
import * as studentsRepository from '../../students/repository/students.repository.js';

const aiProvider = AIProviderService.getInstance();
const contextService = new StudentContextService();

/**
 * POST /api/ai-assistant/meeting-prep/parent
 * Veli görüşmesi hazırlık notları
 */
export const generateParentMeetingPrep: RequestHandler = async (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    const { studentId } = req.body;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Öğrenci ID gerekli'
      });
    }
    
    if (schoolId) {
      const student = studentsRepository.getStudentByIdAndSchool(studentId, schoolId);
      if (!student) {
        return res.status(403).json({
          success: false,
          error: 'Bu öğrenciye erişim izniniz yok veya öğrenci bulunamadı'
        });
      }
    }
    
    const context = await contextService.getStudentContext(studentId);
    const contextText = contextService.formatContextForAI(context);
    
    const systemPrompt = CounselorPrompts.systemPrompt(contextText);
    const prepPrompt = CounselorPrompts.parentMeetingPrep();
    
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: prepPrompt }
    ];
    
    const prep = await aiProvider.chat({
      messages,
      temperature: 0.3
    });
    
    res.json({
      success: true,
      data: { prep }
    });
  } catch (error: unknown) {
    console.error('Error generating parent meeting prep:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Veli görüşmesi hazırlığı oluşturulamadı'
    });
  }
};

/**
 * POST /api/ai-assistant/meeting-prep/intervention
 * Müdahale planı oluştur
 */
export const generateInterventionPlan: RequestHandler = async (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    const { studentId, focusArea } = req.body;
    
    if (!studentId || !focusArea) {
      return res.status(400).json({
        success: false,
        error: 'Öğrenci ID ve odak alan gerekli'
      });
    }
    
    if (schoolId) {
      const student = studentsRepository.getStudentByIdAndSchool(studentId, schoolId);
      if (!student) {
        return res.status(403).json({
          success: false,
          error: 'Bu öğrenciye erişim izniniz yok veya öğrenci bulunamadı'
        });
      }
    }
    
    const context = await contextService.getStudentContext(studentId);
    const contextText = contextService.formatContextForAI(context);
    
    const systemPrompt = CounselorPrompts.systemPrompt(contextText);
    const interventionPrompt = CounselorPrompts.interventionPlan(focusArea);
    
    const messages = [
      { role: 'system' as const, content: systemPrompt },
      { role: 'user' as const, content: interventionPrompt }
    ];
    
    const plan = await aiProvider.chat({
      messages,
      temperature: 0.3
    });
    
    res.json({
      success: true,
      data: { plan }
    });
  } catch (error: unknown) {
    console.error('Error generating intervention plan:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Müdahale planı oluşturulamadı'
    });
  }
};

/**
 * POST /api/ai-assistant/meeting-prep/teacher
 * Öğretmen toplantısı brifingi
 */
export const generateTeacherMeetingPrep: RequestHandler = async (req, res) => {
  try {
    const schoolId = (req as SchoolScopedRequest).schoolId;
    const { studentId, meetingPurpose } = req.body;
    
    if (!studentId) {
      return res.status(400).json({
        success: false,
        error: 'Öğrenci ID gerekli'
      });
    }
    
    if (schoolId) {
      const student = studentsRepository.getStudentByIdAndSchool(studentId, schoolId);
      if (!student) {
        return res.status(403).json({
          success: false,
          error: 'Bu öğrenciye erişim izniniz yok veya öğrenci bulunamadı'
        });
      }
    }
    
    const context = await contextService.getStudentContext(studentId);
    const contextText = contextService.formatContextForAI(context);
    
    const prompt = `Öğretmen toplantısı için hazırlık brifingi oluştur.

TOPLANTI AMACI: ${meetingPurpose || 'Genel durum değerlendirmesi'}

## TOPLANTI BRİFİNGİ:

### 1. ÖĞRENCİ DURUMU ÖZETİ
[Kısa ve öz durum özeti]

### 2. PAYLAŞILACAK VERİLER
[Öğretmenlerle paylaşılabilecek somut veriler]

### 3. TARTIŞILACAK KONULAR
[Ana gündem maddeleri]

### 4. İŞBİRLİĞİ ÖNERİLERİ
[Öğretmenlerin yapabileceği destekler]

### 5. BEKLENEN ÇIKTILAR
[Toplantıdan beklenen sonuçlar]`;

    const messages = [
      {
        role: 'system' as const,
        content: CounselorPrompts.systemPrompt(contextText)
      },
      { role: 'user' as const, content: prompt }
    ];
    
    const brief = await aiProvider.chat({
      messages,
      temperature: 0.3
    });
    
    res.json({
      success: true,
      data: { brief }
    });
  } catch (error: unknown) {
    console.error('Error generating teacher meeting prep:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : String(error) || 'Öğretmen toplantısı brifingi oluşturulamadı'
    });
  }
};
