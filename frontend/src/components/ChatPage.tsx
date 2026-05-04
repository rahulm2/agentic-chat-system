import Box from '@mui/material/Box';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import MessageList from './MessageList';
import { useMessages, useStreamingStatus, useChatDispatch, useConversation } from '../context';
import { useSSEStream } from '../hooks/useSSEStream';
import { useLogout } from '../hooks/useAuth';
import { useDeleteMessage } from '../hooks/useConversations';
import { colorSemantics } from '../design-system';

export default function ChatPage() {
  const messages = useMessages();
  const { streamingMessageId, streamingStatus } = useStreamingStatus();
  const dispatch = useChatDispatch();
  const { currentConversationId, metadata } = useConversation();
  const logoutMutation = useLogout();

  const { sendMessage, isPending } = useSSEStream({
    dispatch,
    conversationId: currentConversationId,
  });

  const handleSend = (message: string) => {
    sendMessage(message);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const handleNewChat = () => {
    dispatch({ type: 'CLEAR_CONVERSATION' });
  };

  const deleteMessageMutation = useDeleteMessage();

  const handleDeleteMessage = (messageId: string) => {
    // Optimistically remove from local state immediately
    dispatch({ type: 'DELETE_MESSAGE', payload: { messageId } });
    // Fire-and-forget API call (local IDs like `user-{ts}` will 404 silently)
    deleteMessageMutation.mutate(messageId);
  };

  const isStreaming = streamingStatus === 'streaming' || isPending;

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: colorSemantics.background.subtle,
      }}
    >
      <ChatHeader onLogout={handleLogout} onNewChat={handleNewChat} />
      <MessageList
        messages={messages}
        streamingMessageId={streamingMessageId}
        onSelectPrompt={handleSend}
        metadata={metadata}
        onDeleteMessage={handleDeleteMessage}
        isPending={isPending}
      />
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </Box>
  );
}
