import { describe, it, expect } from 'vitest';
import { chatReducer, initialChatState } from '../../../src/context/chatReducer';
import type { ChatState, ChatAction, ChatMessage } from '../../../src/context/types';

describe('chatReducer', () => {
  it('returns initial state for unknown action', () => {
    const state = chatReducer(initialChatState, { type: 'UNKNOWN_ACTION' } as unknown as ChatAction);
    expect(state).toEqual(initialChatState);
  });

  describe('ADD_USER_MESSAGE', () => {
    it('adds user message and clears error', () => {
      const stateWithError: ChatState = {
        ...initialChatState,
        error: 'some previous error',
      };

      const result = chatReducer(stateWithError, {
        type: 'ADD_USER_MESSAGE',
        payload: { id: 'msg-1', content: 'Hello' },
      });

      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]!.id).toBe('msg-1');
      expect(result.messages[0]!.role).toBe('user');
      expect(result.messages[0]!.content).toBe('Hello');
      expect(result.messages[0]!.createdAt).toBeDefined();
      expect(result.error).toBeNull();
    });
  });

  describe('STREAM_START', () => {
    it('creates assistant message and sets streaming status', () => {
      const result = chatReducer(initialChatState, {
        type: 'STREAM_START',
        payload: { conversationId: 'conv-1', messageId: 'msg-2' },
      });

      expect(result.streamingStatus).toBe('streaming');
      expect(result.streamingMessageId).toBe('msg-2');
      expect(result.currentConversationId).toBe('conv-1');
      expect(result.messages).toHaveLength(1);
      expect(result.messages[0]!.id).toBe('msg-2');
      expect(result.messages[0]!.role).toBe('assistant');
      expect(result.messages[0]!.content).toBe('');
      expect(result.messages[0]!.toolCalls).toEqual([]);
    });
  });

  describe('STREAM_TEXT_DELTA', () => {
    it('appends content to streaming message', () => {
      const stateWithAssistant: ChatState = {
        ...initialChatState,
        streamingStatus: 'streaming',
        streamingMessageId: 'msg-2',
        messages: [
          { id: 'msg-2', role: 'assistant', content: 'Hello', createdAt: '2026-01-01T00:00:00Z' },
        ],
      };

      const result = chatReducer(stateWithAssistant, {
        type: 'STREAM_TEXT_DELTA',
        payload: { content: ' world' },
      });

      expect(result.messages[0]!.content).toBe('Hello world');
    });
  });

  describe('STREAM_REASONING', () => {
    it('appends reasoning to streaming message', () => {
      const stateWithAssistant: ChatState = {
        ...initialChatState,
        streamingStatus: 'streaming',
        streamingMessageId: 'msg-2',
        messages: [
          { id: 'msg-2', role: 'assistant', content: '', createdAt: '2026-01-01T00:00:00Z' },
        ],
      };

      const result = chatReducer(stateWithAssistant, {
        type: 'STREAM_REASONING',
        payload: { content: 'I need to think about this' },
      });

      expect(result.messages[0]!.reasoning).toBe('I need to think about this');
    });

    it('appends to existing reasoning', () => {
      const stateWithReasoning: ChatState = {
        ...initialChatState,
        streamingStatus: 'streaming',
        streamingMessageId: 'msg-2',
        messages: [
          {
            id: 'msg-2',
            role: 'assistant',
            content: '',
            reasoning: 'First thought. ',
            createdAt: '2026-01-01T00:00:00Z',
          },
        ],
      };

      const result = chatReducer(stateWithReasoning, {
        type: 'STREAM_REASONING',
        payload: { content: 'Second thought.' },
      });

      expect(result.messages[0]!.reasoning).toBe('First thought. Second thought.');
    });
  });

  describe('STREAM_TOOL_CALL_START', () => {
    it('adds tool call with running status', () => {
      const stateWithAssistant: ChatState = {
        ...initialChatState,
        streamingStatus: 'streaming',
        streamingMessageId: 'msg-2',
        messages: [
          {
            id: 'msg-2',
            role: 'assistant',
            content: '',
            toolCalls: [],
            createdAt: '2026-01-01T00:00:00Z',
          },
        ],
      };

      const result = chatReducer(stateWithAssistant, {
        type: 'STREAM_TOOL_CALL_START',
        payload: {
          toolCallId: 'tc-1',
          toolName: 'rxnorm_lookup',
          args: { drugName: 'aspirin' },
        },
      });

      expect(result.messages[0]!.toolCalls).toHaveLength(1);
      expect(result.messages[0]!.toolCalls![0]).toEqual({
        toolCallId: 'tc-1',
        toolName: 'rxnorm_lookup',
        args: { drugName: 'aspirin' },
        status: 'running',
      });
    });
  });

  describe('STREAM_TOOL_CALL_RESULT', () => {
    const stateWithToolCall: ChatState = {
      ...initialChatState,
      streamingStatus: 'streaming',
      streamingMessageId: 'msg-2',
      messages: [
        {
          id: 'msg-2',
          role: 'assistant',
          content: '',
          toolCalls: [
            {
              toolCallId: 'tc-1',
              toolName: 'rxnorm_lookup',
              args: { drugName: 'aspirin' },
              status: 'running',
            },
          ],
          createdAt: '2026-01-01T00:00:00Z',
        },
      ],
    };

    it('updates tool call with successful result', () => {
      const result = chatReducer(stateWithToolCall, {
        type: 'STREAM_TOOL_CALL_RESULT',
        payload: {
          toolCallId: 'tc-1',
          result: { rxcui: '1191', name: 'Aspirin' },
          isError: false,
        },
      });

      const toolCall = result.messages[0]!.toolCalls![0]!;
      expect(toolCall.status).toBe('success');
      expect(toolCall.result).toEqual({ rxcui: '1191', name: 'Aspirin' });
      expect(toolCall.isError).toBe(false);
    });

    it('updates tool call with error result', () => {
      const result = chatReducer(stateWithToolCall, {
        type: 'STREAM_TOOL_CALL_RESULT',
        payload: {
          toolCallId: 'tc-1',
          result: 'API request failed',
          isError: true,
        },
      });

      const toolCall = result.messages[0]!.toolCalls![0]!;
      expect(toolCall.status).toBe('error');
      expect(toolCall.result).toBe('API request failed');
      expect(toolCall.isError).toBe(true);
    });
  });

  describe('STREAM_METADATA', () => {
    it('attaches metadata to the streaming message', () => {
      const metadata = {
        model: 'gpt-4o',
        inputTokens: 150,
        outputTokens: 200,
        latencyMs: 1234,
        estimatedCost: 0.0025,
      };

      const stateWithStreaming: ChatState = {
        ...initialChatState,
        streamingStatus: 'streaming',
        streamingMessageId: 'msg-1',
        messages: [{ id: 'msg-1', role: 'assistant', content: 'Hello' }],
      };

      const result = chatReducer(stateWithStreaming, {
        type: 'STREAM_METADATA',
        payload: metadata,
      });

      expect(result.messages[0]!.metadata).toEqual(metadata);
    });
  });

  describe('STREAM_ERROR', () => {
    it('sets error status and message', () => {
      const stateStreaming: ChatState = {
        ...initialChatState,
        streamingStatus: 'streaming',
        streamingMessageId: 'msg-2',
      };

      const result = chatReducer(stateStreaming, {
        type: 'STREAM_ERROR',
        payload: { message: 'Connection lost' },
      });

      expect(result.streamingStatus).toBe('error');
      expect(result.error).toBe('Connection lost');
    });
  });

  describe('STREAM_DONE', () => {
    it('resets streaming status to idle and clears streamingMessageId', () => {
      const stateStreaming: ChatState = {
        ...initialChatState,
        streamingStatus: 'streaming',
        streamingMessageId: 'msg-2',
        messages: [
          { id: 'msg-2', role: 'assistant', content: 'Done!', createdAt: '2026-01-01T00:00:00Z' },
        ],
      };

      const result = chatReducer(stateStreaming, { type: 'STREAM_DONE' });

      expect(result.streamingStatus).toBe('idle');
      expect(result.streamingMessageId).toBeNull();
      expect(result.messages).toHaveLength(1);
    });
  });

  describe('SET_CONVERSATION', () => {
    it('sets conversationId and messages', () => {
      const messages: ChatMessage[] = [
        { id: 'msg-1', role: 'user', content: 'Hi', createdAt: '2026-01-01T00:00:00Z' },
        { id: 'msg-2', role: 'assistant', content: 'Hello!', createdAt: '2026-01-01T00:00:01Z' },
      ];

      const result = chatReducer(initialChatState, {
        type: 'SET_CONVERSATION',
        payload: { conversationId: 'conv-1', messages },
      });

      expect(result.currentConversationId).toBe('conv-1');
      expect(result.messages).toEqual(messages);
      expect(result.streamingStatus).toBe('idle');
      expect(result.streamingMessageId).toBeNull();
      expect(result.error).toBeNull();
    });
  });

  describe('CLEAR_CONVERSATION', () => {
    it('resets to initial state', () => {
      const populatedState: ChatState = {
        messages: [
          { id: 'msg-1', role: 'user', content: 'Hi', createdAt: '2026-01-01T00:00:00Z' },
        ],
        streamingStatus: 'streaming',
        streamingMessageId: 'msg-2',
        currentConversationId: 'conv-1',
        error: 'some error',
      };

      const result = chatReducer(populatedState, { type: 'CLEAR_CONVERSATION' });

      expect(result).toEqual(initialChatState);
    });
  });

  describe('edge cases', () => {
    it('multiple text deltas accumulate correctly', () => {
      let state: ChatState = {
        ...initialChatState,
        streamingStatus: 'streaming',
        streamingMessageId: 'msg-2',
        messages: [
          { id: 'msg-2', role: 'assistant', content: '', createdAt: '2026-01-01T00:00:00Z' },
        ],
      };

      const deltas = ['The ', 'quick ', 'brown ', 'fox'];
      for (const delta of deltas) {
        state = chatReducer(state, {
          type: 'STREAM_TEXT_DELTA',
          payload: { content: delta },
        });
      }

      expect(state.messages[0]!.content).toBe('The quick brown fox');
    });

    it('tool call result on non-existent tool call does not crash', () => {
      const stateWithAssistant: ChatState = {
        ...initialChatState,
        streamingStatus: 'streaming',
        streamingMessageId: 'msg-2',
        messages: [
          {
            id: 'msg-2',
            role: 'assistant',
            content: '',
            toolCalls: [],
            createdAt: '2026-01-01T00:00:00Z',
          },
        ],
      };

      const result = chatReducer(stateWithAssistant, {
        type: 'STREAM_TOOL_CALL_RESULT',
        payload: {
          toolCallId: 'non-existent-tc',
          result: { data: 'something' },
          isError: false,
        },
      });

      expect(result.messages[0]!.toolCalls).toEqual([]);
    });
  });
});
