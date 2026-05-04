# Agentic Chat System

## Project Overview
A full-stack agentic chat system for healthcare domain with AI agent workflow capabilities. The system comprises a streaming backend (Bun + Hono + TypeScript), a real-time chat UI (React + Vite + MUI), voice integration (Web Speech API + OpenAI TTS), and production-grade DevOps infrastructure.

## Tech Stack
- **Backend**: Bun + Hono + TypeScript, Prisma ORM, PostgreSQL
- **Frontend**: React + Vite + MUI (Material UI), constate for state management
- **AI**: OpenAI SDK (direct, manual agentic loop), RxNorm + openFDA tools
- **Voice**: Web Speech API (STT), OpenAI TTS (text-to-speech)
- **Infra**: Docker Compose, GitHub Actions CI/CD
- **Testing**: bun test (backend), Vitest + RTL (frontend), Playwright (E2E)

## Architecture
- **Monorepo**: `/backend` and `/frontend` directories
- **Backend Pattern**: Module -> Controller -> Service -> Repository (NestJS-inspired on Hono)
- **Streaming**: SSE over fetch (POST -> text/event-stream), not WebSocket or EventSource
- **State Management**: useReducer + constate (context splitting for zero re-renders on ChatInput during streaming)
- **DI**: Composition root pattern (explicit wiring in container.ts)

## Key Commands
```bash
# Backend
cd backend && bun install && bun run dev
cd backend && bun test              # Unit tests
cd backend && bun test:integration  # Integration tests

# Frontend
cd frontend && bun install && bun run dev
cd frontend && bun run test         # Vitest unit tests

# E2E
npx playwright test

# Docker (full stack)
docker compose up --build

# Prisma
cd backend && bunx prisma migrate dev    # Dev migrations
cd backend && bunx prisma migrate deploy # Production migrations
cd backend && bunx prisma studio         # GUI
```

## Development Approach - TDD
Every feature follows Test-Driven Development:
1. Write failing test cases first (red)
2. Implement the feature to make tests pass (green)
3. Refactor while keeping tests green (refactor)

Each GitHub issue maps to a feature requirement and includes test criteria.

## SSE Event Types
`stream-start`, `reasoning`, `tool-call-start`, `tool-call-result`, `text-delta`, `metadata`, `error`, `done`

## API Endpoints
- `POST /api/auth/register` - Create account (public)
- `POST /api/auth/login` - Authenticate (public)
- `GET /api/auth/me` - Current user (auth)
- `POST /api/chat` - Send message, SSE stream (auth)
- `GET /api/conversations` - List conversations (auth)
- `GET /api/conversations/:id` - Get conversation (auth)
- `DELETE /api/conversations/:id` - Delete conversation (auth)
- `DELETE /api/messages/:id` - Delete message (auth)
- `POST /api/tts` - Generate TTS audio (auth)
- `GET /api/usage` - Usage summary (auth)
- `GET /health` - Health check (public)

## Environment Variables
See `backend/.env.example` for full list. Required: `DATABASE_URL`, `OPENAI_API_KEY`, `JWT_SECRET`.

## Code Style
- Use absolute imports where possible
- Controllers handle HTTP only — no business logic
- Services handle business logic — no HTTP context
- Repositories handle data access only — no business logic
- Agent code is cross-cutting, separate from modules
- Prefer explicit error types (AppError class) over generic throws
