export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  content: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  model: string;
}

export interface IAIProvider {
  /**
   * Identifies the provider (e.g. 'OpenRouter')
   */
  readonly name: string;

  /**
   * Non-streaming chat completion
   */
  chat(messages: ChatMessage[], modelSlug: string): Promise<ChatResponse>;

  /**
   * Streaming chat completion via Server-Sent Events or AsyncIterator
   */
  stream(messages: ChatMessage[], modelSlug: string): AsyncGenerator<string, ChatResponse, unknown>;

  /**
   * Optional: dynamically fetch available models
   */
  listModels?(): Promise<any[]>;
}
