import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import { queryClient } from './api/query-client';
import { ChatProvider } from './context';
import ChatPage from './components/ChatPage';

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ChatProvider>
          <ChatPage />
        </ChatProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
