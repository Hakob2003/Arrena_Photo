import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { IAIProvider, ChatMessage, ChatResponse } from '../interfaces/ai-provider.interface';

@Injectable()
export class OpenRouterProvider implements IAIProvider {
  readonly name = 'OpenRouter';

  constructor(
    private apiKey: string,
    private baseUrl: string = 'https://openrouter.ai/api/v1',
  ) {}

  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:3000',
      'X-Title': 'AI Template Studio',
    };
  }

  private handleError(status: number, responseText: string) {
    if (status === 429) {
      throw new HttpException('Rate limit exceeded', HttpStatus.TOO_MANY_REQUESTS);
    }
    if (status === 401) {
      throw new HttpException('Invalid API Key', HttpStatus.UNAUTHORIZED);
    }
    throw new HttpException(`Provider Error: ${responseText}`, HttpStatus.INTERNAL_SERVER_ERROR);
  }

  async chat(messages: ChatMessage[], modelSlug: string): Promise<ChatResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: modelSlug,
          messages,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        this.handleError(response.status, text);
      }

      const data = await response.json();
      
      return {
        content: data.choices[0]?.message?.content || '',
        inputTokens: data.usage?.prompt_tokens || 0,
        outputTokens: data.usage?.completion_tokens || 0,
        totalTokens: data.usage?.total_tokens || 0,
        model: data.model || modelSlug,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Network Failure or Timeout', HttpStatus.GATEWAY_TIMEOUT);
    }
  }

  async *stream(messages: ChatMessage[], modelSlug: string): AsyncGenerator<string, ChatResponse, unknown> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          model: modelSlug,
          messages,
          stream: true,
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        this.handleError(response.status, text);
      }

      if (!response.body) {
        throw new HttpException('No stream body', HttpStatus.INTERNAL_SERVER_ERROR);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');

      let content = '';
      let inputTokens = 0;
      let outputTokens = 0;
      let returnedModel = modelSlug;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.substring(6));
              const text = data.choices[0]?.delta?.content || '';
              if (text) {
                content += text;
                yield text;
              }
              // Capture usage if provided in stream
              if (data.usage) {
                inputTokens = data.usage.prompt_tokens;
                outputTokens = data.usage.completion_tokens;
              }
              if (data.model) {
                returnedModel = data.model;
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }

      // Estimate tokens if not provided in stream (common for some OpenRouter models)
      if (outputTokens === 0) {
        outputTokens = Math.ceil(content.length / 4); // rough estimate
      }

      return {
        content,
        inputTokens,
        outputTokens,
        totalTokens: inputTokens + outputTokens,
        model: returnedModel,
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Network Failure or Timeout', HttpStatus.GATEWAY_TIMEOUT);
    }
  }
}
