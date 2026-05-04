# Agentic Chat System

## Project Overview
A full-stack agentic chat system for healthcare domain with AI agent workflow capabilities. Streaming backend (Bun + Hono + TypeScript), real-time chat UI (React + Vite + MUI), voice integration (Web Speech API + OpenAI TTS), production-grade DevOps.

## Tech Stack
| Layer | Choice | Rationale |
|---|---|---|
| Backend Framework | Hono on Bun | Built-in `streamSSE()`, Zod validation, ~14KB, battle-tested |
| AI SDK | OpenAI SDK (direct) | Full control over agentic loop, native streaming, no abstraction |
| Database | PostgreSQL + Prisma | Production-realistic, migration tooling, type safety |
| Healthcare Tools | RxNorm + openFDA | Real APIs, natural multi-step reasoning chain |
| Frontend | React + Vite + MUI | No SSR needed, fast HMR, polished components |
| State Management | useReducer + constate | Context splitting, zero re-renders on ChatInput during streaming |
| Streaming | SSE over fetch | Industry standard (OpenAI, Anthropic pattern), POST with auth |
| STT | Web Speech API | Free, browser-native, live interim results |
| TTS | OpenAI TTS | Same API key, $0.015/1K chars, streaming support |
| Audio Player | react-h5-audio-player | Lightweight, play/pause/seek/volume |
| Testing | bun test + Vitest + Playwright | Full coverage across all layers |
| Infra | Docker Compose + GitHub Actions | Single `docker compose up`, automated CI |

## Architecture

### System Diagram
```
FRONTEND (Vite + React)                    BACKEND (Bun + Hono)
┌─────────────────────┐                   ┌─────────────────────────────┐
│ Chat UI (MUI)       │                   │ Hono — SSE Streaming        │
│ Markdown Renderer   │  POST → SSE      │ Zod Validator               │
│ Tool Cards          │ ───────────────►  │ Agentic Loop (OpenAI SDK)   │
│ Voice Layer (STT)   │                   │ Tool Executor               │
└─────────────────────┘                   │   ├── RxNorm API            │
                                          │   └── openFDA API           │
                                          │ PostgreSQL (Prisma ORM)     │
                                          │ OpenAI TTS API              │
                                          └─────────────────────────────┘
```

### Monorepo Structure
```
agentic-chat-system/
├── backend/src/
│   ├── index.ts              # Bun.serve entry point
│   ├── app.ts                # Hono app assembly + middleware
│   ├── container.ts          # DI composition root (all wiring)
│   ├── modules/
│   │   ├── auth/             # auth.controller, auth.service, auth.repository, auth.schema
│   │   ├── chat/             # chat.controller, chat.service, chat.schema
│   │   ├── conversation/     # conversation.controller/service/repository/schema
│   │   ├── message/          # message.controller/service/repository/schema
│   │   ├── tts/              # tts.controller, tts.service, tts.schema
│   │   ├── usage/            # usage.repository, usage.service
│   │   └── health/           # health.controller
│   ├── agent/
│   │   ├── agent-loop.ts     # Multi-step loop (OpenAI SDK streaming)
│   │   └── tools/            # rxnorm.ts, openfda.ts, definitions.ts, executor.ts
│   ├── middleware/            # auth-guard.ts, error-handler.ts, request-logger.ts, not-found.ts
│   └── common/               # errors.ts (AppError), types.ts (SSEWriter), config.ts
├── frontend/src/
│   ├── main.tsx, App.tsx, theme.ts
│   ├── api/                  # client.ts, chat.ts, conversations.ts, tts.ts, auth.ts
│   ├── context/              # ChatProvider.tsx, chatReducer.ts, useChatState.ts, types.ts
│   ├── components/           # ChatPage, ChatHeader, ChatInput, MessageList, MessageBubble,
│   │                         # MessageContent, MarkdownRenderer, ToolCallCard, ReasoningPanel,
│   │                         # MetadataBar, MessageActions, StreamingIndicator,
│   │                         # MicrophoneButton, VoiceToggle, AudioPlayer,
│   │                         # LoginPage, RegisterPage
│   ├── hooks/                # useChat.ts, useSSEStream.ts, useSpeechToText.ts, useTextToSpeech.ts
│   └── utils/                # sse-parser.ts, format.ts
├── docker-compose.yml
├── .github/workflows/ci.yml
└── e2e/                      # Playwright E2E tests
```

