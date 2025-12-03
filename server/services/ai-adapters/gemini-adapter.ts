import { BaseAIAdapter } from './base-adapter.js';
import type { ChatCompletionRequest } from '../ai-provider.service.js';
import { GoogleGenAI } from '@google/genai';
import { aiConfig } from '../../config/index.js';

// Blueprint reference: blueprint:javascript_gemini
// Using Gemini AI for chat completions with streaming support

export class GeminiAdapter extends BaseAIAdapter {
  private ai: GoogleGenAI;

  constructor(model: string, temperature: number = 0) {
    super(model, temperature);
    const apiKey = aiConfig.gemini.apiKey;
    if (!apiKey || apiKey.trim().length === 0) {
      console.warn('⚠️ Gemini API key not configured - AI features will be limited');
      throw new Error('Gemini API key not configured');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async isAvailable(): Promise<boolean> {
    return aiConfig.gemini.enabled;
  }

  async listModels(): Promise<string[]> {
    return ['gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-2.0-flash-exp'];
  }

  async chat(request: ChatCompletionRequest): Promise<string> {
    try {
      const systemMessage = request.messages.find(m => m.role === 'system');
      const userMessages = request.messages.filter(m => m.role !== 'system');

      const contents = userMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const config: any = {
        temperature: request.temperature ?? this.temperature,
      };

      if (systemMessage) {
        config.systemInstruction = systemMessage.content;
      }

      if (request.format === 'json') {
        config.responseMimeType = 'application/json';
      }

      const response = await this.ai.models.generateContent({
        model: this.model,
        contents: contents,
        config: config
      });

      return response.text || '';
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error(`Gemini API failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async *chatStream(request: ChatCompletionRequest): AsyncGenerator<string, void, unknown> {
    const systemMessage = request.messages.find(m => m.role === 'system');
    const userMessages = request.messages.filter(m => m.role !== 'system');

    const contents = userMessages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const config: any = {
      temperature: request.temperature ?? this.temperature,
    };

    if (systemMessage) {
      config.systemInstruction = systemMessage.content;
    }

    if (request.format === 'json') {
      config.responseMimeType = 'application/json';
    }

    const stream = await this.ai.models.generateContentStream({
      model: this.model,
      contents: contents,
      config: config
    });

    for await (const chunk of stream) {
      if (chunk.text) {
        yield chunk.text;
      }
    }
  }
}
