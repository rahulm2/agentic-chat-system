import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import {
  fetchConversations,
  fetchConversation,
  deleteConversation,
  deleteMessage,
  type ConversationMessage,
} from '../api/conversations';

export const conversationKeys = {
  all: ['conversations'] as const,
  list: () => [...conversationKeys.all, 'list'] as const,
  detail: (id: string) => [...conversationKeys.all, 'detail', id] as const,
};

const PAGE_SIZE = 20;

export function useConversationList() {
  return useQuery({
    queryKey: conversationKeys.list(),
    queryFn: () => fetchConversations(),
  });
}

export function useInfiniteConversationList() {
  return useInfiniteQuery({
    queryKey: [...conversationKeys.list(), 'infinite'],
    queryFn: ({ pageParam }) =>
      fetchConversations({ limit: PAGE_SIZE, offset: pageParam as number }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded = allPages.reduce((sum, page) => sum + page.conversations.length, 0);
      if (totalLoaded < lastPage.total) return totalLoaded;
      return undefined;
    },
  });
}

export function useConversationDetail(id: string | null) {
  return useQuery({
    queryKey: conversationKeys.detail(id ?? ''),
    queryFn: () => fetchConversation(id!),
    enabled: !!id,
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conversationKeys.list() });
    },
  });
}

export function useDeleteMessage() {
  return useMutation({
    mutationFn: deleteMessage,
  });
}

export function mapConversationMessages(messages: ConversationMessage[]) {
  return messages.map((msg) => ({
    id: msg.id,
    role: msg.role,
    content: msg.content ?? '',
    reasoning: msg.reasoning ?? undefined,
    toolCalls: msg.toolCalls.map((tc) => ({
      toolCallId: tc.id,
      toolName: tc.toolName,
      args: tc.args,
      result: tc.result ?? undefined,
      isError: tc.status === 'error',
      status: tc.status as 'success' | 'error',
    })),
    createdAt: msg.createdAt,
  }));
}
