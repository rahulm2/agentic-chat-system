import Box from '@mui/material/Box';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import { colorSemantics, spacing } from '../design-system';

export default function ChatPage() {
  const handleSend = (_message: string) => {
    // Will be wired to SSE client in a later issue
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: colorSemantics.background.subtle,
      }}
    >
      <ChatHeader />
      <Box
        data-testid="message-area"
        sx={{
          flex: 1,
          overflow: 'auto',
          p: `${spacing.layout.xs}px`,
        }}
      />
      <ChatInput onSend={handleSend} />
    </Box>
  );
}
