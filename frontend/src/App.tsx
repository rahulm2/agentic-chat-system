import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { ChatProvider } from './context';
import ChatPage from './components/ChatPage';

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChatProvider>
        <ChatPage />
      </ChatProvider>
    </ThemeProvider>
  );
}
