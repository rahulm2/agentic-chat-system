import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react';
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/ArrowUpwardRounded';
import {
  colorSemantics,
  spacing,
  typographyPresets,
  borderSemantics,
  shadowSemantics,
} from '../design-system';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [value]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <Box
      sx={{
        px: `${spacing.layout.sm}px`,
        pb: `${spacing.component.lg}px`,
        pt: `${spacing.component.sm}px`,
        backgroundColor: colorSemantics.background.subtle,
      }}
    >
      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: `${spacing.gap.sm}px`,
          maxWidth: 768,
          mx: 'auto',
          backgroundColor: colorSemantics.background.default,
          border: `1px solid ${colorSemantics.border.default}`,
          borderRadius: `${borderSemantics.radius.dialog}px`,
          px: `${spacing.component.md}px`,
          py: `${spacing.component.sm}px`,
          boxShadow: shadowSemantics.card,
          transition: 'border-color 0.2s, box-shadow 0.2s',
          '&:focus-within': {
            borderColor: colorSemantics.border.focus,
            boxShadow: shadowSemantics.inputFocus,
          },
        }}
      >
        <Box
          component="textarea"
          ref={textareaRef}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Message Agentic Chat..."
          rows={1}
          sx={{
            flex: 1,
            border: 'none',
            outline: 'none',
            resize: 'none',
            backgroundColor: 'transparent',
            ...typographyPresets.body.md,
            color: colorSemantics.text.primary,
            fontFamily: 'inherit',
            lineHeight: 1.5,
            py: `${spacing.component.xxs}px`,
            '&::placeholder': {
              color: colorSemantics.text.placeholder,
            },
            '&:disabled': {
              color: colorSemantics.text.disabled,
            },
          }}
        />
        <IconButton
          type="submit"
          aria-label="Send"
          disabled={!canSend}
          size="small"
          sx={{
            backgroundColor: canSend
              ? colorSemantics.interactive.primary
              : colorSemantics.background.muted,
            color: canSend
              ? colorSemantics.text.inverse
              : colorSemantics.text.disabled,
            width: 32,
            height: 32,
            borderRadius: `${borderSemantics.radius.input}px`,
            flexShrink: 0,
            transition: 'background-color 0.15s',
            '&:hover': {
              backgroundColor: canSend
                ? colorSemantics.interactive.primaryHover
                : colorSemantics.background.muted,
            },
            '&.Mui-disabled': {
              backgroundColor: colorSemantics.background.muted,
              color: colorSemantics.text.disabled,
            },
          }}
        >
          <SendIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </Box>
      <Box
        sx={{
          maxWidth: 768,
          mx: 'auto',
          mt: `${spacing.component.xs}px`,
          textAlign: 'center',
        }}
      >
        <Box
          component="span"
          sx={{
            ...typographyPresets.body.xs,
            color: colorSemantics.text.disabled,
          }}
        >
          Agentic Chat can make mistakes. Verify important information.
        </Box>
      </Box>
    </Box>
  );
}
