/**
 * AI Disabled Interceptor
 * Special handling for AI disabled errors (403)
 */

import { toast } from 'sonner';
import type { ResponseInterceptor } from '../core/interceptors';

export const aiDisabledInterceptor: ResponseInterceptor = async (response: Response, endpoint: string) => {
  // Check if it's a 403 error (AI might be disabled)
  if (response.status === 403) {
    try {
      const clonedResponse = response.clone();
      const data = await clonedResponse.json();
      
      // Check if the error message indicates AI is disabled
      if (data.error?.includes('AI özellikleri') || data.error?.includes('AI features')) {
        toast.error('AI Özellikleri Kapalı', {
          description: 'Lütfen Ayarlar > AI Yapılandırması sayfasından AI özelliklerini aktif edin.',
          duration: 5000
        });
      }
    } catch (error) {
      // Ignore JSON parse errors
    }
  }
  
  return response;
};
