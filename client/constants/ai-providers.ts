/**
 * AI Provider Constants
 * Centralized AI provider information and configuration
 */

import { Cloud, Sparkles, Server, LucideIcon } from 'lucide-react';

export type AIProviderType = 'gemini' | 'openai' | 'ollama';

export interface AIModel {
  value: string;
  name: string;
  description: string;
  speed?: 'fast' | 'balanced' | 'powerful';
  contextWindow?: string;
  recommended?: boolean;
}

export interface AIProviderInfo {
  name: string;
  description: string;
  icon: LucideIcon;
  color: string;
  features: string[];
  models: AIModel[];
}

export const AI_PROVIDERS: Record<AIProviderType, AIProviderInfo> = {
  gemini: {
    name: 'Google Gemini',
    description: 'Google\'ın en yeni yapay zeka modeli. Ücretsiz ve güçlü.',
    icon: Cloud,
    color: 'from-blue-500 to-cyan-500',
    features: ['Ücretsiz kullanım', 'Yüksek performans', 'Geniş token limiti', 'Makul kullanımda sınırsız'],
    models: [
      { value: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash', description: 'En hızlı ve verimli model', speed: 'fast', contextWindow: '128K', recommended: true },
      { value: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro', description: 'En güçlü model, karmaşık görevler için', speed: 'powerful', contextWindow: '200K' },
      { value: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', description: 'Dengeli performans ve hız', speed: 'balanced', contextWindow: '128K' },
      { value: 'gemini-2.0-flash-exp', name: 'Gemini 2.0 Flash Exp', description: 'Deneysel özellikler ile', speed: 'fast', contextWindow: '128K' }
    ]
  },
  openai: {
    name: 'OpenAI',
    description: 'ChatGPT\'nin arkasındaki teknoloji. Ücretli ama çok güçlü.',
    icon: Sparkles,
    color: 'from-green-500 to-emerald-500',
    features: ['GPT-4 desteği', 'Yüksek kalite', 'Geniş dil desteği', 'API key gerekli'],
    models: [
      { value: 'gpt-4o-mini', name: 'GPT-4o Mini', description: 'Hızlı ve ekonomik', speed: 'fast', contextWindow: '128K', recommended: true },
      { value: 'gpt-4o', name: 'GPT-4o', description: 'En yeni ve güçlü model', speed: 'powerful', contextWindow: '128K' },
      { value: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Dengeli güç ve hız', speed: 'balanced', contextWindow: '128K' },
      { value: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Hızlı ve ekonomik', speed: 'fast', contextWindow: '16K' }
    ]
  },
  ollama: {
    name: 'Ollama (Lokal)',
    description: 'Kendi bilgisayarınızda çalışan açık kaynak modeller. Tamamen ücretsiz ve özel.',
    icon: Server,
    color: 'from-purple-500 to-pink-500',
    features: ['Tamamen ücretsiz', 'Veri gizliliği', 'İnternet gerektirmez', 'Yerel kontrol'],
    models: []
  }
};

export const AI_FEATURES = [
  { name: 'AI Sohbet Asistanı', description: 'Doğal dilde sohbet yapabilen akıllı asistan' },
  { name: 'Günlük AI Insights', description: 'Günlükler için otomatik analiz ve öneriler' },
  { name: 'Toplu Veri Analizi', description: 'Çoklu kayıt analizi ve raporlama' },
  { name: 'Risk Tahmini', description: 'Gelecekteki riskleri öngörme' },
  { name: 'Müdahale Önerileri', description: 'Duruma özel aksiyon önerileri' },
  { name: 'Otomatik Raporlama', description: 'PDF raporları otomatik oluşturma' }
];
