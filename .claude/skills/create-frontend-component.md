# Create Frontend Component Skill

## Description
Scaffold a new React component following the project's component hierarchy and patterns.

## Steps
1. Create component file: `frontend/src/components/<ComponentName>.tsx`
2. Use MUI components for UI elements
3. Use appropriate constate hooks for state access:
   - `useMessages()` — message data (re-renders on message changes)
   - `useStreamingStatus()` — streaming state (re-renders on stream start/stop)
   - `useChatDispatch()` — dispatch function (NEVER re-renders)
4. Create test file: `frontend/tests/unit/<ComponentName>.test.tsx`

## Performance Rules
- Components that only dispatch should use `useChatDispatch()` only
- Avoid subscribing to `useMessages()` in input components
- Use React.memo for list item components (MessageBubble)

## Template
```tsx
import { FC } from 'react';
import { Box } from '@mui/material';

interface <ComponentName>Props {
  // props
}

export const <ComponentName>: FC<<ComponentName>Props> = ({ ...props }) => {
  return (
    <Box>
      {/* component content */}
    </Box>
  );
};
```
