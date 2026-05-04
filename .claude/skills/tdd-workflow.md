# TDD Workflow Skill

## Description
Follow Test-Driven Development for every feature implementation tied to a GitHub issue.

## Workflow
1. **Read the GitHub issue** — run `gh issue view <number>` to get acceptance criteria and test cases
2. **Write failing tests first** (RED phase):
   - Backend unit: `backend/tests/unit/<module>.test.ts` using `bun:test`
   - Backend integration: `backend/tests/integration/<module>.api.test.ts` using `app.request()`
   - Frontend unit: `frontend/tests/unit/<Component>.test.tsx` using Vitest + RTL
   - E2E: `e2e/<flow>.spec.ts` using Playwright
   - Run tests to confirm they fail: `bun test` / `bun run test` / `npx playwright test`
3. **Implement the feature** (GREEN phase):
   - Backend: follow Module → Controller → Service → Repository pattern
   - Frontend: follow component hierarchy, use correct constate hooks
   - Write minimum code to make all tests pass
4. **Refactor** (REFACTOR phase):
   - Clean up while keeping tests green
   - Extract shared utilities if needed
5. **Commit**: `git commit -m "feat: <description> (#<issue-number>)"`

## Test Patterns

### Backend Unit Test (bun:test)
```typescript
import { describe, it, expect, vi, beforeEach } from 'bun:test';
import { ChatService } from '../../src/modules/chat/chat.service';

describe('ChatService', () => {
  let service: ChatService;
  let mockConversationRepo: any;
  let mockMessageRepo: any;
  let mockUsageRepo: any;
  let mockAgentRunner: any;

  beforeEach(() => {
    mockConversationRepo = {
      findById: vi.fn().mockResolvedValue({ id: 'conv_1', messages: [] }),
      create: vi.fn().mockResolvedValue({ id: 'conv_new' }),
    };
    mockMessageRepo = {
      findByConversationId: vi.fn().mockResolvedValue([]),
      create: vi.fn(),
      createWithToolCalls: vi.fn(),
    };
    mockUsageRepo = { create: vi.fn() };
    mockAgentRunner = {
      run: vi.fn().mockResolvedValue({
        content: 'response', reasoning: null, toolCalls: [],
        usage: { input: 100, output: 50 }, model: 'gpt-4o',
      }),
    };
    service = new ChatService(mockConversationRepo, mockMessageRepo, mockUsageRepo, mockAgentRunner);
  });

  it('creates new conversation when no id provided', async () => {
    const sseWriter = { emit: vi.fn() };
    await service.streamResponse('hello', undefined, sseWriter);
    expect(mockConversationRepo.create).toHaveBeenCalled();
  });
});
```

### Backend Integration Test (Hono app.request)
```typescript
import { describe, it, expect, beforeAll } from 'bun:test';
import app from '../../src/app';

describe('POST /api/chat', () => {
  let authToken: string;

  beforeAll(async () => {
    // Register a test user and get token
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'test@test.com', password: 'password123', name: 'Test' }),
    });
    const data = await res.json();
    authToken = data.token;
  });

  it('returns SSE stream with correct content type', async () => {
    const res = await app.request('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ message: 'What is ibuprofen?' }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');
  });

  it('returns 400 for empty message', async () => {
    const res = await app.request('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({ message: '' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 401 without auth', async () => {
    const res = await app.request('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'hello' }),
    });
    expect(res.status).toBe(401);
  });
});
```

### Frontend Unit Test (Vitest + RTL)
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatInput } from '../../src/components/ChatInput';

describe('ChatInput', () => {
  it('send button is disabled when input is empty', () => {
    render(<ChatInput onSend={vi.fn()} />);
    expect(screen.getByRole('button', { name: /send/i })).toBeDisabled();
  });

  it('calls onSend with message and clears input', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'hello' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));
    expect(onSend).toHaveBeenCalledWith('hello');
    expect(input).toHaveValue('');
  });

  it('submits on Enter key', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'hello' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledWith('hello');
  });

  it('allows newline on Shift+Enter', () => {
    const onSend = vi.fn();
    render(<ChatInput onSend={onSend} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'hello' } });
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    expect(onSend).not.toHaveBeenCalled();
  });
});
```

### Frontend Reducer Test
```typescript
import { describe, it, expect } from 'vitest';
import { chatReducer, initialState } from '../../src/context/chatReducer';

describe('chatReducer', () => {
  it('TEXT_DELTA appends content to last assistant message', () => {
    const stateWithMsg = {
      ...initialState,
      isStreaming: true,
      messages: [{ id: 'msg_1', role: 'assistant', content: 'Hello' }],
    };
    const next = chatReducer(stateWithMsg, {
      type: 'TEXT_DELTA',
      payload: { content: ' world' },
    });
    expect(next.messages[0].content).toBe('Hello world');
  });
});
```

### E2E Test (Playwright)
```typescript
import { test, expect } from '@playwright/test';

test('sends a message and sees streaming response', async ({ page }) => {
  await page.goto('/');
  // Login first
  await page.fill('[name="email"]', 'test@test.com');
  await page.fill('[name="password"]', 'password123');
  await page.click('button[type="submit"]');
  // Send a message
  await page.fill('[data-testid="chat-input"]', 'What is ibuprofen?');
  await page.click('[data-testid="send-button"]');
  // Verify streaming response appears
  await expect(page.locator('[data-testid="assistant-message"]')).toBeVisible({ timeout: 30000 });
  // Verify tool call card appears
  await expect(page.locator('[data-testid="tool-call-card"]')).toBeVisible({ timeout: 30000 });
});
```

## Mock Patterns

### Mock OpenAI Streaming (for agent loop tests)
```typescript
function createMockStream(chunks: any[]) {
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const chunk of chunks) {
        yield chunk;
      }
    },
  };
}

const mockOpenAI = {
  chat: {
    completions: {
      create: vi.fn().mockResolvedValue(
        createMockStream([
          { choices: [{ delta: { content: 'Hello' }, finish_reason: null }] },
          { choices: [{ delta: { content: ' world' }, finish_reason: 'stop' }] },
          { usage: { prompt_tokens: 10, completion_tokens: 5 } },
        ])
      ),
    },
  },
};
```

### Mock SSE Stream (for frontend tests)
```typescript
function createMockSSEResponse(events: Array<{ event: string; data: any }>) {
  const text = events
    .map(e => `event: ${e.event}\ndata: ${JSON.stringify(e.data)}\n\n`)
    .join('');
  return new Response(text, {
    headers: { 'Content-Type': 'text/event-stream' },
  });
}
```
