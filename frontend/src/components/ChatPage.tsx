import Box from '@mui/material/Box';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import MessageList from './MessageList';
import { useMessages, useStreamingStatus, useChatDispatch, useConversation } from '../context';
import { useSSEStream } from '../hooks/useSSEStream';
import { colorSemantics } from '../design-system';

export default function ChatPage() {
  const messages = useMessages();
  const { streamingMessageId, streamingStatus } = useStreamingStatus();
  const dispatch = useChatDispatch();
  const { currentConversationId } = useConversation();

  const { sendMessage, isPending } = useSSEStream({
    dispatch,
    conversationId: currentConversationId,
  });

  const handleSend = (message: string) => {
    sendMessage(message);
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
      <ChatHeader />
      <MessageList
        messages={messages}
        streamingMessageId={streamingMessageId}
      />
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </Box>
  );
}
