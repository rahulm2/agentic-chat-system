import { useCallback, useRef } from 'react';
import { sendChatMessage } from '../api/chat';
import { parseSSEEvents, parseSSEData } from '../utils/sse-parser';
import type { ChatAction, MessageMetadata } from '../context/types';

interface UseSSEStreamOptions {
  dispatch: React.Dispatch<ChatAction>;
  conversationId: string | null;
}

interface UseSSEStreamReturn {
  sendMessage: (content: string) => Promise<void>;
  abort: () => void;
}

export function useSSEStream({ dispatch, conversationId }: UseSSEStreamOptions): UseSSEStreamReturn {
  const abortRef = useRef<AbortController | null>(null);

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    // Abort any in-flight request
    abort();

    const abortController = new AbortController();
    abortRef.current = abortController;

    // Add user message to state
    const userMessageId = `user-${Date.now()}`;
    dispatch({ type: 'ADD_USER_MESSAGE', payload: { id: userMessageId, content } });

    try {
      const response = await sendChatMessage({
        message: content,
        conversationId,
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();

        if (abortController.signal.aborted) break;
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        // Split on double newlines to get complete events
        const parts = buffer.split('\n\n');
        // Keep the last part as it may be incomplete
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          if (!part.trim()) continue;

          const events = parseSSEEvents(part + '\n\n');

          for (const sseEvent of events) {
            handleSSEEvent(sseEvent.event, sseEvent.data, dispatch);
          }
        }
      }

      // Process any remaining buffer
      if (buffer.trim()) {
        const events = parseSSEEvents(buffer);
        for (const sseEvent of events) {
          handleSSEEvent(sseEvent.event, sseEvent.data, dispatch);
        }
      }
    } catch (err) {
      if (abortController.signal.aborted) return;

      const message = err instanceof Error ? err.message : 'An error occurred';
      dispatch({ type: 'STREAM_ERROR', payload: { message } });
    }
  }, [dispatch, conversationId, abort]);

  return { sendMessage, abort };
}

function handleSSEEvent(
  event: string,
  data: string,
  dispatch: React.Dispatch<ChatAction>
): void {
  switch (event) {
    case 'stream-start': {
      const parsed = parseSSEData<{ conversationId: string; messageId: string }>(data);
      if (parsed) {
        dispatch({ type: 'STREAM_START', payload: parsed });
      }
      break;
    }
    case 'text-delta': {
      const parsed = parseSSEData<{ content: string }>(data);
      if (parsed) {
        dispatch({ type: 'STREAM_TEXT_DELTA', payload: { content: parsed.content } });
      }
      break;
    }
    case 'reasoning': {
      const parsed = parseSSEData<{ content: string }>(data);
      if (parsed) {
        dispatch({ type: 'STREAM_REASONING', payload: { content: parsed.content } });
      }
      break;
    }
    case 'tool-call-start': {
      const parsed = parseSSEData<{ toolCallId: string; toolName: string; args: Record<string, unknown> }>(data);
      if (parsed) {
        dispatch({ type: 'STREAM_TOOL_CALL_START', payload: parsed });
      }
      break;
    }
    case 'tool-call-result': {
      const parsed = parseSSEData<{ toolCallId: string; result: unknown; isError?: boolean }>(data);
      if (parsed) {
        dispatch({ type: 'STREAM_TOOL_CALL_RESULT', payload: parsed });
      }
      break;
    }
    case 'metadata': {
      const parsed = parseSSEData<MessageMetadata>(data);
      if (parsed) {
        dispatch({ type: 'STREAM_METADATA', payload: parsed });
      }
      break;
    }
    case 'error': {
      const parsed = parseSSEData<{ message: string }>(data);
      dispatch({ type: 'STREAM_ERROR', payload: { message: parsed?.message ?? 'Unknown error' } });
      break;
    }
    case 'done': {
      dispatch({ type: 'STREAM_DONE' });
      break;
    }
  }
}
