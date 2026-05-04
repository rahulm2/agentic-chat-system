// Message roles
export type MessageRole = 'user' | 'assistant' | 'system';

// Tool call status
export type ToolCallStatus = 'pending' | 'running' | 'success' | 'error';

// A single tool call within a message
export interface ToolCall {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  result?: unknown;
  isError?: boolean;
  status: ToolCallStatus;
}

// A single chat message
export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  reasoning?: string;
  toolCalls?: ToolCall[];
  createdAt: string;
}

// Metadata from the AI response
export interface MessageMetadata {
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  latencyMs?: number;
  estimatedCost?: number;
}

// Streaming status
export type StreamingStatus = 'idle' | 'connecting' | 'streaming' | 'error';

// SSE event types matching the backend protocol
export type SSEEventType =
  | 'stream-start'
  | 'reasoning'
  | 'tool-call-start'
  | 'tool-call-result'
  | 'text-delta'
  | 'metadata'
  | 'error'
  | 'done';

// The full chat state
export interface ChatState {
  messages: ChatMessage[];
  streamingStatus: StreamingStatus;
  streamingMessageId: string | null;
  currentConversationId: string | null;
  metadata: MessageMetadata | null;
  error: string | null;
}

// All possible actions for the reducer
export type ChatAction =
  | { type: 'ADD_USER_MESSAGE'; payload: { id: string; content: string } }
  | { type: 'STREAM_START'; payload: { conversationId: string; messageId: string } }
  | { type: 'STREAM_TEXT_DELTA'; payload: { content: string } }
  | { type: 'STREAM_REASONING'; payload: { content: string } }
  | { type: 'STREAM_TOOL_CALL_START'; payload: { toolCallId: string; toolName: string; args: Record<string, unknown> } }
  | { type: 'STREAM_TOOL_CALL_RESULT'; payload: { toolCallId: string; result: unknown; isError?: boolean } }
  | { type: 'STREAM_METADATA'; payload: MessageMetadata }
  | { type: 'STREAM_ERROR'; payload: { message: string } }
  | { type: 'STREAM_DONE' }
  | { type: 'SET_MESSAGES'; payload: ChatMessage[] }
  | { type: 'SET_CONVERSATION'; payload: { conversationId: string; messages: ChatMessage[] } }
  | { type: 'CLEAR_CONVERSATION' };
