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
3. Wire in `backend/src/container.ts` — instantiate repo → service
4. Wire in `backend/src/app.ts` — mount routes, apply auth middleware
5. Create test files (TDD — write these FIRST):
   - `backend/tests/unit/<module-name>.service.test.ts`
   - `backend/tests/integration/<module-name>.api.test.ts`

## Layer Rules
| Layer | Can Call | Cannot Call |
|---|---|---|
| Controller | Service | Repository, Prisma, OpenAI |
| Service | Repository, Agent, external APIs | HTTP context (Request/Response) |
| Repository | Prisma client | Business logic, HTTP |

## Template: Controller (decorator-based)
```typescript
// backend/src/modules/<name>/<name>.controller.ts
import type { Context } from 'hono';
import { Controller, Use } from '@asla/hono-decorator';
import { Get, Post, Delete } from '@asla/hono-decorator';
import { zValidator } from '@hono/zod-validator';
import { <Name>Service } from './<name>.service';
import { <name>Schema } from './<name>.schema';

@Controller({ basePath: '/api/<name>s' })
export class <Name>Controller {
  constructor(private readonly service: <Name>Service) {}

  @Get('/')
  async list(c: Context) {
    const user = c.get('user');
    const result = await this.service.findAll(user.id);
    return c.json(result);
  }

  @Get('/:id')
  async findOne(c: Context) {
    const user = c.get('user');
    const id = c.req.param('id');
    const result = await this.service.findById(id, user.id);
    if (!result) return c.json({ error: 'Not found', code: 'NOT_FOUND' }, 404);
    return c.json(result);
  }

  @Use(zValidator('json', <name>Schema))
  @Post('/')
  async create(c: Context) {
    const user = c.get('user');
    const body = c.req.valid('json');
    const result = await this.service.create(body, user.id);
    return c.json(result, 201);
  }

  @Delete('/:id')
  async remove(c: Context) {
    const user = c.get('user');
    const id = c.req.param('id');
    await this.service.delete(id, user.id);
    return c.json({ success: true });
  }
}
```

## Template: SSE Streaming Controller (for chat)
```typescript
// backend/src/modules/chat/chat.controller.ts
import type { Context } from 'hono';
import { Controller, Use } from '@asla/hono-decorator';
import { Post } from '@asla/hono-decorator';
import { streamSSE } from 'hono/streaming';
import { zValidator } from '@hono/zod-validator';
import { ChatService } from './chat.service';
import { chatSchema } from './chat.schema';

@Use(zValidator('json', chatSchema))
@Controller({ basePath: '/api' })
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('/chat')
  async chat(c: Context) {
    const user = c.get('user');
    const { message, conversationId } = await c.req.json();

    return streamSSE(c, async (stream) => {
      stream.onAbort(() => console.log('Client disconnected'));
      await this.chatService.streamResponse(message, conversationId, user.id, {
        emit: (event, data) => stream.writeSSE({
          event,
          data: JSON.stringify(data),
        }),
      });
    });
  }
}
```

## Template: Service
```typescript
// backend/src/modules/<name>/<name>.service.ts
import { <Name>Repository } from './<name>.repository';
import { AppError } from '../../common/errors';

export class <Name>Service {
  constructor(private readonly repo: <Name>Repository) {}

  async findAll(userId: string, limit = 20, offset = 0) {
    return this.repo.findAll(userId, limit, offset);
  }

  async findById(id: string, userId: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new AppError('NOT_FOUND', 404);
    if (item.userId !== userId) throw new AppError('FORBIDDEN', 403);
    return item;
  }

  async create(data: any, userId: string) {
    return this.repo.create({ ...data, userId });
  }

  async delete(id: string, userId: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new AppError('NOT_FOUND', 404);
    if (item.userId !== userId) throw new AppError('FORBIDDEN', 403);
    return this.repo.delete(id);
  }
}
```

## Template: Repository
```typescript
// backend/src/modules/<name>/<name>.repository.ts
import { PrismaClient } from '@prisma/client';

export class <Name>Repository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(userId: string, limit = 20, offset = 0) {
    return this.prisma.<model>.findMany({
      where: { userId },
      take: limit,
      skip: offset,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findById(id: string) {
    return this.prisma.<model>.findUnique({ where: { id } });
  }

  async create(data: any) {
    return this.prisma.<model>.create({ data });
  }

  async delete(id: string) {
    return this.prisma.<model>.delete({ where: { id } });
  }
}
```

## Template: Schema (Zod)
```typescript
// backend/src/modules/<name>/<name>.schema.ts
import { z } from 'zod';

export const <name>Schema = z.object({
  // define fields
});

export type <Name>Input = z.infer<typeof <name>Schema>;
```

## Wiring in container.ts
```typescript
// Add to backend/src/container.ts
import { <Name>Repository } from './modules/<name>/<name>.repository';
import { <Name>Service } from './modules/<name>/<name>.service';

const <name>Repo = new <Name>Repository(prisma);
const <name>Service = new <Name>Service(<name>Repo);

export const container = {
  // ... existing
  <name>Service,
} as const;
```

## Wiring in app.ts
```typescript
// Add to backend/src/app.ts
import { applyController } from '@asla/hono-decorator';
import { <Name>Controller } from './modules/<name>/<name>.controller';

// Protected routes (auth middleware applied before controller)
app.use('/api/<name>s/*', authGuard);
applyController(app, new <Name>Controller(container.<name>Service));
```

## Auth-Related Patterns

### Auth Service (register/login with Bun.password + hono/jwt)
```typescript
import { sign } from 'hono/jwt';

async register(email: string, password: string, name: string) {
  const existing = await this.authRepo.findByEmail(email);
  if (existing) throw new AppError('EMAIL_ALREADY_EXISTS', 409);
  const passwordHash = await Bun.password.hash(password, 'bcrypt');
  const user = await this.authRepo.create({ email, name, passwordHash });
  const token = await sign(
    { sub: user.id, email, exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7 },
    process.env.JWT_SECRET!,
  );
  return { user: { id: user.id, email, name }, token };
}
```

### Auth Guard Middleware
```typescript
import { verify } from 'hono/jwt';

export const authGuard: MiddlewareHandler = async (c, next) => {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer '))
    return c.json({ error: 'Unauthorized', code: 'UNAUTHORIZED' }, 401);
  try {
    const payload = await verify(header.slice(7), process.env.JWT_SECRET!);
    c.set('user', { id: payload.sub as string, email: payload.email as string });
    await next();
  } catch {
    return c.json({ error: 'Invalid token', code: 'UNAUTHORIZED' }, 401);
  }
};
```

### Error Handler
```typescript
import type { ErrorHandler } from 'hono';
import { AppError } from '@/common/errors';

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    return c.json(err.toJSON(), err.status as never);
  }
  console.error('Unhandled error:', err);
  return c.json({ error: { message: 'Internal server error', code: 'INTERNAL_ERROR' } }, 500);
};
```
