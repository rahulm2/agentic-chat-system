import { useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import MessageBubble from './MessageBubble';
import WelcomePrompts from './WelcomePrompts';
import { spacing } from '../design-system';

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface MessageListProps {
  messages: Message[];
  streamingMessageId: string | null;
  onSelectPrompt: (prompt: string) => void;
}

export default function MessageList({
  messages,
  streamingMessageId,
  onSelectPrompt,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return <WelcomePrompts onSelectPrompt={onSelectPrompt} />;
  }

  return (
    <Box
      data-testid="message-area"
      sx={{
        flex: 1,
        overflow: 'auto',
        py: `${spacing.layout.sm}px`,
        display: 'flex',
        flexDirection: 'column',
        gap: `${spacing.gap.xl}px`,
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
