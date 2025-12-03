import { BaseAIAdapter } from './base-adapter.js';
import { OllamaAPIService, type OllamaMessage } from '../ollama-api.service.js';
import type { ChatCompletionRequest } from '../ai-provider.service.js';

export class OllamaAdapter extends BaseAIAdapter {
  private ollamaService: OllamaAPIService;

  constructor(model: string, temperature: number = 0, baseUrl?: string) {
    super(model, temperature);
    const url = baseUrl || process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
    this.ollamaService = new OllamaAPIService(url);
  }

  async isAvailable(): Promise<boolean> {
    return await this.ollamaService.checkHealth();
  }

  async listModels(): Promise<string[]> {
    const models = await this.ollamaService.listModels();
    return models.map(m => m.name);
  }

  async chat(request: ChatCompletionRequest): Promise<string> {
    try {
      const response = await this.ollamaService.chat({
        model: this.model,
        messages: request.messages as OllamaMessage[],
        temperature: request.temperature ?? this.temperature,
        format: request.format === 'json' ? 'json' : undefined
      });

      return response.message?.content || '';
    } catch (error) {
      console.error('Ollama API error:', error);
      throw new Error(`Ollama API failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async *chatStream(request: ChatCompletionRequest): AsyncGenerator<string, void, unknown> {
    yield* this.ollamaService.chatStream({
      model: this.model,
      messages: request.messages as OllamaMessage[],
      temperature: request.temperature ?? this.temperature,
      format: request.format === 'json' ? 'json' : undefined
    });
  }
}
