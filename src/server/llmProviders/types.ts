export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'google' | 'ollama' | 'lmstudio';
  model: string;
  apiKey?: string;
  baseUrl?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface LLMRequest {
  prompt: string;
  systemPrompt?: string;
  config: LLMConfig;
}

export interface LLMResponse {
  content: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
  error?: string;
}
