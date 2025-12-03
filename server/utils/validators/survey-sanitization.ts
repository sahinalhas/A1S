import { sanitizeString } from '../../middleware/validation.js';
import type { SurveyQuestion } from '../../features/surveys/types/surveys.types.js';

export interface SurveyQuestionOption {
  text?: string;
  value?: string;
  [key: string]: unknown;
}

export interface SurveyQuestionData {
  questionText?: string;
  helpText?: string;
  placeholder?: string;
  options?: SurveyQuestionOption[];
  [key: string]: unknown;
}

export function sanitizeQuestionData(question: unknown): SurveyQuestion {
  const q = question as Record<string, unknown>;
  const sanitized = { ...q } as unknown as SurveyQuestion;

  if (typeof sanitized.questionText === 'string') {
    sanitized.questionText = sanitizeString(sanitized.questionText);
  }

  if ('helpText' in sanitized && typeof (sanitized as unknown as Record<string, unknown>).helpText === 'string') {
    (sanitized as unknown as Record<string, unknown>).helpText = sanitizeString((sanitized as unknown as Record<string, unknown>).helpText as string);
  }

  if ('placeholder' in sanitized && typeof (sanitized as unknown as Record<string, unknown>).placeholder === 'string') {
    (sanitized as unknown as Record<string, unknown>).placeholder = sanitizeString((sanitized as unknown as Record<string, unknown>).placeholder as string);
  }

  if (sanitized.options && Array.isArray(sanitized.options)) {
    sanitized.options = (q.options as unknown[]).map((opt: unknown) => {
      if (typeof opt === 'string') {
        return sanitizeString(opt);
      }
      const option = opt as Record<string, unknown>;
      return {
        ...option,
        text: typeof option.text === 'string' ? sanitizeString(option.text) : option.text,
        value: typeof option.value === 'string' ? sanitizeString(option.value) : option.value
      } as unknown as string;
    });
  }

  return sanitized;
}

export function sanitizeTemplateData(template: Record<string, unknown>): Record<string, unknown> {
  const sanitized = { ...template };

  if (typeof sanitized.title === 'string') {
    sanitized.title = sanitizeString(sanitized.title);
  }

  if (typeof sanitized.description === 'string') {
    sanitized.description = sanitizeString(sanitized.description);
  }

  if (typeof sanitized.category === 'string') {
    sanitized.category = sanitizeString(sanitized.category);
  }

  if (typeof sanitized.targetAudience === 'string') {
    sanitized.targetAudience = sanitizeString(sanitized.targetAudience);
  }

  return sanitized;
}
