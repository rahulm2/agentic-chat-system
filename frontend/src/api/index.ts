export { apiFetch, setAuthToken, getAuthToken, setApiErrorListener } from './client';
export { queryClient } from './query-client';
export { sendChatMessage } from './chat';
export type { SendMessageParams } from './chat';
export { fetchConversations, fetchConversation, deleteConversation } from './conversations';
export type {
  ConversationSummary,
  ConversationListResponse,
  ConversationMessage,
  ConversationDetail,
} from './conversations';
export { login, register, fetchCurrentUser } from './auth';
export type { User, AuthResponse, LoginParams, RegisterParams } from './auth';
export { synthesizeSpeech } from './tts';
