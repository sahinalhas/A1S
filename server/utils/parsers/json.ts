/**
 * JSON Parsing Utilities
 * Safe JSON parsing with error handling and logging
 */

/**
 * Safely parse JSON with fallback value
 * Prevents crashes from malformed JSON data
 * 
 * @param jsonString - The JSON string to parse
 * @param fallback - Default value to return if parsing fails
 * @param context - Optional context for error logging (e.g., "user session", "student profile")
 * @returns Parsed object or fallback value
 */
export function safeJsonParse<T>(
  jsonString: string | null | undefined,
  fallback: T,
  context?: string
): T {
  if (!jsonString) {
    return fallback;
  }

  try {
    return JSON.parse(jsonString) as T;
  } catch (error) {
    const errorMessage = context 
      ? `JSON parse error in ${context}: ${error instanceof Error ? error.message : String(error)}`
      : `JSON parse error: ${error instanceof Error ? error.message : String(error)}`;
    
    console.error(errorMessage, {
      jsonPreview: jsonString.substring(0, 100),
      fallbackUsed: true
    });
    
    return fallback;
  }
}

/**
 * Safely parse JSON array with fallback
 * 
 * @param jsonString - The JSON string to parse
 * @param fallback - Default array to return if parsing fails
 * @param context - Optional context for error logging
 * @returns Parsed array or fallback array
 */
export function safeJsonParseArray<T>(
  jsonString: string | null | undefined,
  fallback: T[] = [],
  context?: string
): T[] {
  const result = safeJsonParse<T[]>(jsonString, fallback, context);
  
  // Ensure result is an array
  if (!Array.isArray(result)) {
    console.error(`Expected array but got ${typeof result}${context ? ` in ${context}` : ''}`);
    return fallback;
  }
  
  return result;
}

/**
 * Safely parse JSON object with fallback
 * 
 * @param jsonString - The JSON string to parse
 * @param fallback - Default object to return if parsing fails
 * @param context - Optional context for error logging
 * @returns Parsed object or fallback object
 */
export function safeJsonParseObject<T extends Record<string, any>>(
  jsonString: string | null | undefined,
  fallback: T,
  context?: string
): T {
  const result = safeJsonParse<T>(jsonString, fallback, context);
  
  // Ensure result is an object
  if (typeof result !== 'object' || result === null || Array.isArray(result)) {
    console.error(`Expected object but got ${typeof result}${context ? ` in ${context}` : ''}`);
    return fallback;
  }
  
  return result;
}
