/**
 * Append-only usage logger for the Careerops app.
 *
 * Writes one JSON object per line to `logs/usage.jsonl` (resolved against
 * the current working directory, which is the project root when running
 * under Next.js). Designed to be called from request handlers to record
 * model usage, latency, and outcome. All writes are best-effort and never
 * throw.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

/** Shape of a single usage log entry. */
export type UsageEntry = {
  /** Unix epoch milliseconds when the request completed. */
  ts: number;
  /** Logical route or operation name. */
  route: string;
  /** Model identifier, e.g. "nim:meta/llama-3.1-70b-instruct". */
  model: string;
  /** Prompt tokens consumed (if reported). */
  promptTokens?: number;
  /** Completion tokens generated (if reported). */
  completionTokens?: number;
  /** End-to-end latency in milliseconds. */
  latencyMs: number;
  /** Outcome of the call. */
  status: "ok" | "fallback" | "error";
  /** Caller IP, for abuse analysis. Will be redacted if it looks like an email. */
  ip?: string;
  /** Optional free-text note; truncated to 200 chars before write. */
  note?: string;
  /** Optional error message; truncated and copied under `error` in the log. */
  error?: string;
};

const LOG_DIR = path.resolve(process.cwd(), "logs");
const LOG_FILE = path.join(LOG_DIR, "usage.jsonl");
const MAX_FREE_TEXT = 200;

/** Loose RFC-5322-ish email pattern; intentionally not exhaustive. */
const EMAIL_RE = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi;
/** Loose international phone-number matcher: 7+ digits with optional +, spaces, dashes, parens. */
const PHONE_RE = /(?:(?:\+|00)\d{1,3}[\s.-]?)?(?:\(\d{1,4}\)[\s.-]?)?\d{3}[\s.-]?\d{3,4}[\s.-]?\d{0,4}/g;

/** Redact PII from an arbitrary string. */
function redact(input: string | undefined): string | undefined {
  if (input === undefined) return undefined;
  return input.replace(EMAIL_RE, "[redacted-email]").replace(PHONE_RE, "[redacted-phone]");
}

/** Truncate free-form text to a safe length to keep log lines bounded. */
function truncate(input: string | undefined): string | undefined {
  if (input === undefined) return undefined;
  return input.length > MAX_FREE_TEXT
    ? `${input.slice(0, MAX_FREE_TEXT)}…`
    : input;
}

/**
 * Append a single usage entry to `logs/usage.jsonl`.
 *
 * - Emails and phone numbers are stripped from all string fields.
 * - Free-text fields are truncated to 200 characters.
 * - The destination directory is created lazily on first write.
 * - Any error is swallowed and reported via `console.warn` so that logging
 *   can never break a request path.
 */
export async function logUsage(entry: UsageEntry): Promise<void> {
  try {
    await fs.mkdir(LOG_DIR, { recursive: true });

    const sanitized = {
      ts: entry.ts,
      route: redact(entry.route) ?? entry.route,
      model: redact(entry.model) ?? entry.model,
      promptTokens: entry.promptTokens,
      completionTokens: entry.completionTokens,
      latencyMs: entry.latencyMs,
      status: entry.status,
      ip: redact(entry.ip),
      note: redact(truncate(entry.note)),
      error: redact(truncate(entry.error)),
    };

    const line = `${JSON.stringify(sanitized)}\n`;
    await fs.appendFile(LOG_FILE, line, "utf8");
  } catch (err) {
    // Logging must never throw.
    console.warn("[log] failed to write usage entry:", (err as Error).message);
  }
}
