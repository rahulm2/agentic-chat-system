# Agentic Chat System

A full-stack agentic chat system for healthcare, featuring a streaming AI backend with multi-step tool calling, a real-time React chat UI, and voice integration.

## Architecture

- **Backend**: Bun + Hono + TypeScript, Prisma ORM, PostgreSQL
- **Frontend**: React + Vite + MUI, constate state management
- **AI Agent**: OpenAI SDK with manual agentic loop, RxNorm + openFDA tools
- **Voice**: Web Speech API (STT) + OpenAI TTS
- **Infra**: Docker Compose, GitHub Actions CI/CD

## Quick Start

```bash
# Clone and start with Docker
git clone <repo-url>
cd agentic-chat-system
cp backend/.env.example backend/.env  # Fill in API keys
docker compose up --build
```

Frontend: http://localhost:5173
Backend: http://localhost:3000
Health: http://localhost:3000/health

## Development

```bash
# Backend
cd backend && bun install && bun run dev

# Frontend
cd frontend && bun install && bun run dev

# Tests
cd backend && bun test
cd frontend && bun run test
npx playwright test  # E2E
```

## Project Structure

```
agentic-chat-system/
├── backend/           # Bun + Hono API server
│   ├── src/
│   │   ├── modules/   # Feature modules (auth, chat, conversation, message, tts, usage, health)
│   │   ├── agent/     # AI agentic loop + healthcare tools
│   │   ├── middleware/ # Auth guard, error handler, logger
│   │   └── common/    # Shared types, errors, config
│   ├── prisma/        # Schema + migrations
│   └── tests/         # Unit + integration tests
├── frontend/          # React + Vite chat UI
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── context/    # State management (constate)
│   │   ├── hooks/      # Custom hooks (SSE, voice)
│   │   ├── api/        # API client
│   │   └── utils/      # Formatters, parsers
│   └── tests/          # Unit + E2E tests
├── docker-compose.yml
└── .github/workflows/  # CI/CD
```

## Development Approach

This project follows **TDD (Test-Driven Development)**. Each GitHub issue includes test criteria. The workflow:

1. Write failing tests (RED)
2. Implement feature (GREEN)
3. Refactor (REFACTOR)
4. Commit with issue reference

See [GitHub Issues](../../issues) for the full backlog.
