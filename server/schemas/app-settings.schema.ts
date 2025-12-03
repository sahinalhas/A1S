/**
 * Zod schemas for application settings validation
 * Provides type-safe runtime validation and parsing
 */

import { z } from 'zod';

/**
 * AI Provider configuration schema
 */
export const AIProviderConfigSchema = z.object({
  provider: z.enum(['openai', 'ollama', 'gemini']),
  model: z.string().min(1),
  ollamaBaseUrl: z.string().url().optional(),
});

export type AIProviderConfig = z.infer<typeof AIProviderConfigSchema>;

/**
 * Complete application settings schema
 */
export const AppSettingsSchema = z.object({
  aiProvider: AIProviderConfigSchema.optional(),
});

export type AppSettings = z.infer<typeof AppSettingsSchema>;

/**
 * Session user data schema
 */
export const SessionUserDataSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  role: z.string().min(1),
  permissions: z.array(z.string()).default([]),
  institution: z.string().default(''),
});

export type SessionUserData = z.infer<typeof SessionUserDataSchema>;

/**
 * Safe JSON parse with Zod validation
 * Returns parsed and validated data or default value on error
 */
export function safeJsonParse<T>(
  schema: z.ZodSchema<T>,
  jsonString: string | null | undefined,
  defaultValue: T,
  context?: string
): T {
  if (!jsonString) {
    return defaultValue;
  }

  try {
    const parsed = JSON.parse(jsonString);
    const result = schema.safeParse(parsed);
    
    if (result.success) {
      return result.data;
    }
    
    console.warn(
      `Schema validation failed${context ? ` for ${context}` : ''}:`,
      result.error.format()
    );
    return defaultValue;
  } catch (error) {
    console.warn(
      `JSON parse failed${context ? ` for ${context}` : ''}:`,
      error instanceof Error ? error.message : String(error)
    );
    return defaultValue;
  }
}

/**
 * Validate and parse data with Zod schema
 * Throws ValidationError if validation fails
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  context?: string
): T {
  const result = schema.safeParse(data);
  
  if (!result.success) {
    const errors = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
    throw new Error(
      `Validation failed${context ? ` for ${context}` : ''}: ${errors}`
    );
  }
  
  return result.data;
}