### Backend Pattern: Module → Controller → Service → Repository
| Layer | Responsibility | Can Call | Cannot Call |
|---|---|---|---|
| Controller | HTTP handling, validation, SSE encoding | Service | Repository, Prisma, OpenAI |
| Service | Business logic, orchestration, error mapping | Repository, Agent, external APIs | HTTP context (Request/Response) |
| Repository | Data access, query building | Prisma client | Business logic, HTTP |
| Agent | LLM interaction, tool execution | Tools, OpenAI SDK | HTTP context, Prisma |

### DI Pattern: Composition Root
All dependencies wired explicitly in `backend/src/container.ts`. No DI framework, no decorators, no reflect-metadata. For testing, swap any dependency with a mock.

### Frontend State: constate Context Splitting
```
ChatProvider (constate) splits into:
├── useMessages()        → re-renders on message changes (MessageList)
├── useStreamingStatus() → re-renders on stream start/stop (StreamingIndicator)
└── useChatDispatch()    → NEVER re-renders (ChatInput, MessageActions)
```

## SSE Event Protocol
Client POSTs to `/api/chat`, receives `text/event-stream`. Events:
```
event: stream-start     → { conversationId, messageId }
event: reasoning        → { content: "I need to look up..." }
event: tool-call-start  → { toolCallId, toolName, args }
event: tool-call-result → { toolCallId, result, isError? }
event: text-delta       → { content: "partial text..." }
event: metadata         → { model, inputTokens, outputTokens, latencyMs, estimatedCost }
event: error            → { message, code }
event: done             → {}
```

## Agentic Loop Flow
```
User message → Load history → Build messages + tools
→ LOOP (max 6 steps):
    OpenAI stream → accumulate text-delta + tool_call chunks
    → finish_reason "stop" → BREAK
    → finish_reason "tool_calls" → execute tools → append results → CONTINUE
→ Save conversation + usage → Emit metadata + done
```

Key implementation details:
- Tool call args arrive in chunks via `delta.tool_calls[].function.arguments` — accumulate in buffer per index, parse JSON only after `finish_reason`
- `stream_options: { include_usage: true }` to get token counts in final chunk
- Parallel tool calls: OpenAI may return multiple tool_calls in one response
- 30s timeout via AbortController
- Tool errors fed back to LLM as error results (agent reasons about failures)

## Database Schema (Prisma)
Models: **User** (email unique, passwordHash bcrypt, preferences Json) → **Conversation** (userId FK, cascade) → **Message** (conversationId FK, role, content Text, reasoning Text, orderIndex) → **ToolCall** (messageId FK, toolName, args Json, result Json, status, durationMs) + **UsageRecord** (userId FK, conversationId FK, model, tokens, latencyMs, estimatedCost)

Key indexes: `[userId, updatedAt]` on Conversation, `[conversationId, orderIndex]` on Message, `[userId, createdAt]` on UsageRecord.

## API Endpoints
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | No | Create account, return JWT |
| POST | `/api/auth/login` | No | Authenticate, return JWT |
| GET | `/api/auth/me` | Yes | Current user profile |
| PATCH | `/api/auth/me` | Yes | Update name, avatar, preferences |
| POST | `/api/chat` | Yes | Send message, SSE stream response |
| GET | `/api/conversations` | Yes | List conversations (paginated, sorted) |
| GET | `/api/conversations/:id` | Yes | Get conversation with messages (owner only) |
| DELETE | `/api/conversations/:id` | Yes | Delete conversation (owner only) |
| DELETE | `/api/messages/:id` | Yes | Delete message (owner only) |
| POST | `/api/tts` | Yes | Generate TTS audio (returns audio/mpeg) |
| GET | `/api/usage` | Yes | Usage summary |
| GET | `/health` | No | Health check (DB status) |

## Auth
- Passwords: bcrypt via `Bun.password.hash()` / `Bun.password.verify()`
- JWT: `hono/jwt` sign/verify, 7-day expiry, payload `{ sub: userId, email }`
- Auth guard middleware: verifies Bearer token, sets `c.get('user')` context
- All `/api/*` routes (except auth + health) require JWT

## Healthcare Tools
1. **RxNorm Lookup**: `https://rxnav.nlm.nih.gov/REST/drugs.json?name=<drugName>` → RxCUI, drug concepts, dosage forms
2. **openFDA Adverse Events**: `https://api.fda.gov/drug/event.json?search=openfda.rxcui:<rxcui>&limit=<limit>` → reactions, severity, outcomes

Tool definitions use OpenAI function calling format with JSON Schema parameters.

