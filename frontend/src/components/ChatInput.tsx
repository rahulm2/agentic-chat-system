import { useState, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';
import { colorSemantics, spacing, borderSemantics } from '../design-system';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        display: 'flex',
        gap: `${spacing.gap.sm}px`,
        p: `${spacing.chat.inputPadding}px`,
        borderTop: `1px solid ${colorSemantics.border.default}`,
        backgroundColor: colorSemantics.background.paper,
      }}
    >
      <TextField
        fullWidth
        size="small"
        placeholder="Type a message..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        disabled={disabled}
        sx={{
          '& .MuiOutlinedInput-root': {
            borderRadius: `${borderSemantics.radius.input}px`,
          },
        }}
      />
      <IconButton
        type="submit"
        color="primary"
        aria-label="Send"
        disabled={disabled || value.trim().length === 0}
        sx={{ borderRadius: `${borderSemantics.radius.button}px` }}
      >
        <SendIcon />
      </IconButton>
    </Box>
  );
}
