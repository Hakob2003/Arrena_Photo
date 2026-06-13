import { OpenRouterProvider } from './openrouter.provider';

describe('OpenRouterProvider', () => {
  let provider: OpenRouterProvider;

  beforeEach(() => {
    provider = new OpenRouterProvider('test-api-key');
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
    expect(provider.name).toBe('OpenRouter');
  });

  it('should format headers correctly', () => {
    // We can test private methods by accessing them via any
    const headers = (provider as any).getHeaders();
    expect(headers['Authorization']).toBe('Bearer test-api-key');
    expect(headers['Content-Type']).toBe('application/json');
    expect(headers['X-Title']).toBe('AI Template Studio');
  });
});
