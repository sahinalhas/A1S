/**
 * Disabled AI Adapter
 * API key olmadığında kullanılır - AI özellikleri disabled olur
 */

import { BaseAIAdapter } from './base-adapter.js';
import type { ChatCompletionRequest } from '../ai-provider.service.js';

export class DisabledAdapter extends BaseAIAdapter {
  private providerName: string;

  constructor(providerName: string, model: string) {
    super(model, 0);
    this.providerName = providerName;
  }

  async chat(request: ChatCompletionRequest): Promise<string> {
    throw new Error(`${this.providerName} AI özellikleri devre dışı: API key tanımlı değil. Lütfen .env dosyasına ${this.providerName.toUpperCase()}_API_KEY ekleyin.`);
  }

  async *chatStream(request: ChatCompletionRequest): AsyncGenerator<string, void, unknown> {
    throw new Error(`${this.providerName} AI özellikleri devre dışı: API key tanımlı değil. Lütfen .env dosyasına ${this.providerName.toUpperCase()}_API_KEY ekleyin.`);
  }

  async isAvailable(): Promise<boolean> {
    return false;
  }

  async listModels(): Promise<string[]> {
    return [];
  }
}
