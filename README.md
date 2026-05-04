# Agentic Chat System

## Demo Recording

[Watch the walkthrough on Google Drive](https://drive.google.com/file/d/17Oy903O7W54et41L5bNOGCaCt532HuHA/view?usp=sharing)

---

A full-stack agentic chat system for the healthcare domain. A streaming Bun + Hono backend runs a multi-step AI agent that calls real healthcare APIs (RxNorm, openFDA), persists every conversation turn, and streams typed SSE events to a React UI that renders tokens, tool calls, and reasoning in real time. Voice input (Web Speech API) and voice output (OpenAI TTS) complete the loop.

---

## Technology Decisions

Every choice below was made deliberately after evaluating alternatives. The rationale and comparison matrices are in [Design & Architecture](#design--architecture).

| Layer | Choice | Why |
|---|---|---|
| Backend Runtime | Bun | Native TypeScript, fast startup, built-in `bun test` |
| Backend Framework | Hono | Built-in `streamSSE()`, Zod validation, ~14 KB, battle-tested |
| AI SDK | OpenAI SDK (direct) | Full control over agentic loop — evaluators see every step |
| Database | PostgreSQL + Prisma | Production-realistic, migration tooling, generated types |
| Healthcare Tools | RxNorm + openFDA | Real APIs, natural multi-step reasoning chain |
| Frontend | React + Vite | No SSR needed, fast HMR, minimal abstraction |
| Component Library | MUI | Pre-built polished components, strong theming |
| State Management | useReducer + constate | Selector-based context splitting — ChatInput never re-renders during streaming |
| Streaming Protocol | SSE over fetch (POST) | Industry standard (same as OpenAI, Anthropic) — EventSource is GET-only |
| Speech-to-Text | Web Speech API | Free, browser-native, live interim results |
| Text-to-Speech | OpenAI TTS | Same API key, $0.015/1 K chars, streaming support |
| Audio Player | react-h5-audio-player | Lightweight, play/pause/seek/volume out of the box |
| Testing | bun test + Vitest + Playwright | Full coverage across all layers |
| Infra | Docker Compose + GitHub Actions | Single `docker compose up`, automated CI |

---

## Quick Start

```bash
git clone <repo-url>
cd agentic-chat-system
cp backend/.env.example backend/.env   # fill in OPENAI_API_KEY and JWT_SECRET
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| Health check | http://localhost:3000/health |

### Default test account

A seed account is created automatically on first startup (idempotent — safe to restart):

| Field    | Value            |
|----------|------------------|
| Email    | test@example.com |
| Password | password123      |

---

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the secrets.

| Variable | Required | Secret | Default | Description |
|---|---|---|---|---|
| `OPENAI_API_KEY` | yes | **yes** | — | Chat completions + TTS |
| `JWT_SECRET` | yes | **yes** | — | Min 32-char random string. Generate: `openssl rand -base64 32` |
| `DATABASE_URL` | yes | no | — | PostgreSQL connection string |
| `PORT` | no | no | `3000` | HTTP server port |
| `AI_MODEL` | no | no | `gpt-4o` | OpenAI model |
| `MAX_AGENT_STEPS` | no | no | `6` | Hard cap on agentic loop iterations |
| `AI_TIMEOUT_MS` | no | no | `30000` | Per-request timeout (ms) |
| `TTS_MODEL` | no | no | `tts-1` | OpenAI TTS model (`tts-1-hd` for higher quality) |
| `TTS_VOICE` | no | no | `alloy` | TTS voice: alloy / echo / fable / onyx / nova / shimmer |
| `OPENFDA_API_KEY` | no | no | — | Higher rate limits for openFDA adverse-event queries |

---

## Database Migrations

Migrations run automatically before the backend accepts any traffic. The Docker entrypoint sequence is:

```
1. prisma migrate deploy   → apply all pending migrations in order (never drops data)
2. bun run scripts/seed.ts → create default test user if not already present
3. bun run src/index.ts    → start HTTP server
```

For local development outside Docker:

```bash
cd backend
bunx prisma migrate dev     # create + apply a new migration
bun run seed                # seed the test user
```

---

## Development

```bash
# Backend (watch mode)
cd backend && bun install && bun run dev

# Frontend (HMR)
cd frontend && bun install && bun run dev

# Tests
cd backend && bun run test:unit
cd backend && bun run test:integration
cd frontend && bun run test
npx playwright test          # E2E (requires the full stack running)
```

---

## CI/CD

Three GitHub Actions jobs run on every push / PR to `main`:

| Job | What it does |
|-----|---|
| **Backend** | Typecheck + unit tests + integration tests against a live PostgreSQL service |
| **Frontend** | Typecheck + Vitest unit tests |
| **Docker** | Builds the image, `docker compose up`, polls `/health` for up to 90 s, smoke-tests login with the seed account |

All jobs fail fast on any non-zero exit. The Docker job always tears down the stack, even on failure.

To enable the Docker job with a real OpenAI key, add `OPENAI_API_KEY` as a repository secret (GitHub → Settings → Secrets and variables → Actions).

---

## Project Structure

```
agentic-chat-system/
├── backend/
│   ├── src/
│   │   ├── modules/        # auth · conversation · message · tts · usage · health
│   │   ├── agent/          # agentic loop + RxNorm / openFDA tools
│   │   ├── middleware/      # auth-guard · error-handler · request-logger · not-found
│   │   └── common/         # AppError · AppContext · SSEWriter · config
│   ├── scripts/
│   │   └── seed.ts         # idempotent seed — creates test@example.com on startup
│   ├── prisma/             # schema.prisma + migrations/
│   ├── tests/              # unit/ + integration/
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/     # all UI components
│   │   ├── context/        # constate state management
│   │   ├── hooks/          # useChat · useSSEStream · useSpeechToText · useTextToSpeech
│   │   ├── api/            # typed fetch wrappers
│   │   ├── design-system/  # tokens (colors · spacing · typography · borders · shadows) + MUI theme
│   │   └── utils/          # sse-parser · format
│   └── tests/              # unit/ + e2e/
├── docker-compose.yml
└── .github/workflows/ci.yml
```

---

## Design & Architecture

### System Diagram

```
FRONTEND (Vite + React)                          BACKEND (Bun + Hono)
┌────────────────────────────────┐               ┌────────────────────────────────────────┐
│  Chat UI (MUI)                 │               │  Hono — SSE Streaming                  │
│  Markdown Renderer             │  POST → SSE   │  Zod Validator                         │
│  Tool Cards                    │ ────────────► │  Agentic Loop (OpenAI SDK)             │
│  Reasoning Panel               │               │  Tool Executor                         │
│  Voice Layer (STT / TTS)       │               │    ├── RxNorm API (drug lookup)        │
└────────────────────────────────┘               │    └── openFDA API (adverse events)    │
                                                 │  PostgreSQL (Prisma ORM)               │
                                                 │  OpenAI TTS API                        │
                                                 └────────────────────────────────────────┘
```

---

### Backend Architecture — NestJS-Inspired Layers on Hono

Hono provides speed and SSE. `@asla/hono-decorator` adds NestJS-style `@Controller` / `@Get` / `@Post` / `@Use` decorators. A manual composition root (`container.ts`) wires all dependencies explicitly — no magic DI framework, no `reflect-metadata`.

```
HTTP Request
    │
    ▼
Controller  — HTTP only: parse request, call service, encode response / SSE
    │
    ▼
Service     — Business logic: orchestration, error mapping, no HTTP context
    │
    ▼
Repository  — Data access only: Prisma queries, no business logic
```

Each layer has strict boundaries:

| Layer | Can call | Cannot call |
|---|---|---|
| Controller | Service | Repository, Prisma, OpenAI |
| Service | Repository, Agent, external APIs | HTTP context (Request/Response) |
| Repository | Prisma client | Business logic, HTTP |
| Agent | Tools, OpenAI SDK | HTTP context, Prisma |

**Typed context and DTO/DAO naming convention:**

- `AppContext` (`Context<AppEnv>`) carries the typed `AuthPayload` from the auth guard — no `c.get("user" as never)` casts in controllers.
- `validateBody(schema)` / `validateQuery(schema)` middleware (wrapping `@hono/zod-validator`) validate before the handler runs and return 400 on failure.
- `getBody<T>(c)` / `getQuery<T>(c)` / `getUser(c)` are typed getters used inside handlers.
- Input types that flow controller → service are named `*DTO` (e.g. `RegisterDTO`, `ChatRequestDTO`).
- Input types that flow service → repository are named `*DAO` (e.g. `CreateMessageDAO`, `ToolCallDAO`).

```typescript
// Before: manual parsing + unsafe cast on every handler
async register(c: Context) {
  const body = registerSchema.parse(await c.req.json()); // throws ZodError
  const user = c.get("user" as never) as { sub: string }; // unsafe
}

// After: validation middleware + typed getters
@Post("/register")
@Use(validateBody(registerSchema))
async register(c: AppContext) {
  const dto = getBody<RegisterDTO>(c);  // already validated, typed
  const user = getUser(c);             // typed AuthPayload, no cast
}
```

---

### Agentic Loop

The loop is built directly with the OpenAI SDK — not abstracted by Vercel AI SDK or LangChain. Every step is visible and debuggable.

```
User message → Load history → Build messages + tool definitions
    │
    └─► LOOP (step = 0 … MAX_AGENT_STEPS):
            │
            ├─► openai.chat.completions.create({ stream: true, tools })
            │       │
            │       ├─► delta.content      → emit SSE "text-delta"
            │       ├─► delta.tool_calls[] → accumulate args in buffer (arrive chunked)
            │       └─► finish_reason
            │               │
            │               ├─► "stop"       → break (final answer)
            │               └─► "tool_calls" → for each buffered tool call:
            │                       emit SSE "tool-call-start"
            │                       execute tool (RxNorm / openFDA)
            │                       emit SSE "tool-call-result"
            │                       append tool result → continue loop
            │
            └─► Save conversation + usage → emit "metadata" + "done"
```

**Why OpenAI SDK directly instead of Vercel AI SDK:** The agentic loop is the core engineering artifact. Vercel AI SDK reduces it to `maxSteps: 6` — impressive for production velocity, but it hides exactly what this system is designed to demonstrate. Building the loop manually with the OpenAI SDK means we own tool-call delta accumulation, partial-stream error recovery, step-level SSE emission, and the `finish_reason` state machine — all explicit and testable.

---

### SSE Event Protocol

The client POSTs to `/api/conversations/completions` and receives `Content-Type: text/event-stream`. Each event is a standard SSE frame.

```
event: stream-start
data: {"conversationId":"conv_abc","messageId":"msg_xyz"}

event: reasoning
data: {"content":"I need to look up ibuprofen first..."}

event: tool-call-start
data: {"toolCallId":"tc_1","toolName":"rxnorm_lookup","args":{"drugName":"ibuprofen"}}

event: tool-call-result
data: {"toolCallId":"tc_1","result":{"rxcui":"5640","name":"Ibuprofen",...}}

event: text-delta
data: {"content":"Ibuprofen is a nonsteroidal "}

event: text-delta
data: {"content":"anti-inflammatory drug..."}

event: metadata
data: {"model":"gpt-4o","inputTokens":245,"outputTokens":312,"latencyMs":2340,"estimatedCost":0.0087}

event: done
data: {}
```

**Why SSE over fetch instead of EventSource:** The browser's native `EventSource` API only supports GET requests and cannot send authorization headers or a request body. Every major AI API (OpenAI, Anthropic, Vercel AI SDK v5) uses SSE-formatted responses consumed by `fetch()` + `response.body.getReader()` for exactly this reason. WebSocket is reserved for bidirectional real-time use cases — token streaming is unidirectional after the prompt is sent.

---

### Frontend Architecture — State Management

**Problem:** During streaming, `text-delta` events fire 30+ times per second. Plain `React.createContext` re-renders every subscriber on every dispatch — including `ChatInput`, which only needs `dispatch` (a stable reference that never changes).

**Solution:** `constate` (~1 KB, zero deps) splits a single `useReducer` hook into multiple React Contexts via selector functions. Each selector creates its own context:

```typescript
const [ChatProvider, useMessages, useStreamingStatus, useChatDispatch, useConversation] =
  constate(
    useChatContext,
    ({ state }) => state.messages,            // re-renders on message changes
    ({ state }) => ({ streamingStatus, ... }), // re-renders on stream start/stop
    ({ dispatch }) => dispatch,               // NEVER re-renders
    ({ state }) => ({ currentConversationId }),
  );
```

Result: `ChatInput` subscribes to `useChatDispatch()` only — **zero re-renders during streaming**. `MessageList` subscribes to `useMessages()` — re-renders on every delta (intentional). Each component gets exactly the re-renders it needs.

**State → SSE event mapping** (reducer actions mirror the SSE event grammar):

| SSE event | Reducer action | Effect |
|---|---|---|
| `stream-start` | `STREAM_START` | Append empty assistant message, set `streamingMessageId` |
| `text-delta` | `STREAM_TEXT_DELTA` | Append content to streaming message |
| `reasoning` | `STREAM_REASONING` | Append to reasoning field |
| `tool-call-start` | `STREAM_TOOL_CALL_START` | Append pending tool call |
| `tool-call-result` | `STREAM_TOOL_CALL_RESULT` | Update tool call status + result |
| `metadata` | `STREAM_METADATA` | Attach metadata to the message |
| `done` | `STREAM_DONE` | Clear `streamingMessageId`, set status idle |

**Why useReducer + constate instead of Zustand:** The reducer pattern maps perfectly to SSE events → state transitions. Constate adds context splitting for ~1 KB and zero new concepts. If the app grows, migration to Zustand is trivial — the selector pattern is identical.

---

### Component Hierarchy

```
<ChatProvider>           (constate — 4 separate contexts)
  <ChatPage>
    <ChatHeader />                          ← useMessages() only
    <MessageList>                           ← useMessages() + useStreamingStatus()
      <MessageBubble role="user">
        <MessageContent />
        <MessageActions />                  ← useChatDispatch() only
      </MessageBubble>
      <MessageBubble role="assistant">
        <ReasoningPanel />                  (collapsible, streams live)
        <MessageContent>
          <MarkdownRenderer />              (react-markdown + remark-gfm + rehype-highlight)
          <ToolCallCard />                  (inline per tool call — pending/running/success/error)
        </MessageContent>
        <MetadataBar />                     (timestamp · model · tokens · cost)
        <MessageActions />                  ← useChatDispatch() only
      </MessageBubble>
    </MessageList>
    <StreamingIndicator />                  ← useStreamingStatus() only
    <ChatInput>                             ← useChatDispatch() only (zero re-renders)
      <MicrophoneButton />
      <SendButton />
    </ChatInput>
  </ChatPage>
</ChatProvider>
```

---

### Voice Integration

**Speech-to-Text (Web Speech API)**

`webkitSpeechRecognition` with `interimResults: true` updates the input field live as the user speaks. A 1.5 s silence timer auto-submits after speech stops. If the user presses Enter while the timer is pending, `stop()` is called on the recognition instance first — clearing the timer — so the message is never sent twice.

Chosen over Deepgram / Whisper because: free, zero backend proxy, live interim results (Whisper is batch-only), and Chrome/Edge coverage is sufficient for the demo context.

**Text-to-Speech (OpenAI TTS)**

`POST /api/tts` proxies to OpenAI's `/v1/audio/speech` (model `tts-1`, voice `alloy`), returns raw `audio/mpeg` bytes. The frontend creates a blob URL, caches it per `messageId` in a React ref Map, and either auto-plays the latest message (when voice is enabled) or renders it in `react-h5-audio-player` for older messages.

Chosen over ElevenLabs (12× more expensive) and browser `SpeechSynthesis` (no backend endpoint, robotic quality). Same API key as chat completions — no additional vendor.

```
Voice input flow:
  Press 🎤 → request mic permission
    ├─► granted → start recognition → interim results → update input live
    │                               → 1.5 s silence → auto-submit → stop
    └─► denied → show error alert with instructions

Voice output flow:
  Streaming completes → voice enabled?
    ├─► yes → POST /api/tts → blob URL → auto-play → cache in audioCache ref
    └─► no  → skip (text still visible)
  Older messages → react-h5-audio-player with cached blob URL
```

---

### Technology Rationale — Key Comparison Matrices

#### Backend Framework

| | Hono ✅ | Elysia | Express | NestJS |
|---|---|---|---|---|
| Built-in SSE helper | `streamSSE()` | `sse()` | Manual | Manual |
| Bundle size | ~14 KB | ~50 KB | ~200 KB | ~2 MB+ |
| TypeScript | First-class | First-class | Bolted on | First-class |
| Bun-native SSE perf | Excellent | 10× slower (GitHub #1369) | — | — |
| npm weekly downloads | ~3 M | ~277 K | ~48 M | ~3 M |
| Learning curve | Low | Low | Very low | High |

Elysia was the runner-up — its Eden Treaty type safety is excellent and the SSE API is elegant. But a documented 10× SSE performance regression vs Hono, a 10× smaller ecosystem, and Bun-only lock-in made it the riskier choice for a system where SSE is the core transport.

#### AI SDK

| | OpenAI SDK (direct) ✅ | Vercel AI SDK | LangChain.js |
|---|---|---|---|
| Agentic loop control | Full | Abstracted (`maxSteps`) | Framework-managed |
| Streaming | Native async iterator | Typed stream parts | Abstracted |
| Tool call delta parsing | Manual (you own it) | Automatic | Automatic |
| Debugging mid-loop | Direct — every chunk visible | Hard to inspect | Very abstracted |
| Bundle size | ~50 KB | ~50 KB + adapters | ~500 KB+ |

#### Streaming Protocol

| | SSE over fetch ✅ | WebSocket | Native EventSource |
|---|---|---|---|
| Used by OpenAI / Anthropic | Yes | Realtime API only | No |
| HTTP method | POST (with body) | Upgrade from GET | GET only |
| Auth headers | Yes | Workarounds needed | No |
| Request body | Yes | Via message post-connect | No (URL params only) |
| Infrastructure | Standard HTTP | Needs WS support | Standard HTTP |

#### Frontend State Management

| | useReducer + constate ✅ | Plain Context + useReducer | Zustand |
|---|---|---|---|
| Re-render on text-delta | Only subscribers | All consumers | Only subscribers |
| ChatInput re-renders during stream | 0 | 30+/sec (unnecessary) | 0 |
| Bundle added | ~1 KB | 0 | ~3 KB |
| Concepts introduced | 0 (one function) | 0 | New store paradigm |

#### Speech-to-Text

| | Web Speech API ✅ | Deepgram | OpenAI Whisper |
|---|---|---|---|
| Live interim results | Yes | Yes | No (batch only) |
| Cost | Free | ~$0.0043/min | ~$0.006/min |
| Backend proxy needed | No | Yes (WebSocket) | Yes (REST) |
| Browser support | Chrome/Edge | All | All |

#### Text-to-Speech

| | OpenAI TTS ✅ | ElevenLabs | Browser SpeechSynthesis |
|---|---|---|---|
| Cost per 1 K chars | $0.015 | $0.18+ | Free |
| Voice quality | Very good | Best | Poor (robotic) |
| Same API key as chat | Yes | No (new vendor) | N/A |
| Backend endpoint | Yes | Yes | No (disqualified) |

---

### Risk Mitigations

| Risk | Mitigation |
|---|---|
| Tool call args arrive chunked | Accumulate `delta.tool_calls[i].function.arguments` in a buffer per index; parse JSON only after `finish_reason === "tool_calls"` |
| Infinite agent loop | Hard cap at `MAX_AGENT_STEPS` (default 6); emit SSE error event if exceeded |
| Parallel tool calls from LLM | OpenAI may return multiple `tool_calls` in one response; execute with `Promise.allSettled`, feed all results back before next step |
| External API down | Retry with exponential backoff; tool errors are fed back to the agent as error results so it can reason and tell the user |
| AI timeout | 30 s `AbortController`; emit SSE error event, save partial response |
| Voice double-submit race | When user presses Enter while silence timer is pending, `stop()` clears the timer before `onSend()` fires — timer callback cannot fire after |
| Web Speech API unreliable | Debounce results, handle `onerror` and `onend`, `submittedRef` guard prevents double-fire from both timer and manual submit |
| Partial markdown during streaming | Re-render full accumulated text on each delta; `react-markdown` handles reconciliation efficiently |
| TTS latency (~500 ms) | Audio cached per `messageId` in a React ref Map; re-fetched only on first play |
| MUI bundle size | Tree-shake imports (`import Button from '@mui/material/Button'`); verify with `vite-plugin-visualizer` |

---

## Known Trade-offs & Future Improvements

Two additions were scoped out due to time constraints but are worth noting:

**Frontend — Formik + Yup for form validation**

The login and register forms currently use plain React state with manual validation. [Formik](https://formik.org/) paired with [Yup](https://github.com/jquense/yup) would give declarative schema-driven validation, field-level error state, touched/dirty tracking, and accessible error messages out of the box — particularly valuable as the form count grows (profile editing, preferences). The backend already uses Zod schemas per endpoint; Yup would be the frontend equivalent, keeping validation logic co-located with each form rather than scattered across event handlers.

**Backend — LiveKit voice agent for real-time streaming TTS**

The current TTS implementation generates audio for a complete assistant message after streaming finishes, then plays it back. A better UX would pipe each `text-delta` SSE event directly into a [LiveKit](https://livekit.io/) voice agent, which maintains an open audio stream and speaks tokens as they arrive — eliminating the wait between the last token and audio playback. LiveKit's agent framework handles sentence boundary detection, audio buffering, and WebRTC transport. The trade-off is added infrastructure (LiveKit server or LiveKit Cloud), a more complex backend pipeline, and a WebRTC session instead of simple HTTP audio bytes. The current batch TTS approach was chosen to keep the dependency surface small and the architecture easy to follow.

---

## Development Approach

This project follows **TDD (Test-Driven Development)**. Each GitHub issue defines acceptance criteria as tests. The workflow:

1. Write failing tests (RED)
2. Implement minimum code to pass (GREEN)
3. Refactor (REFACTOR)
4. Commit with issue reference (`feat: description (#N)`)

See [GitHub Issues](../../issues) for the full backlog (30 issues, dependency-ordered).
