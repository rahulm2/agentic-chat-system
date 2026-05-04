import { apiFetch } from './client';

export interface SendMessageParams {
  message: string;
  conversationId?: string | null;
}

/**
 * Send a chat message and get back an SSE stream response.
 * Returns the raw Response for streaming consumption.
 */
export async function sendChatMessage(params: SendMessageParams): Promise<Response> {
  const body: Record<string, unknown> = {
    message: params.message,
  };

  if (params.conversationId) {
    body.conversationId = params.conversationId;
  }

  const response = await apiFetch('/api/conversations/completions', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error((errorData as { message?: string }).message ?? `HTTP ${response.status}`);
  }

  return response;
}
