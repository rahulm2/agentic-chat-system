import { useState, useEffect, useRef } from 'react';
import Box from '@mui/material/Box';
import ChatHeader from './ChatHeader';
import ChatInput from './ChatInput';
import MessageList from './MessageList';
import ConversationSidebar from './ConversationSidebar';
import { useMessages, useStreamingStatus, useChatDispatch, useConversation } from '../context';
import { useSSEStream } from '../hooks/useSSEStream';
import { useLogout } from '../hooks/useAuth';
import { useTextToSpeech } from '../hooks/useTextToSpeech';
import {
  useDeleteMessage,
  useConversationList,
  useConversationDetail,
  mapConversationMessages,
} from '../hooks/useConversations';
import { colorSemantics } from '../design-system';

export default function ChatPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const messages = useMessages();
  const { streamingMessageId, streamingStatus } = useStreamingStatus();
  const dispatch = useChatDispatch();
  const { currentConversationId, metadata } = useConversation();
  const logoutMutation = useLogout();
  const { voiceEnabled, toggleVoice, play: playTts, playingMessageId, stopPlayback } = useTextToSpeech();

  // Pending conversation to load (sidebar selection or initial hydration)
  const [pendingConvId, setPendingConvId] = useState<string | null>(null);
  const { data: pendingConvDetail } = useConversationDetail(pendingConvId);
  const loadedConvIdRef = useRef<string | null>(null);

  // Dispatch SET_CONVERSATION whenever a new conversation detail arrives
  useEffect(() => {
    if (pendingConvDetail && pendingConvDetail.id !== loadedConvIdRef.current) {
      loadedConvIdRef.current = pendingConvDetail.id;
      dispatch({
        type: 'SET_CONVERSATION',
        payload: {
          conversationId: pendingConvDetail.id,
          messages: mapConversationMessages(pendingConvDetail.messages),
        },
      });
    }
  }, [pendingConvDetail, dispatch]);

  // On-mount hydration: load the most recent conversation once
  const { data: convList, isSuccess: listLoaded } = useConversationList();
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (listLoaded && !hydratedRef.current) {
      hydratedRef.current = true;
      const firstId = convList?.conversations[0]?.id;
      if (firstId) setPendingConvId(firstId);
    }
  }, [listLoaded, convList]);

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
    // Allow re-selecting any conversation after clearing
    setPendingConvId(null);
    loadedConvIdRef.current = null;
  };

  const handleToggleSidebar = () => setSidebarOpen((prev) => !prev);

  const deleteMessageMutation = useDeleteMessage();
  const handleDeleteMessage = (messageId: string) => {
    dispatch({ type: 'DELETE_MESSAGE', payload: { messageId } });
    deleteMessageMutation.mutate(messageId);
  };

  const handleSelectConversation = (id: string) => {
    if (id === currentConversationId) return;
    setPendingConvId(id);
  };

  const handleDeleteConversation = (id: string) => {
    if (id === currentConversationId) {
      dispatch({ type: 'CLEAR_CONVERSATION' });
      setPendingConvId(null);
      loadedConvIdRef.current = null;
    }
  };

  // Auto-play TTS when streaming finishes for the latest assistant message
  const prevStreamingStatusRef = useRef(streamingStatus);
  useEffect(() => {
    const wasStreaming = prevStreamingStatusRef.current === 'streaming';
    prevStreamingStatusRef.current = streamingStatus;

    if (wasStreaming && streamingStatus === 'idle' && voiceEnabled) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage?.role === 'assistant' && lastMessage.content) {
        playTts(lastMessage.content, lastMessage.id);
      }
    }
  }, [streamingStatus, voiceEnabled, messages, playTts]);

  const isStreaming = streamingStatus === 'streaming' || isPending;

  return (
    <Box
      sx={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        backgroundColor: colorSemantics.background.subtle,
      }}
    >
      <ConversationSidebar
        open={sidebarOpen}
        activeConversationId={currentConversationId}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
      />

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <ChatHeader
          onLogout={handleLogout}
          onNewChat={handleNewChat}
          sidebarOpen={sidebarOpen}
          onToggleSidebar={handleToggleSidebar}
          voiceEnabled={voiceEnabled}
          onToggleVoice={toggleVoice}
        />
        <MessageList
          messages={messages}
          streamingMessageId={streamingMessageId}
          onSelectPrompt={handleSend}
          metadata={metadata}
          onDeleteMessage={handleDeleteMessage}
          isPending={isPending}
          onPlayAudio={(messageId, content) => {
            if (playingMessageId === messageId) {
              stopPlayback();
            } else {
              playTts(content, messageId);
            }
          }}
          playingMessageId={playingMessageId}
        />
        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </Box>
    </Box>
  );
}
