/**
 * Groq LPU API client for high-speed LLM inference.
 *
 * Talks to the OpenAI-compatible `/chat/completions` endpoint exposed by Groq.
 * Configured via `GROQ_API_KEY` environment variable.
 */

export type GroqMessage = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type GroqChatOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  timeoutMs?: number;
};

const DEFAULT_BASE_URL = 'https://api.groq.com/openai/v1';
const DEFAULT_MODEL = 'llama-3.3-70b-versatile';
const DEFAULT_TIMEOUT_MS = 25_000;

export async function groqChat(
  messages: GroqMessage[],
  opts: GroqChatOptions = {}
): Promise<Record<string, unknown>> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is not set');
  }

  const baseUrl = process.env.GROQ_BASE_URL ?? DEFAULT_BASE_URL;
  const model = opts.model ?? process.env.GROQ_MODEL ?? DEFAULT_MODEL;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error('Groq request timed out')), timeoutMs);

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature ?? 0.2,
        max_tokens: opts.maxTokens ?? 3072,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const errText = await res.text().catch(() => '<unreadable>');
      throw new Error(`Groq chat failed: ${res.status} ${res.statusText} — ${errText.slice(0, 300)}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content ?? '{}';
    return JSON.parse(content);
  } finally {
    clearTimeout(timer);
  }
}
