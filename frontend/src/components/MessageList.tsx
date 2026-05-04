import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MessageBubble from './MessageBubble';
import { colorSemantics, spacing, typographyPresets } from '../design-system';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface MessageListProps {
  messages: Message[];
  streamingMessageId: string | null;
}

export default function MessageList({
  messages,
  streamingMessageId,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <Box
        data-testid="message-area"
        sx={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: `${spacing.layout.xs}px`,
        }}
      >
        <Typography
          sx={{
            ...typographyPresets.body.lg,
            color: colorSemantics.text.secondary,
          }}
        >
          Send a message to start a conversation
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      data-testid="message-area"
      sx={{
        flex: 1,
        overflow: 'auto',
        py: `${spacing.component.md}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: `${spacing.chat.messageGroupGap}px`,
      }}
    >
      {messages.map((msg) => (
        <MessageBubble
          key={msg.id}
          id={msg.id}
          role={msg.role}
          content={msg.content}
          isStreaming={msg.id === streamingMessageId}
        />
      ))}
      <div ref={bottomRef} />
    </Box>
  );
}