## Voice Integration
- **STT**: `webkitSpeechRecognition` with `interimResults: true`, `continuous: true`, auto-submit after 1.5s silence
- **TTS**: `POST /api/tts` → OpenAI `/v1/audio/speech` (model tts-1, voice alloy), returns audio/mpeg bytes
- Audio cached per messageId in React ref Map, auto-play latest message when voice enabled
- Voice toggle persists in localStorage

## Key Commands
```bash
# Backend
cd backend && bun install && bun run dev          # Dev with watch
cd backend && bun test                             # Unit tests
cd backend && bun test:integration                 # Integration tests
cd backend && bunx prisma migrate dev              # Dev migrations
cd backend && bunx prisma migrate deploy           # Prod migrations
cd backend && bunx prisma studio                   # GUI

# Frontend
cd frontend && bun install && bun run dev          # Dev with HMR
cd frontend && bun run test                        # Vitest unit tests

# E2E
npx playwright test

# Docker (full stack)
docker compose up --build
```

## Environment Variables
```bash
# Required
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/agentchat
OPENAI_API_KEY=sk-...          # Chat completions + TTS
JWT_SECRET=your-secret-key     # Min 32 chars

# Optional
OPENFDA_API_KEY=               # Higher rate limits
PORT=3000                      # Default: 3000
MAX_AGENT_STEPS=6              # Default: 6
AI_MODEL=gpt-4o                # Default: gpt-4o
AI_TIMEOUT_MS=30000            # Default: 30s
TTS_MODEL=tts-1                # Default: tts-1
TTS_VOICE=alloy                # Default: alloy
VITE_API_URL=http://localhost:3000
```

## Development Approach — TDD
Every feature follows Test-Driven Development. Each GitHub issue has test cases defined.
1. **RED**: Write failing tests covering acceptance criteria
2. **GREEN**: Implement minimum code to pass
3. **REFACTOR**: Clean up, extract utilities, ensure no regressions
4. **Commit**: `git commit -m "feat: <description> (#<issue-number>)"`

## Code Style
- Controllers: HTTP only — no business logic, no direct DB/AI calls
- Services: Business logic — no HTTP context (Request/Response)
- Repositories: Data access only — no business logic
- Agent: Cross-cutting, separate from modules
- Explicit error types: `AppError` class with code and HTTP status
- Absolute imports where possible
- Tree-shake MUI imports: `import Button from '@mui/material/Button'`
- React.memo for list item components (MessageBubble)
- Components that only dispatch use `useChatDispatch()` only

## GitHub Issues Backlog (30 issues, dependency order)
**Infrastructure**: #1 Backend skeleton → #2 Frontend skeleton → #3 DB schema → #4 Testing framework
**Backend**: #5 Auth → #6 Conversations → #7 Messages → #8 Healthcare tools → #9 Agentic loop → #10 Chat endpoint → #11 Usage tracking → #12 DI container
**Frontend**: #13 State management → #14 SSE client → #15 MessageList/Bubble → #16 Markdown → #17 ToolCallCard → #18 ReasoningPanel → #19 Metadata/Actions → #20 StreamingIndicator → #21 MessageContent → #22 Conversation hydration → #23 Auth UI
**Voice**: #24 TTS backend → #25 Voice input → #26 Voice output
**DevOps**: #27 Docker → #28 CI/CD → #29 E2E tests → #30 Polish

## Docker Architecture
```
docker-compose.yml
├── postgres (postgres:16-alpine, healthcheck, pgdata volume, :5432)
├── backend  (oven/bun:1-alpine, multi-stage, non-root, entrypoint: migrate → start, :3000)
└── frontend (node build + nginx serve, proxy /api → backend, :5173→80)
```

## Cost Calculation
```typescript
const rates = {
  'gpt-4o': { input: 2.5 / 1_000_000, output: 10 / 1_000_000 },
  'gpt-4o-mini': { input: 0.15 / 1_000_000, output: 0.6 / 1_000_000 },
};
```

## Risk Mitigations
- Tool call args chunked → accumulate in buffer per index, parse after finish_reason
- Infinite loop → hard cap MAX_AGENT_STEPS (default 6)
- Parallel tool calls → iterate toolCallBuffers map, execute with Promise.allSettled
- External API down → retry with exponential backoff, agent sees error and tells user
- AI timeout → 30s AbortController, emit error event, save partial response
- Partial markdown → re-render full accumulated text each chunk (react-markdown handles reconciliation)
- MUI bundle → tree-shake imports, verify with vite-plugin-visualizer
