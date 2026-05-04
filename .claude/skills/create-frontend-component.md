# Create Frontend Component Skill

## Description
Scaffold a new React component following the project's component hierarchy, MUI styling, and constate state patterns.

## Steps
1. Create component file: `frontend/src/components/<ComponentName>.tsx`
2. Use MUI components for UI elements
3. Use appropriate constate hooks for state access (see performance rules)
4. Create test file FIRST (TDD): `frontend/tests/unit/<ComponentName>.test.tsx`
5. Run test to confirm it fails, then implement component

## Performance Rules — Critical for Streaming
- **ChatInput**: uses `useChatDispatch()` ONLY → zero re-renders during streaming
- **MessageList**: uses `useMessages()` + `useStreamingStatus()` → re-renders on deltas (intended)
- **StreamingIndicator**: uses `useStreamingStatus()` ONLY → re-renders on stream start/stop
- **MessageActions**: uses `useChatDispatch()` ONLY → zero re-renders during streaming
- **ChatHeader**: uses `useMessages()` ONLY → re-renders on new messages, not deltas
- Use `React.memo` for list item components (MessageBubble)
- Never subscribe to `useMessages()` in input/action components

## Component Hierarchy Reference
```
<App>
  <ThemeProvider> (MUI theme from theme.ts)
    <ChatProvider> (constate — splits into 3 contexts)
      <ChatPage>
        <ChatHeader />
        <MessageList>
          <MessageBubble role="user">
            <MessageContent />
            <MessageActions />
          </MessageBubble>
          <MessageBubble role="assistant">
            <ReasoningPanel />
            <MessageContent>
              <MarkdownRenderer />
              <ToolCallCard /> (per tool call)
            </MessageContent>
            <MetadataBar />
            <MessageActions />
          </MessageBubble>
        </MessageList>
        <StreamingIndicator />
        <ChatInput>
          <TextField /> (MUI)
          <MicrophoneButton /> (Phase 3)
          <SendButton />
        </ChatInput>
      </ChatPage>
    </ChatProvider>
  </ThemeProvider>
</App>
```

## Template: Basic Component
```tsx
import { FC } from 'react';
import { Box, Typography } from '@mui/material';

interface <ComponentName>Props {
  // props
}

export const <ComponentName>: FC<<ComponentName>Props> = ({ ...props }) => {
  return (
    <Box>
      <Typography>Content</Typography>
    </Box>
  );
};
```

## Template: Component with Dispatch (no re-renders)
```tsx
import { FC, useCallback } from 'react';
import { IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useChatDispatch } from '../context/ChatProvider';

interface MessageActionsProps {
  messageId: string;
}

export const MessageActions: FC<MessageActionsProps> = ({ messageId }) => {
  const dispatch = useChatDispatch();

  const handleDelete = useCallback(async () => {
    await fetch(`/api/messages/${messageId}`, { method: 'DELETE' });
    dispatch({ type: 'DELETE_MESSAGE', payload: { id: messageId } });
  }, [messageId, dispatch]);

  return (
    <IconButton onClick={handleDelete} size="small" sx={{ opacity: 0, '&:hover': { opacity: 1 } }}>
      <DeleteIcon fontSize="small" />
    </IconButton>
  );
};
```

## Template: Component with Messages (re-renders on changes)
```tsx
import { FC, useRef, useEffect } from 'react';
import { Box, Skeleton } from '@mui/material';
import { useMessages, useStreamingStatus } from '../context/ChatProvider';
import { MessageBubble } from './MessageBubble';

export const MessageList: FC = () => {
  const messages = useMessages();
  const { isStreaming } = useStreamingStatus();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  if (!messages) {
    return <Skeleton variant="rectangular" height={400} />;
  }

  return (
    <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={bottomRef} />
    </Box>
  );
};
```

## Template: Markdown Renderer
```tsx
import { FC, memo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: FC<MarkdownRendererProps> = memo(({ content }) => {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
    >
      {content}
    </ReactMarkdown>
  );
});
```

## Template: Tool Call Card
```tsx
import { FC, useState } from 'react';
import { Card, CardHeader, Collapse, Chip, Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import CircularProgress from '@mui/material/CircularProgress';

const statusConfig = {
  pending: { color: 'default' as const, icon: null },
  running: { color: 'primary' as const, icon: <CircularProgress size={16} /> },
  completed: { color: 'success' as const, icon: <CheckCircleIcon fontSize="small" /> },
  error: { color: 'error' as const, icon: <ErrorIcon fontSize="small" /> },
};

interface ToolCallCardProps {
  toolName: string;
  args: Record<string, any>;
  result?: Record<string, any>;
  status: 'pending' | 'running' | 'completed' | 'error';
}

export const ToolCallCard: FC<ToolCallCardProps> = ({ toolName, args, result, status }) => {
  const [expanded, setExpanded] = useState(false);
  const config = statusConfig[status];

  return (
    <Card variant="outlined" sx={{ my: 1 }} onClick={() => setExpanded(!expanded)}>
      <CardHeader
        title={toolName}
        avatar={config.icon}
        action={<Chip label={status} color={config.color} size="small" />}
        titleTypographyProps={{ variant: 'subtitle2' }}
        sx={{ cursor: 'pointer', py: 1 }}
      />
      <Collapse in={expanded}>
        <Box sx={{ px: 2, pb: 2 }}>
          <Typography variant="caption" color="text.secondary">Arguments:</Typography>
          <pre style={{ fontSize: 12 }}>{JSON.stringify(args, null, 2)}</pre>
          {result && (
            <>
              <Typography variant="caption" color="text.secondary">Result:</Typography>
              <pre style={{ fontSize: 12 }}>{JSON.stringify(result, null, 2)}</pre>
            </>
          )}
        </Box>
      </Collapse>
    </Card>
  );
};
```

## SSE Streaming Consumption Pattern
```typescript
// frontend/src/hooks/useSSEStream.ts
export function useSSEStream() {
  const dispatch = useChatDispatch();

  const startStream = useCallback(async (message: string, conversationId?: string) => {
    const token = localStorage.getItem('token');
    const controller = new AbortController();

    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message, conversationId }),
      signal: controller.signal,
    });

    const reader = response.body!.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split('\n\n');
      buffer = events.pop()!;

      for (const event of events) {
        const parsed = parseSSEEvent(event);
        if (parsed) dispatch({ type: parsed.event, payload: parsed.data });
      }
    }

    return controller;
  }, [dispatch]);

  return { startStream };
}
```

## constate Setup Pattern
```typescript
// frontend/src/context/ChatProvider.tsx
import constate from 'constate';
import { useReducer, useEffect } from 'react';
import { chatReducer, initialState } from './chatReducer';

function useChatState() {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  return { state, dispatch };
}

const [
  ChatProvider,
  useMessages,
  useStreamingStatus,
  useChatDispatch,
] = constate(
  useChatState,
  value => value.state.messages,
  value => ({ isStreaming: value.state.isStreaming, activeToolCalls: value.state.activeToolCalls }),
  value => value.dispatch,
);

export { ChatProvider, useMessages, useStreamingStatus, useChatDispatch };
```
