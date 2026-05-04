export interface SSEEvent {
  event: string;
  data: string;
}

/**
 * Parse raw SSE text into individual events.
 * Handles multi-line data fields and ignores comments/empty lines.
 */
export function parseSSEEvents(chunk: string): SSEEvent[] {
  const events: SSEEvent[] = [];
  const lines = chunk.split('\n');

  let currentEvent = '';
  let currentData = '';

  for (const line of lines) {
    if (line.startsWith('event:')) {
      currentEvent = line.slice(6).trim();
    } else if (line.startsWith('data:')) {
      currentData = line.slice(5).trim();
    } else if (line === '' && currentEvent) {
      events.push({ event: currentEvent, data: currentData });
      currentEvent = '';
      currentData = '';
    }
  }

  // Handle case where chunk doesn't end with double newline
  if (currentEvent && currentData) {
    events.push({ event: currentEvent, data: currentData });
  }

  return events;
}

/**
 * Parse JSON data from an SSE event safely.
 * Returns null if parsing fails.
 */
export function parseSSEData<T = unknown>(data: string): T | null {
  try {
    return JSON.parse(data) as T;
  } catch {
    return null;
  }
}
