import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchConversations,
  fetchConversation,
  deleteConversation,
} from '../api/conversations';

export const conversationKeys = {
  all: ['conversations'] as const,
  list: () => [...conversationKeys.all, 'list'] as const,
  detail: (id: string) => [...conversationKeys.all, 'detail', id] as const,
};

export function useConversationList() {
  return useQuery({
    queryKey: conversationKeys.list(),
    queryFn: fetchConversations,
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
