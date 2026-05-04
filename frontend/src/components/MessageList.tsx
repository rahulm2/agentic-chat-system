import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import MessageBubble from './MessageBubble';
import WelcomePrompts from './WelcomePrompts';
import StreamingIndicator from './StreamingIndicator';
import { spacing } from '../design-system';
import type { ChatMessage, MessageMetadata } from '../context/types';

export interface MessageListProps {
  messages: ChatMessage[];
  streamingMessageId: string | null;
  onSelectPrompt: (prompt: string) => void;
  metadata?: MessageMetadata | null;
  onRegenerate?: (messageId: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  isPending?: boolean;
}

export default function MessageList({
  messages,
  streamingMessageId,
  onSelectPrompt,
  metadata,
  onRegenerate,
  onDeleteMessage,
  isPending,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <Box sx={{ flex: 1, minHeight: 0, overflow: 'auto', display: 'flex', flexDirection: 'column', mt: { xs: 2, lg: 0 } }}>
        <WelcomePrompts onSelectPrompt={onSelectPrompt} />
      </Box>
    );
  }

  // Find the last assistant message index for metadata display
  const lastAssistantIndex = messages.reduce(
    (acc, msg, idx) => (msg.role === 'assistant' ? idx : acc),
    -1,
  );

  return (
    <Box
      data-testid="message-area"
      sx={{
        flex: 1,
        minHeight: 0,
        overflow: 'auto',
        py: `${spacing.layout.sm}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: `${spacing.gap.xl}px`,
      }}
    >
      {messages.map((msg, index) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isStreaming={msg.id === streamingMessageId}
          metadata={index === lastAssistantIndex ? metadata : null}
          onRegenerate={
            onRegenerate && msg.role === 'assistant'
              ? () => onRegenerate(msg.id)
              : undefined
          }
          onDelete={onDeleteMessage ? () => onDeleteMessage(msg.id) : undefined}
        />
      ))}

      {/* Loading indicator while waiting for first SSE event */}
      {isPending && !streamingMessageId && (
        <StreamingIndicator status="connecting" />
      )}

      <div ref={bottomRef} />
    </Box>
  );
}
