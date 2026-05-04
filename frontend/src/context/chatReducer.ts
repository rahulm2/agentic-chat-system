import type { ChatState, ChatAction } from './types';

export const initialChatState: ChatState = {
  messages: [],
  streamingStatus: 'idle',
  streamingMessageId: null,
  currentConversationId: null,
  metadata: null,
  error: null,
};

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: action.payload.id,
            role: 'user',
            content: action.payload.content,
            createdAt: new Date().toISOString(),
          },
        ],
        error: null,
      };

    case 'STREAM_START':
      return {
        ...state,
        streamingStatus: 'streaming',
        streamingMessageId: action.payload.messageId,
        currentConversationId: action.payload.conversationId,
        messages: [
          ...state.messages,
          {
            id: action.payload.messageId,
            role: 'assistant',
            content: '',
            toolCalls: [],
            createdAt: new Date().toISOString(),
          },
        ],
      };

    case 'STREAM_TEXT_DELTA': {
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === state.streamingMessageId
            ? { ...msg, content: msg.content + action.payload.content }
            : msg
        ),
      };
    }

    case 'STREAM_REASONING': {
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === state.streamingMessageId
            ? { ...msg, reasoning: (msg.reasoning ?? '') + action.payload.content }
            : msg
        ),
      };
    }

    case 'STREAM_TOOL_CALL_START': {
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === state.streamingMessageId
            ? {
                ...msg,
                toolCalls: [
                  ...(msg.toolCalls ?? []),
                  {
                    toolCallId: action.payload.toolCallId,
                    toolName: action.payload.toolName,
                    args: action.payload.args,
                    status: 'running' as const,
                  },
                ],
              }
            : msg
        ),
      };
    }

    case 'STREAM_TOOL_CALL_RESULT': {
      return {
        ...state,
        messages: state.messages.map((msg) =>
          msg.id === state.streamingMessageId
            ? {
                ...msg,
                toolCalls: (msg.toolCalls ?? []).map((tc) =>
                  tc.toolCallId === action.payload.toolCallId
                    ? {
                        ...tc,
                        result: action.payload.result,
                        isError: action.payload.isError,
                        status: action.payload.isError ? ('error' as const) : ('success' as const),
                      }
                    : tc
                ),
              }
            : msg
        ),
      };
    }

    case 'STREAM_METADATA':
      return {
        ...state,
        metadata: action.payload,
      };

    case 'STREAM_ERROR':
      return {
        ...state,
        streamingStatus: 'error',
        error: action.payload.message,
      };

    case 'STREAM_DONE':
      return {
        ...state,
        streamingStatus: 'idle',
        streamingMessageId: null,
      };

    case 'SET_MESSAGES':
      return {
        ...state,
        messages: action.payload,
      };

    case 'SET_CONVERSATION':
      return {
        ...state,
        currentConversationId: action.payload.conversationId,
        messages: action.payload.messages,
        streamingStatus: 'idle',
        streamingMessageId: null,
        error: null,
      };

    case 'DELETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.filter((msg) => msg.id !== action.payload.messageId),
      };

    case 'CLEAR_CONVERSATION':
      return { ...initialChatState };

    default:
      return state;
  }
}
