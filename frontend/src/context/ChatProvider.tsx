import { useReducer, type Dispatch } from 'react';
import constate from 'constate';
import { chatReducer, initialChatState } from './chatReducer';
import type { ChatState, ChatAction, ChatMessage, StreamingStatus } from './types';

function useChatContext() {
  const [state, dispatch] = useReducer(chatReducer, initialChatState);
  return { state, dispatch };
}

// Split selectors to avoid unnecessary re-renders
function useMessagesSelector({ state }: { state: ChatState; dispatch: Dispatch<ChatAction> }): ChatMessage[] {
  return state.messages;
}

function useStreamingStatusSelector({ state }: { state: ChatState; dispatch: Dispatch<ChatAction> }): {
  streamingStatus: StreamingStatus;
  streamingMessageId: string | null;
  error: string | null;
} {
  return {
    streamingStatus: state.streamingStatus,
    streamingMessageId: state.streamingMessageId,
    error: state.error,
  };
}

function useDispatchSelector({ dispatch }: { state: ChatState; dispatch: Dispatch<ChatAction> }): Dispatch<ChatAction> {
  return dispatch;
}

function useConversationSelector({ state }: { state: ChatState; dispatch: Dispatch<ChatAction> }): {
  currentConversationId: string | null;
} {
  return {
    currentConversationId: state.currentConversationId,
  };
}

export const [ChatProvider, useMessages, useStreamingStatus, useChatDispatch, useConversation] = constate(
  useChatContext,
  useMessagesSelector,
  useStreamingStatusSelector,
  useDispatchSelector,
  useConversationSelector
);
