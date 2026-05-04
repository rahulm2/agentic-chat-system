# Create Backend Module Skill

## Description
Scaffold a new backend module following the NestJS-inspired pattern on Hono.

## Steps
1. Create directory: `backend/src/modules/<module-name>/`
2. Create files:
   - `<module-name>.controller.ts` — HTTP handling, validation, SSE encoding
   - `<module-name>.service.ts` — Business logic, orchestration
   - `<module-name>.repository.ts` — Prisma data access (if DB needed)
   - `<module-name>.schema.ts` — Zod validation schemas
3. Wire in `backend/src/container.ts` — instantiate repo, service
4. Wire in `backend/src/app.ts` — mount controller routes, apply auth middleware if needed
5. Create test files:
   - `backend/tests/unit/<module-name>.service.test.ts`
   - `backend/tests/integration/<module-name>.api.test.ts`

## Layer Rules
| Layer | Can Call | Cannot Call |
|---|---|---|
| Controller | Service | Repository, Prisma, OpenAI |
| Service | Repository, Agent, external APIs | HTTP context (Request/Response) |
| Repository | Prisma client | Business logic, HTTP |

## Template: Controller
```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { <Name>Service } from './<name>.service';
import { <name>Schema } from './<name>.schema';

export function create<Name>Routes(service: <Name>Service) {
  const router = new Hono();

  router.get('/', async (c) => {
    const result = await service.findAll();
    return c.json(result);
  });

  return router;
}
```
