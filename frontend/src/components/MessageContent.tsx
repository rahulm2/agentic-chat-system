import { memo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MarkdownRenderer from './MarkdownRenderer';
import ToolCallCard from './ToolCallCard';
import ReasoningPanel from './ReasoningPanel';
import MetadataBar from './MetadataBar';
import MessageActions from './MessageActions';
import { colorSemantics, spacing, typographyPresets } from '../design-system';
import type { ChatMessage, MessageMetadata } from '../context/types';

interface MessageContentProps {
  message: ChatMessage;
  isStreaming?: boolean;
  metadata?: MessageMetadata | null;
  onRegenerate?: () => void;
  onDelete?: () => void;
  onPlayAudio?: () => void;
  isPlayingAudio?: boolean;
}

const MessageContent = memo(function MessageContent({
  message,
  isStreaming,
  metadata,
  onRegenerate,
  onDelete,
  onPlayAudio,
  isPlayingAudio,
}: MessageContentProps) {
  const isAssistant = message.role === 'assistant';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: `${spacing.gap.sm}px`,
      }}
    >
      {/* Reasoning panel */}
      {message.reasoning && (
        <ReasoningPanel reasoning={message.reasoning} isStreaming={isStreaming} />
      )}

      {/* Tool call cards */}
      {message.toolCalls && message.toolCalls.length > 0 && (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            gap: `${spacing.gap.sm}px`,
          }}
        >
          {message.toolCalls.map((tc) => (
            <ToolCallCard key={tc.toolCallId} toolCall={tc} />
          ))}
        </Box>
      )}

      {/* Main message content */}
      {message.role === 'user' ? (
        <Typography
          sx={{
            ...typographyPresets.body.md,
            color: colorSemantics.text.primary,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {message.content}
        </Typography>
      ) : (
        <MarkdownRenderer content={message.content} isStreaming={isStreaming} />
      )}

      {/* Metadata bar — assistant only */}
      {isAssistant && metadata && (
        <MetadataBar metadata={metadata} />
      )}

      {/* Message actions — all roles */}
      <MessageActions
        content={message.content}
        onRegenerate={isAssistant ? onRegenerate : undefined}
        onDelete={onDelete}
        onPlayAudio={isAssistant ? onPlayAudio : undefined}
        isPlayingAudio={isPlayingAudio}
      />
    </Box>
  );
});

export default MessageContent;
