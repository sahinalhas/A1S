/**
 * DEPRECATED: Use server/prompts/counselor-prompts.ts instead
 * 
 * This service is kept for backward compatibility.
 * All new code should use CounselorPrompts from server/prompts/counselor-prompts.ts
 */

import { CounselorPrompts } from '../prompts/counselor-prompts.js';

export class AIPromptBuilder {
  /**
   * @deprecated Use CounselorPrompts.systemPrompt() instead
   */
  static buildCounselorSystemPrompt(): string {
    return CounselorPrompts.systemPrompt();
  }

  /**
   * @deprecated Use CounselorPrompts directly instead
   */
  static buildDeepAnalysisPrompt(question: string): string {
    return `${question}\n\n${CounselorPrompts.deepAnalysis()}`;
  }

  /**
   * @deprecated Use CounselorPrompts directly instead
   */
  static buildRiskAnalysisPrompt(): string {
    return CounselorPrompts.riskAnalysis();
  }

  /**
   * @deprecated Use CounselorPrompts directly instead
   */
  static buildMeetingSummaryPrompt(notes: string, meetingType: string = 'görüşme'): string {
    const base = CounselorPrompts.systemPrompt();
    return `${base}\n\nAşağıdaki ${meetingType} notlarından profesyonel bir özet hazırla:\n\n${notes}`;
  }

  /**
   * @deprecated Use CounselorPrompts directly instead
   */
  static buildParentMeetingPrepPrompt(): string {
    return `${CounselorPrompts.systemPrompt()}\n\nVeli görüşmesi için hazırlık notları hazırla.`;
  }

  /**
   * @deprecated Use CounselorPrompts directly instead
   */
  static buildInterventionPlanPrompt(focusArea: string): string {
    return `${CounselorPrompts.systemPrompt()}\n\n"${focusArea}" konusunda müdahale planı hazırla.`;
  }

  /**
   * @deprecated Use CounselorPrompts directly instead
   */
  static buildContextualSystemPrompt(studentContext: string): string {
    const base = CounselorPrompts.systemPrompt();
    return `${base}\n\n---\n\n# MEVCUT ÖĞRENCİ HAKKINDA BİLGİLER:\n\n${studentContext}`;
  }
}

export default AIPromptBuilder;
