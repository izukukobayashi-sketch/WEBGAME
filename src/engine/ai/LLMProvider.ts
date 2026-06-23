export type LLMModel = 'claude-opus-4-7' | 'claude-sonnet-4-6' | 'claude-haiku-4-5-20251001'

export interface LLMMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface LLMResponse {
  text: string
  usage?: { inputTokens: number; outputTokens: number }
}

export interface LLMProvider {
  name: string
  complete(messages: LLMMessage[], model?: string): Promise<LLMResponse>
}

/**
 * Anthropic Claude provider.
 * Requires ANTHROPIC_API_KEY env var or key passed to constructor.
 */
export class ClaudeProvider implements LLMProvider {
  name = 'Anthropic'
  private apiKey: string
  private apiUrl = 'https://api.anthropic.com/v1/messages'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || localStorage.getItem('anthropic_api_key') || ''
  }

  async complete(messages: LLMMessage[], model: LLMModel = 'claude-sonnet-4-6'): Promise<LLMResponse> {
    if (!this.apiKey) throw new Error('Anthropic API key not configured')

    const systemMsg = `You are a narrative AI generating fictional events for a life simulation game in Russian.
Write naturally, using present tense. Keep responses concise (1-2 sentences).
Generate atmospheric, emotionally resonant descriptions of character actions, thoughts, and social interactions.`

    const response = await fetch(this.apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 150,
        system: systemMsg,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      throw new Error(`Anthropic API error: ${err.error?.message || response.statusText}`)
    }

    const data = await response.json() as {
      content: Array<{ type: string; text: string }>
      usage?: { input_tokens: number; output_tokens: number }
    }
    const text = data.content[0]?.text || ''

    return {
      text,
      usage: data.usage ? { inputTokens: data.usage.input_tokens, outputTokens: data.usage.output_tokens } : undefined,
    }
  }

  setApiKey(key: string): void {
    this.apiKey = key
    localStorage.setItem('anthropic_api_key', key)
  }
}

/**
 * Stub provider for testing (no real API calls).
 */
export class StubProvider implements LLMProvider {
  name = 'Stub'

  async complete(): Promise<LLMResponse> {
    return {
      text: 'День прошёл, как обычно.',
      usage: { inputTokens: 10, outputTokens: 5 },
    }
  }
}

/**
 * Get provider instance by name.
 */
export function getProvider(name: string, apiKey?: string): LLMProvider {
  if (name === 'claude') return new ClaudeProvider(apiKey)
  if (name === 'stub') return new StubProvider()
  throw new Error(`Unknown LLM provider: ${name}`)
}
