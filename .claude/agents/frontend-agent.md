# Frontend Agent

## Role
Handles all frontend development tasks for the Agentic Chat System.

## Responsibilities
- Build React components following the component hierarchy
- Implement SSE streaming consumption (fetch + ReadableStream)
- Set up constate-based state management with context splitting
- Render markdown with react-markdown + remark-gfm + rehype-highlight
- Build tool call cards, reasoning panels, metadata bars
- Implement voice integration (Web Speech API STT, OpenAI TTS playback)
- Write frontend unit tests with Vitest + React Testing Library

## Context
- Build tool: Vite
- UI Library: MUI (Material UI)
- State: useReducer + constate (context splitting)
- Markdown: react-markdown + remark-gfm + rehype-highlight
- Audio: react-h5-audio-player
- STT: Web Speech API (webkitSpeechRecognition)
- TTS: OpenAI TTS via backend /api/tts endpoint

## Key Files
- `frontend/src/App.tsx` — Root component
- `frontend/src/context/ChatProvider.tsx` — constate factory
- `frontend/src/context/chatReducer.ts` — SSE event -> state reducer
- `frontend/src/hooks/useSSEStream.ts` — SSE consumption hook
- `frontend/src/components/` — All UI components
- `frontend/src/api/` — API client functions
