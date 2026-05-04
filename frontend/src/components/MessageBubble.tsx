import { memo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  colorSemantics,
  spacing,
  typographyPresets,
  borderSemantics,
} from '../design-system';

export interface MessageBubbleProps {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  isStreaming?: boolean;
}

const MessageBubble = memo(function MessageBubble({
  role,
  content,
  isStreaming,
}: MessageBubbleProps) {
  const isUser = role === 'user';

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
        <Typography
          component="div"
          sx={{
            ...typographyPresets.body.md,
            color: colorSemantics.text.primary,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
            lineHeight: 1.7,
          }}
        >
          {content}
          {isStreaming && (
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                width: 2,
                height: 18,
                ml: '2px',
                backgroundColor: colorSemantics.text.primary,
                borderRadius: 1,
                animation: 'blink 0.8s step-end infinite',
                verticalAlign: 'text-bottom',
                '@keyframes blink': {
                  '0%, 100%': { opacity: 1 },
                  '50%': { opacity: 0 },
                },
              }}
            />
          )}
        </Typography>
      </Box>
    </Box>
  );
});

export default MessageBubble;
