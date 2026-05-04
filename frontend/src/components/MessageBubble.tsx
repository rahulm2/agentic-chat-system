import { memo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import MessageContent from './MessageContent';
import {
  colorSemantics,
  spacing,
  typographyPresets,
  borderSemantics,
} from '../design-system';
import type { ChatMessage, MessageMetadata, MessageRole } from '../context/types';

// New props shape — pass a full ChatMessage object
interface MessageBubbleNewProps {
  message: ChatMessage;
  isStreaming?: boolean;
  metadata?: MessageMetadata | null;
  onRegenerate?: () => void;
  onDelete?: () => void;
  onPlayAudio?: () => void;
  isPlayingAudio?: boolean;
  // Ensure old flat props are not present in this shape
  id?: never;
  role?: never;
  content?: never;
}

// Legacy props shape — flat id/role/content (kept for backward-compatibility with existing tests)
interface MessageBubbleLegacyProps {
  id: string;
  role: MessageRole;
  content: string;
  isStreaming?: boolean;
  metadata?: MessageMetadata | null;
  onRegenerate?: () => void;
  onDelete?: () => void;
  onPlayAudio?: () => void;
  isPlayingAudio?: boolean;
  message?: never;
}

export type MessageBubbleProps = MessageBubbleNewProps | MessageBubbleLegacyProps;

const MessageBubble = memo(function MessageBubble(props: MessageBubbleProps) {
  // Normalise to a ChatMessage regardless of which props shape was used
  const message: ChatMessage =
    props.message !== undefined
      ? props.message
      : { id: props.id, role: props.role, content: props.content };

  const { isStreaming, metadata, onRegenerate, onDelete, onPlayAudio, isPlayingAudio } = props;
  const isUser = message.role === 'user';

  return (
    <Box
      sx={{
        display: 'flex',
        gap: `${spacing.gap.md}px`,
        maxWidth: 768,
        width: '100%',
        mx: 'auto',
        px: `${spacing.layout.sm}px`,
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        '&:hover .message-actions': {
          opacity: 1,
        },
      }}
    >
      {/* Avatar */}
      <Box
        sx={{
          width: 28,
          height: 28,
          borderRadius: `${borderSemantics.radius.avatar}px`,
          backgroundColor: isUser
            ? colorSemantics.background.muted
            : colorSemantics.interactive.primary,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          mt: `${spacing.component.xxs}px`,
        }}
      >
        <Typography
          sx={{
            ...typographyPresets.label.sm,
            color: isUser
              ? colorSemantics.text.muted
              : colorSemantics.text.inverse,
            lineHeight: 1,
          }}
        >
          {isUser ? 'U' : 'A'}
        </Typography>
      </Box>

      {/* Message content */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          ...(isUser
            ? {
                backgroundColor: colorSemantics.background.muted,
                borderRadius: `${borderSemantics.radius.bubble}px`,
                px: `${spacing.chat.bubblePaddingX}px`,
                py: `${spacing.chat.bubblePaddingY}px`,
                maxWidth: '85%',
              }
            : {}),
        }}
      >
        <MessageContent
          message={message}
          isStreaming={isStreaming}
          metadata={metadata}
          onRegenerate={onRegenerate}
          onDelete={onDelete}
          onPlayAudio={onPlayAudio}
          isPlayingAudio={isPlayingAudio}
        />
      </Box>
    </Box>
  );
});

export default MessageBubble;
