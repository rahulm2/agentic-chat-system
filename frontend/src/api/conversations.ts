import { apiFetch } from './client';

export interface ConversationSummary {
  id: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  _count: { messages: number };
}

export interface ConversationListResponse {
  conversations: ConversationSummary[];
  total: number;
}

export interface ConversationMessage {
  id: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string | null;
  reasoning: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  toolCalls: Array<{
    id: string;
    messageId: string;
    toolName: string;
    args: Record<string, unknown>;
    result: Record<string, unknown> | null;
    status: 'success' | 'error';
    durationMs: number;
    createdAt: string;
  }>;
}

export interface ConversationDetail {
  id: string;
  userId: string;
  title: string | null;
  createdAt: string;
  updatedAt: string;
  messages: ConversationMessage[];
}

export async function fetchConversations(): Promise<ConversationListResponse> {
  const response = await apiFetch('/api/conversations');
  if (!response.ok) {
    throw new Error(`Failed to fetch conversations: ${response.status}`);
  }
  return response.json() as Promise<ConversationListResponse>;
}

export async function fetchConversation(id: string): Promise<ConversationDetail> {
  const response = await apiFetch(`/api/conversations/${encodeURIComponent(id)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch conversation: ${response.status}`);
  }
  return response.json() as Promise<ConversationDetail>;
}

export async function deleteConversation(id: string): Promise<void> {
  const response = await apiFetch(`/api/conversations/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
  if (!response.ok) {
    throw new Error(`Failed to delete conversation: ${response.status}`);
  }
}
