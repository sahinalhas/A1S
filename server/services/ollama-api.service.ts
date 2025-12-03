/**
 * Ollama API Service
 * Yerel Ollama sunucusu ile iletişim için servis
 * localhost:11434 üzerinden çalışır
 */

export interface OllamaModel {
  name: string;
  modified_at: string;
  size: number;
  digest: string;
}

export interface OllamaMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface OllamaChatRequest {
  model: string;
  messages: OllamaMessage[];
  stream?: boolean;
  temperature?: number;
  format?: 'json' | string;
}

export interface OllamaChatResponse {
  model: string;
  created_at: string;
  message: {
    role: string;
    content: string;
  };
  done: boolean;
}

export class OllamaAPIService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  /**
   * Mevcut modelleri listele
   */
  async listModels(): Promise<OllamaModel[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`);
      
      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.models || [];
    } catch (error) {
      console.error('Error listing Ollama models:', error);
      throw new Error('Ollama sunucusuna bağlanılamadı. Ollama çalışıyor mu?');
    }
  }

  /**
   * Ollama sunucusunun erişilebilir olup olmadığını kontrol et
   * Timeout ile hızlı başarısızlık kontrolü
   */
  async checkHealth(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeout);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Chat completion (non-streaming)
   */
  async chat(request: OllamaChatRequest): Promise<OllamaChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...request,
          stream: false
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 404) {
          // Model not found - provide helpful error message
          const availableModels = await this.listModels();
          const modelNames = availableModels.map(m => m.name).join(', ');
          throw new Error(
            `Model '${request.model}' not found on Ollama server. ` +
            `Available models: ${modelNames || 'none'}. ` +
            `Install the model with: ollama pull ${request.model}`
          );
        }
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error in Ollama chat:', error);
      throw error;
    }
  }

  /**
   * Streaming chat completion
   * Server-sent events için
   */
  async *chatStream(request: OllamaChatRequest): AsyncGenerator<string, void, unknown> {
    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...request,
          stream: true
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 404) {
          // Model not found - provide helpful error message
          const availableModels = await this.listModels();
          const modelNames = availableModels.map(m => m.name).join(', ');
          throw new Error(
            `Model '${request.model}' not found on Ollama server. ` +
            `Available models: ${modelNames || 'none'}. ` +
            `Install the model with: ollama pull ${request.model}`
          );
        }
        throw new Error(`Ollama API error: ${response.status} - ${errorText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('No response body');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.trim()) {
            try {
              const data = JSON.parse(line);
              if (data.message?.content) {
                yield data.message.content;
              }
            } catch (e) {
              console.error('Error parsing stream line:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error in Ollama chat stream:', error);
      throw error;
    }
  }

  /**
   * Generate endpoint (eski stil, basit text generation)
   */
  async generate(model: string, prompt: string, options?: { 
    temperature?: number; 
    format?: string;
  }): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model,
          prompt,
          stream: false,
          ...options
        })
      });

      if (!response.ok) {
        throw new Error(`Ollama API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Error in Ollama generate:', error);
      throw error;
    }
  }

  /**
   * Model pull - yeni model indir
   */
  async pullModel(modelName: string): Promise<void> {
    try {
      const response = await fetch(`${this.baseUrl}/api/pull`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: modelName,
          stream: false
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to pull model: ${response.status}`);
      }
    } catch (error) {
      console.error('Error pulling Ollama model:', error);
      throw error;
    }
  }
}
