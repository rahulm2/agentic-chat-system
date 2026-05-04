# TDD Workflow Skill

## Description
Follow Test-Driven Development for every feature implementation tied to a GitHub issue.

## Workflow
1. **Read the GitHub issue** — understand acceptance criteria and scope
2. **Write failing tests first** (RED phase):
   - Backend: Create `tests/unit/<module>.test.ts` or `tests/integration/<module>.api.test.ts`
   - Frontend: Create `tests/unit/<Component>.test.tsx` or `tests/integration/<hook>.test.ts`
   - Tests should cover all acceptance criteria from the issue
   - Run tests to confirm they fail
3. **Implement the feature** (GREEN phase):
   - Write minimum code to make all tests pass
   - Follow the Module -> Controller -> Service -> Repository pattern for backend
   - Follow the component hierarchy for frontend
4. **Refactor** (REFACTOR phase):
   - Clean up code while keeping tests green
   - Extract shared utilities if needed
   - Ensure no regressions
5. **Commit with issue reference**: `git commit -m "feat: <description> (#<issue-number>)"`

## Test Patterns

### Backend Unit Test
```typescript
import { describe, it, expect, vi } from 'bun:test';

describe('ServiceName', () => {
  it('should do the thing', async () => {
    const mockRepo = { findById: vi.fn().mockResolvedValue({ id: '1' }) };
    const service = new ServiceName(mockRepo as any);
    const result = await service.method('1');
    expect(result).toBeDefined();
  });
});
```

### Backend Integration Test
```typescript
import { describe, it, expect } from 'bun:test';
import app from '../../src/app';

describe('POST /api/chat', () => {
  it('returns SSE stream', async () => {
    const res = await app.request('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer <token>' },
      body: JSON.stringify({ message: 'test' }),
    });
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/event-stream');
  });
});
```

### Frontend Unit Test
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName />);
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });
});
```
