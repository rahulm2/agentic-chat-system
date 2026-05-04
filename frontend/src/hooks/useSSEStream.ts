import { useRef, useCallback } from 'react';
import { useMutation, useQueryClient, type QueryClient } from '@tanstack/react-query';
import { sendChatMessage } from '../api/chat';
import { parseSSEEvents, parseSSEData } from '../utils/sse-parser';
import { conversationKeys } from './useConversations';
import type { ChatAction, MessageMetadata } from '../context/types';

interface UseSSEStreamOptions {
  dispatch: React.Dispatch<ChatAction>;
  conversationId: string | null;
}

export function useSSEStream({ dispatch, conversationId }: UseSSEStreamOptions) {
  const abortRef = useRef<AbortController | null>(null);
  const queryClient = useQueryClient();

  const abort = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const mutation = useMutation({
    mutationFn: async (content: string) => {
      abort();

      const abortController = new AbortController();
      abortRef.current = abortController;

      const userMessageId = `user-${Date.now()}`;
      dispatch({ type: 'ADD_USER_MESSAGE', payload: { id: userMessageId, content } });

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

        const parts = buffer.split('\n\n');
        buffer = parts.pop() ?? '';

        for (const part of parts) {
          if (!part.trim()) continue;
          const events = parseSSEEvents(part + '\n\n');
          for (const sseEvent of events) {
            handleSSEEvent(sseEvent.event, sseEvent.data, dispatch, queryClient);
          }
        }
      }

      if (buffer.trim()) {
        const events = parseSSEEvents(buffer);
        for (const sseEvent of events) {
          handleSSEEvent(sseEvent.event, sseEvent.data, dispatch, queryClient);
        }
      }
    },
    onError: (err) => {
      if (abortRef.current?.signal.aborted) return;
      const message = err instanceof Error ? err.message : 'An error occurred';
      dispatch({ type: 'STREAM_ERROR', payload: { message } });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.list() });
    },
  });

  const sendMessage = useCallback(
    (content: string) => {
      mutation.mutate(content);
    },
    [mutation]
  );

  return {
    sendMessage,
    abort,
    isPending: mutation.isPending,
  };
}

function handleSSEEvent(
  event: string,
  data: string,
  dispatch: React.Dispatch<ChatAction>,
  queryClient: QueryClient,
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
    case 'title': {
      // Title generated — refresh sidebar conversation list
      queryClient.invalidateQueries({ queryKey: conversationKeys.list() });
      break;
    }
    case 'done': {
      dispatch({ type: 'STREAM_DONE' });
      break;
    }
  }
}
