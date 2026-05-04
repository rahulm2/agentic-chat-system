import { describe, it, expect } from 'vitest';
import { parseSSEEvents, parseSSEData } from '../../../src/utils/sse-parser';

describe('parseSSEEvents', () => {
  it('parses single event', () => {
    const chunk = 'event: text-delta\ndata: {"content":"Hello"}\n\n';
    const events = parseSSEEvents(chunk);

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      event: 'text-delta',
      data: '{"content":"Hello"}',
    });
  });

  it('parses multiple events', () => {
    const chunk = [
      'event: stream-start',
      'data: {"conversationId":"c1","messageId":"m1"}',
      '',
      'event: text-delta',
      'data: {"content":"Hi"}',
      '',
    ].join('\n');

    const events = parseSSEEvents(chunk);

    expect(events).toHaveLength(2);
    expect(events[0]!.event).toBe('stream-start');
    expect(events[0]!.data).toBe('{"conversationId":"c1","messageId":"m1"}');
    expect(events[1]!.event).toBe('text-delta');
    expect(events[1]!.data).toBe('{"content":"Hi"}');
  });

  it('handles chunk without trailing newline', () => {
    const chunk = 'event: done\ndata: {}';
    const events = parseSSEEvents(chunk);

    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({
      event: 'done',
      data: '{}',
    });
  });

  it('ignores empty lines', () => {
    const chunk = '\n\nevent: text-delta\ndata: {"content":"test"}\n\n\n';
    const events = parseSSEEvents(chunk);

    expect(events).toHaveLength(1);
    expect(events[0]!.event).toBe('text-delta');
    expect(events[0]!.data).toBe('{"content":"test"}');
  });

  it('handles event with empty data', () => {
    const chunk = 'event: done\ndata: \n\n';
    const events = parseSSEEvents(chunk);

    expect(events).toHaveLength(1);
    expect(events[0]!.event).toBe('done');
    expect(events[0]!.data).toBe('');
  });
});

describe('parseSSEData', () => {
  it('parses valid JSON', () => {
    const result = parseSSEData<{ content: string }>('{"content":"Hello"}');

    expect(result).toEqual({ content: 'Hello' });
  });

  it('returns null for invalid JSON', () => {
    const result = parseSSEData('{invalid json}');

    expect(result).toBeNull();
  });

  it('returns null for empty string', () => {
    const result = parseSSEData('');

    expect(result).toBeNull();
  });

  it('parses nested objects', () => {
    const data = '{"tool":{"name":"rxnorm","args":{"drug":"aspirin"}},"status":"ok"}';
    const result = parseSSEData<{
      tool: { name: string; args: { drug: string } };
      status: string;
    }>(data);

    expect(result).toEqual({
      tool: { name: 'rxnorm', args: { drug: 'aspirin' } },
      status: 'ok',
    });
  });
});
