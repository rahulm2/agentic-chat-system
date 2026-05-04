import { memo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import {
  colorSemantics,
  spacing,
  typographyPresets,
  borderSemantics,
  shadowSemantics,
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
        justifyContent: isUser ? 'flex-end' : 'flex-start',
        px: `${spacing.layout.xs}px`,
      }}
    >
      <Box
        sx={{
          maxWidth: '75%',
          px: `${spacing.chat.bubblePaddingX}px`,
          py: `${spacing.chat.bubblePaddingY}px`,
          borderRadius: `${borderSemantics.radius.bubble}px`,
          backgroundColor: isUser
            ? colorSemantics.interactive.primary
            : colorSemantics.ai.messageBg,
          border: isUser
            ? 'none'
            : `1px solid ${colorSemantics.ai.messageBorder}`,
          boxShadow: isUser ? 'none' : shadowSemantics.bubble,
        }}
      >
        <Typography
          component="div"
          sx={{
            ...typographyPresets.body.md,
            color: isUser
              ? colorSemantics.text.inverse
              : colorSemantics.text.primary,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {content}
          {isStreaming && (
            <Box
              component="span"
              sx={{
                display: 'inline-block',
                width: 6,
                height: 16,
                ml: `${spacing.gap.xs}px`,
                backgroundColor: colorSemantics.ai.stream,
                borderRadius: 1,
                animation: 'blink 1s step-end infinite',
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
