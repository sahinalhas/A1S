import type { ChatMessage, ChatCompletionRequest } from '../ai-provider.service.js';

export interface AIAdapter {
  isAvailable(): Promise<boolean>;
  listModels(): Promise<string[]>;
  chat(request: ChatCompletionRequest): Promise<string>;
  chatStream(request: ChatCompletionRequest): AsyncGenerator<string, void, unknown>;
}

export abstract class BaseAIAdapter implements AIAdapter {
  protected model: string;
  protected temperature: number;

  constructor(model: string, temperature: number = 0) {
    this.model = model;
    this.temperature = temperature;
  }

  abstract isAvailable(): Promise<boolean>;
  abstract listModels(): Promise<string[]>;
  abstract chat(request: ChatCompletionRequest): Promise<string>;
  abstract chatStream(request: ChatCompletionRequest): AsyncGenerator<string, void, unknown>;
  
  setModel(model: string): void {
    this.model = model;
  }

  getModel(): string {
    return this.model;
  }
}
