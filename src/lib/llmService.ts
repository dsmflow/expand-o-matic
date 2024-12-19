export interface MetaPromptConfig {
  purpose: string;
  instructions: string[];
  sections?: string[];
  variables?: string[];
}

export interface PromptRequest {
  mode: string;
  provider: string;
  model: string;
  input_text: string;
  meta_prompt?: MetaPromptConfig;
  temperature?: number;
  max_tokens?: number;
}

export interface PromptResponse {
  content: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export async function sendPrompt(request: PromptRequest): Promise<{ content: string; error?: string }> {
  try {
    const apiUrl = request.provider === 'ollama' 
      ? `${API_BASE_URL}/api/ollama/generate`
      : `${API_BASE_URL}/api/prompt`;

    console.log('Sending request to:', apiUrl);
    console.log('Request payload:', JSON.stringify(request, null, 2));

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('Response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response:', errorData);
      throw new Error(errorData.detail || 'Failed to generate response');
    }

    const data = await response.json();
    console.log('Response data:', data);
    return { content: data.content };
  } catch (error) {
    console.error('Error in sendPrompt:', error);
    return {
      content: '',
      error: error instanceof Error ? error.message : 'An error occurred while processing your request'
    };
  }
}
