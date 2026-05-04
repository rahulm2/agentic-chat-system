import {
  ToolTimeoutError,
  ToolApiError,
  ToolRateLimitError,
  ToolError,
} from "@/common/errors.ts";
import { TOOL_CONSTANTS } from "./constants.ts";

export interface FetchWithRetryOptions {
  toolName: string;
  timeoutMs?: number;
  maxRetries?: number;
  allowedStatuses?: number[];
}

export async function fetchWithRetry(
  url: string,
  options: FetchWithRetryOptions,
): Promise<Response> {
  const {
    toolName,
    timeoutMs = TOOL_CONSTANTS.TIMEOUT_MS,
    maxRetries = TOOL_CONSTANTS.MAX_RETRIES,
    allowedStatuses = [],
  } = options;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), timeoutMs);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok || allowedStatuses.includes(res.status)) return res;

      if ((res.status === 429 || res.status >= 500) && attempt < maxRetries) {
        await backoff(attempt);
        continue;
      }
      if (res.status === 429) {
        throw new ToolRateLimitError(toolName);
      }
      throw new ToolApiError(toolName, res.status, res.statusText);
    } catch (err) {
      if (err instanceof ToolError) throw err;

      if (attempt < maxRetries && (err as Error).name === "AbortError") {
        await backoff(attempt);
        continue;
      }
      if ((err as Error).name === "AbortError") {
        throw new ToolTimeoutError(toolName);
      }
      throw err;
    }
  }
  throw new ToolApiError(toolName, 0, "max retries exceeded");
}

function backoff(attempt: number): Promise<void> {
  return new Promise((r) =>
    setTimeout(r, TOOL_CONSTANTS.RETRY_BASE_DELAY_MS * 2 ** attempt),
  );
}
