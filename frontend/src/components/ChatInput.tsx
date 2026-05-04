import { useState, type FormEvent } from 'react';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import SendIcon from '@mui/icons-material/Send';

interface ChatInputProps {
  onSend: (message: string) => void;
}

export default function ChatInput({ onSend }: ChatInputProps) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue('');
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', gap: 1, p: 2 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Type a message..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <IconButton type="submit" color="primary" aria-label="Send" disabled={value.trim().length === 0}>
        <SendIcon />
      </IconButton>
    </Box>
  );
}
