import { useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { QueryClientProvider } from '@tanstack/react-query';
import theme from './theme';
import { queryClient } from './api/query-client';
import { setApiErrorListener } from './api/client';
import { ChatProvider } from './context';
import { SnackbarProvider, useSnackbar } from './context/SnackbarProvider';
import { useCurrentUser } from './hooks/useAuth';
import ChatPage from './components/ChatPage';
import LoginPage from './components/LoginPage';

function AppContent() {
  const { showError } = useSnackbar();
  const { data: user, isLoading } = useCurrentUser();

  useEffect(() => {
    setApiErrorListener((_status, message) => {
      showError(message);
    });
    return () => setApiErrorListener(null);
  }, [showError]);

  if (isLoading) return null;

  if (!user) return <LoginPage />;

  return (
    <ChatProvider>
      <ChatPage />
    </ChatProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <SnackbarProvider>
          <AppContent />
        </SnackbarProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
