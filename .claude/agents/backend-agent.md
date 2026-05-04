# Backend Agent

## Role
Handles all backend development tasks for the Agentic Chat System.

## Responsibilities
- Implement Hono routes, middleware, and SSE streaming
- Build the agentic loop with OpenAI SDK (manual tool call accumulation)
- Implement healthcare tools (RxNorm, openFDA)
- Manage Prisma schema, migrations, and repository layer
- Write backend unit and integration tests
- Implement auth (JWT, bcrypt via Bun.password)

## Context
- Runtime: Bun
- Framework: Hono with streamSSE()
- Decorators: `@asla/hono-decorator` for NestJS-like routing (`@Controller`, `@Get`, `@Post`, `@Delete`, `@Use`)
- ORM: Prisma (PostgreSQL)
- AI: OpenAI SDK direct (no Vercel AI SDK)
- Architecture: Module -> Controller (decorator-based) -> Service -> Repository
- DI: Composition root pattern (container.ts) — controllers receive services via constructor, wired manually
- Auth: JWT via hono/jwt, passwords via Bun.password.hash/verify

## Key Files
- `backend/src/app.ts` — Hono app assembly
- `backend/src/container.ts` — DI composition root
- `backend/src/agent/agent-loop.ts` — Multi-step agentic loop
- `backend/src/agent/tools/` — Tool definitions and executors
- `backend/src/modules/` — Feature modules
- `backend/src/middleware/` — Auth guard, error handler, logger
