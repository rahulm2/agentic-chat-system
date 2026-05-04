# Agentic Chat System

A full-stack agentic chat system for healthcare, featuring a streaming AI backend with multi-step tool calling, a real-time React chat UI, and voice integration.

## Architecture

- **Backend**: Bun + Hono + TypeScript, `@asla/hono-decorator` (NestJS-like decorators), Prisma ORM, PostgreSQL
- **Frontend**: React + Vite + MUI, constate state management
- **AI Agent**: OpenAI SDK with manual agentic loop, RxNorm + openFDA tools
- **Voice**: Web Speech API (STT) + OpenAI TTS
- **Infra**: Docker Compose, GitHub Actions CI/CD

## Quick Start

```bash
git clone <repo-url>
cd agentic-chat-system
cp backend/.env.example backend/.env   # fill in OPENAI_API_KEY and JWT_SECRET
docker compose up --build
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Health: http://localhost:3000/health

### Default test account

A seed account is created automatically on first startup:

| Field    | Value              |
|----------|--------------------|
| Email    | test@example.com   |
| Password | password123        |

## Environment Variables

Copy `backend/.env.example` to `backend/.env` and fill in the values marked as secrets.

| Variable          | Required | Secret | Default   | Description |
|-------------------|----------|--------|-----------|-------------|
| `OPENAI_API_KEY`  | yes      | yes    | —         | OpenAI key for chat completions + TTS |
| `JWT_SECRET`      | yes      | yes    | —         | Min 32-char random string for signing JWTs |
| `DATABASE_URL`    | yes      | no     | —         | PostgreSQL connection string |
| `PORT`            | no       | no     | `3000`    | HTTP server port |
| `AI_MODEL`        | no       | no     | `gpt-4o`  | OpenAI model for chat completions |
| `MAX_AGENT_STEPS` | no       | no     | `6`       | Max agentic loop iterations per request |
| `AI_TIMEOUT_MS`   | no       | no     | `30000`   | Request timeout in milliseconds |
| `TTS_MODEL`       | no       | no     | `tts-1`   | OpenAI TTS model |
| `TTS_VOICE`       | no       | no     | `alloy`   | TTS voice (alloy/echo/fable/onyx/nova/shimmer) |
| `OPENFDA_API_KEY` | no       | no     | —         | Higher rate limits for openFDA |

Generate a JWT secret:
```bash
openssl rand -base64 32
```

## Database Migrations

Migrations run automatically before the backend accepts any traffic. The startup sequence inside the Docker container is:

```
prisma migrate deploy   → apply all pending migrations in order
bun run scripts/seed.ts → create default test user (idempotent)
bun run src/index.ts    → start the HTTP server
```

No manual steps are needed. For local development outside Docker:

```bash
cd backend
bunx prisma migrate dev    # create + apply a new migration
bun run seed               # seed the test user
```

## Development

```bash
# Backend
cd backend && bun install && bun run dev

# Frontend
cd frontend && bun install && bun run dev

# Tests
cd backend && bun test:unit
cd backend && bun test:integration
cd frontend && bun run test
npx playwright test          # E2E
```

## CI/CD

GitHub Actions runs three jobs on every push/PR to `main`:

| Job | What it does |
|-----|-------------|
| **Backend** | Typechecks + runs unit and integration tests against a real PostgreSQL service |
| **Frontend** | Typechecks + runs Vitest unit tests |
| **Docker** | Builds the Docker image, runs `docker compose up`, waits for `/health`, smoke-tests login with the seeded account |

All jobs fail fast on any non-zero exit. The Docker job tears down the stack even on failure.

To use the Docker job with a real OpenAI key, add `OPENAI_API_KEY` as a repository secret in GitHub → Settings → Secrets and variables → Actions.

## Project Structure

```
agentic-chat-system/
├── backend/
│   ├── src/
│   │   ├── modules/    # Feature modules: auth, chat, conversation, message, tts, usage, health
│   │   ├── agent/      # AI agentic loop + healthcare tools (RxNorm, openFDA)
│   │   ├── middleware/  # Auth guard, error handler, logger
│   │   └── common/     # Shared types, errors, config
│   ├── scripts/
│   │   └── seed.ts     # Idempotent seed — creates test@example.com on startup
│   ├── prisma/         # Schema + migrations
│   ├── tests/          # Unit + integration tests
│   ├── Dockerfile
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/ # UI components
│   │   ├── context/    # State management (constate)
│   │   ├── hooks/      # Custom hooks (SSE, voice)
│   │   ├── api/        # API client
│   │   └── utils/      # Formatters, parsers
│   └── tests/          # Unit + E2E tests
├── docker-compose.yml
└── .github/workflows/ci.yml
```

## Development Approach

This project follows **TDD (Test-Driven Development)**. Each GitHub issue includes test criteria. The workflow:

1. Write failing tests (RED)
2. Implement feature (GREEN)
3. Refactor (REFACTOR)
4. Commit with issue reference

See [GitHub Issues](../../issues) for the full backlog.
