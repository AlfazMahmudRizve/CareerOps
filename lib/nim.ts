/**
 * NVIDIA NIM chat completions client.
 *
 * Talks to the OpenAI-compatible `/chat/completions` endpoint exposed by
 * NVIDIA NIM. Configuration is read from environment variables and no
 * sensitive values are hard-coded anywhere in this module.
 *
 * Env vars:
 *   NVIDIA_NIM_BASE_URL  Default: https://integrate.api.nvidia.com/v1
 *   NVIDIA_NIM_API_KEY   Required at call time.
 *   NVIDIA_NIM_MODEL     Default: meta/llama-3.1-70b-instruct
 */

/** A single message in a chat conversation. */
export type NimMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

/** Options for a single chat request. */
export type NimChatOptions = {
  /** Override the model for this call. Defaults to env or built-in default. */
  model?: string;
  /** Sampling temperature in [0, 2]. */
  temperature?: number;
  /** Nucleus sampling cutoff. */
  topP?: number;
  /** Max tokens to generate. */
  maxTokens?: number;
  /** AbortSignal to cancel the request. */
  signal?: AbortSignal;
  /** Timeout in milliseconds. Default 12_000. */
  timeoutMs?: number;
};

/** Parsed JSON payload returned by `chat()`. */
export type NimChatResult = Record<string, unknown>;

/** Internal raw response shape from the NIM endpoint. */
type NimRawResponse = {
  choices?: Array<{ message?: { content?: string } }>;
};

const DEFAULT_BASE_URL = "https://integrate.api.nvidia.com/v1";
const DEFAULT_MODEL = "meta/llama-3.1-70b-instruct";
const DEFAULT_TIMEOUT_MS = 12_000;

/**
 * Combine a caller-provided AbortSignal with our internal timeout signal,
 * returning a single signal that aborts on whichever fires first.
 */
function combineSignals(
  external: AbortSignal | undefined,
  timeoutMs: number,
): { signal: AbortSignal; cleanup: () => void } {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("Request timed out")), timeoutMs);
  const onExternalAbort = () => controller.abort(external?.reason);
  if (external) {
    if (external.aborted) {
      controller.abort(external.reason);
    } else {
      external.addEventListener("abort", onExternalAbort, { once: true });
    }
  }
  const cleanup = () => {
    clearTimeout(timer);
    if (external) external.removeEventListener("abort", onExternalAbort);
  };
  return { signal: controller.signal, cleanup };
}

/** Read at most `n` characters from a Response body for error reporting. */
async function excerpt(body: Response, n = 500): Promise<string> {
  try {
    const text = await body.text();
    return text.length > n ? `${text.slice(0, n)}…` : text;
  } catch {
    return "<unreadable body>";
  }
}

/**
 * Issue a non-streaming chat completion request and return the model's
 * reply parsed as a JSON object. The endpoint is asked for JSON output via
 * `response_format: { type: "json_object" }`.
 *
 * Throws an `Error` with status and a body excerpt on non-2xx responses.
 */
async function chat(
  messages: NimMessage[],
  opts: NimChatOptions = {},
): Promise<NimChatResult> {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  if (!apiKey) {
    throw new Error("NVIDIA_NIM_API_KEY is not set");
  }

  const baseUrl = process.env.NVIDIA_NIM_BASE_URL ?? DEFAULT_BASE_URL;
  const model = opts.model ?? process.env.NVIDIA_NIM_MODEL ?? DEFAULT_MODEL;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const { signal, cleanup } = combineSignals(opts.signal, timeoutMs);
  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: opts.temperature,
        top_p: opts.topP,
        max_tokens: opts.maxTokens,
        stream: false,
        response_format: { type: "json_object" },
      }),
      signal,
    });

    if (!res.ok) {
      const body = await excerpt(res);
      throw new Error(`NIM chat failed: ${res.status} ${res.statusText} — ${body}`);
    }

    const data = (await res.json()) as NimRawResponse;
    const content = data.choices?.[0]?.message?.content ?? "{}";
    try {
      return JSON.parse(content) as NimChatResult;
    } catch (err) {
      throw new Error(
        `NIM chat returned non-JSON content: ${(err as Error).message}`,
      );
    }
  } finally {
    cleanup();
  }
}

/**
 * Issue a streaming chat completion request. Yields decoded text chunks from
 * the SSE `data:` events of the NIM endpoint. The returned stream is a
 * standard web `ReadableStream<Uint8Array>` so it can be piped straight
 * into a Next.js `Response`.
 *
 * Throws (via the underlying `fetch`) on non-2xx responses.
 */
function streamChat(
  messages: NimMessage[],
  opts: NimChatOptions = {},
): ReadableStream<Uint8Array> {
  const apiKey = process.env.NVIDIA_NIM_API_KEY;
  if (!apiKey) {
    throw new Error("NVIDIA_NIM_API_KEY is not set");
  }

  const baseUrl = process.env.NVIDIA_NIM_BASE_URL ?? DEFAULT_BASE_URL;
  const model = opts.model ?? process.env.NVIDIA_NIM_MODEL ?? DEFAULT_MODEL;
  const timeoutMs = opts.timeoutMs ?? DEFAULT_TIMEOUT_MS;

  const { signal, cleanup } = combineSignals(opts.signal, timeoutMs);

  const upstream = fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
      Accept: "text/event-stream",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: opts.temperature,
      top_p: opts.topP,
      max_tokens: opts.maxTokens,
      stream: true,
    }),
    signal,
  });

  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        const res = await upstream;
        if (!res.ok || !res.body) {
          const body = await excerpt(res);
          controller.error(
            new Error(`NIM stream failed: ${res.status} ${res.statusText} — ${body}`),
          );
          return;
        }

        const reader = res.body.getReader();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });

          // SSE frames are separated by a blank line.
          let idx = buffer.indexOf("\n\n");
          while (idx !== -1) {
            const frame = buffer.slice(0, idx);
            buffer = buffer.slice(idx + 2);
            for (const line of frame.split("\n")) {
              if (!line.startsWith("data:")) continue;
              const payload = line.slice(5).trim();
              if (!payload || payload === "[DONE]") continue;
              try {
                const json = JSON.parse(payload) as {
                  choices?: Array<{ delta?: { content?: string } }>;
                };
                const chunk = json.choices?.[0]?.delta?.content;
                if (chunk) controller.enqueue(encoder.encode(chunk));
              } catch {
                // Ignore malformed frames; keep the stream going.
              }
            }
            idx = buffer.indexOf("\n\n");
          }
        }

        controller.close();
      } catch (err) {
        controller.error(err);
      } finally {
        cleanup();
      }
    },
    cancel() {
      cleanup();
    },
  });
}

/** Public client surface. */
export const nim = { chat, streamChat };
