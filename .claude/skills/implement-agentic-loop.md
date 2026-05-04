# Implement Agentic Loop Skill

## Description
Build the multi-step agentic loop using OpenAI SDK with streaming, tool call accumulation, and SSE event emission.

## Architecture
```
User message → Load history → Build messages + tools
→ LOOP (step < MAX_AGENT_STEPS):
    openai.chat.completions.create({ model, messages, tools, stream: true })
    → Process chunks:
        delta.content → emit text-delta SSE
        delta.tool_calls → accumulate args in buffer
        finish_reason "stop" → BREAK
        finish_reason "tool_calls" → execute tools → append results → CONTINUE
→ Return { content, reasoning, toolCalls, usage, model }
```

## Key Implementation: AgentRunner Class
```typescript
// backend/src/agent/agent-loop.ts
import OpenAI from 'openai';
import { ToolExecutor } from './tools/executor';
import { toolDefinitions } from './tools/definitions';
import { SSEWriter } from '../common/types';

interface AgentResult {
  content: string;
  reasoning: string | null;
  toolCalls: Array<{ toolName: string; args: any; result: any; status: string; durationMs: number }>;
  usage: { input: number; output: number };
  model: string;
}

export class AgentRunner {
  constructor(
    private readonly openai: OpenAI,
    private readonly toolExecutor: ToolExecutor,
  ) {}

  async run(
    history: OpenAI.ChatCompletionMessageParam[],
    userMessage: string,
    sseWriter: SSEWriter,
    maxSteps: number = parseInt(process.env.MAX_AGENT_STEPS || '6'),
  ): Promise<AgentResult> {
    const model = process.env.AI_MODEL || 'gpt-4o';
    const messages: OpenAI.ChatCompletionMessageParam[] = [
      ...history,
      { role: 'user', content: userMessage },
    ];

    let step = 0;
    let totalUsage = { input: 0, output: 0 };
    let fullContent = '';
    let allToolCalls: AgentResult['toolCalls'] = [];

    while (step < maxSteps) {
      step++;

      const stream = await this.openai.chat.completions.create({
        model,
        messages,
        tools: toolDefinitions,
        stream: true,
        stream_options: { include_usage: true },
      });

      let assistantContent = '';
      let toolCallBuffers = new Map<number, { id: string; name: string; arguments: string }>();
      let finishReason: string | null = null;

      for await (const chunk of stream) {
        const choice = chunk.choices[0];

        if (!choice) {
          // Final chunk with usage
          if (chunk.usage) {
            totalUsage.input += chunk.usage.prompt_tokens;
            totalUsage.output += chunk.usage.completion_tokens;
          }
          continue;
        }

        const delta = choice.delta;

        // Text content
        if (delta.content) {
          assistantContent += delta.content;
          sseWriter.emit('text-delta', { content: delta.content });
        }

        // Tool call argument chunks
        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            if (!toolCallBuffers.has(tc.index)) {
              toolCallBuffers.set(tc.index, { id: tc.id!, name: tc.function!.name!, arguments: '' });
            }
            const buf = toolCallBuffers.get(tc.index)!;
            if (tc.id) buf.id = tc.id;
            if (tc.function?.name) buf.name = tc.function.name;
            if (tc.function?.arguments) buf.arguments += tc.function.arguments;
          }
        }

        if (choice.finish_reason) finishReason = choice.finish_reason;
      }

      fullContent += assistantContent;

      // Build assistant message for history
      const assistantMessage: any = { role: 'assistant', content: assistantContent || null };
      if (toolCallBuffers.size > 0) {
        assistantMessage.tool_calls = [...toolCallBuffers.values()].map(tc => ({
          id: tc.id, type: 'function' as const,
          function: { name: tc.name, arguments: tc.arguments },
        }));
      }
      messages.push(assistantMessage);

      // Done — no tool calls
      if (finishReason === 'stop' || toolCallBuffers.size === 0) break;

      // Execute tool calls
      for (const [, toolCall] of toolCallBuffers) {
        const args = JSON.parse(toolCall.arguments);
        sseWriter.emit('tool-call-start', { toolCallId: toolCall.id, toolName: toolCall.name, args });

        const startMs = Date.now();
        try {
          const result = await this.toolExecutor.execute(toolCall.name, args);
          const durationMs = Date.now() - startMs;
          sseWriter.emit('tool-call-result', { toolCallId: toolCall.id, result });
          allToolCalls.push({ toolName: toolCall.name, args, result, status: 'completed', durationMs });
          messages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(result) });
        } catch (error: any) {
          const durationMs = Date.now() - startMs;
          const errorResult = { error: error.message };
          sseWriter.emit('tool-call-result', { toolCallId: toolCall.id, result: errorResult, isError: true });
          allToolCalls.push({ toolName: toolCall.name, args, result: errorResult, status: 'error', durationMs });
          messages.push({ role: 'tool', tool_call_id: toolCall.id, content: JSON.stringify(errorResult) });
        }
      }
    }

    return { content: fullContent, reasoning: null, toolCalls: allToolCalls, usage: totalUsage, model };
  }
}
```

## Tool Definitions (OpenAI function calling format)
```typescript
// backend/src/agent/tools/definitions.ts
import OpenAI from 'openai';

export const toolDefinitions: OpenAI.ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'rxnorm_lookup',
      description: 'Look up drug information by name using the RxNorm API. Returns RxCUI identifiers, drug concepts, and dosage forms.',
      parameters: {
        type: 'object',
        properties: {
          drugName: { type: 'string', description: 'Drug name (e.g., "ibuprofen", "metformin")' },
        },
        required: ['drugName'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'openfda_adverse_events',
      description: 'Check FDA adverse event reports for a drug using its RxCUI. Returns reactions, severity, outcomes.',
      parameters: {
        type: 'object',
        properties: {
          rxcui: { type: 'string', description: 'RxCUI identifier (from rxnorm_lookup)' },
          limit: { type: 'number', description: 'Max results (default: 5)' },
        },
        required: ['rxcui'],
      },
    },
  },
];
```

## Tool Implementations
```typescript
// backend/src/agent/tools/rxnorm.ts
export async function rxnormLookup(drugName: string) {
  const url = `https://rxnav.nlm.nih.gov/REST/drugs.json?name=${encodeURIComponent(drugName)}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) throw new Error(`RxNorm API error: ${res.status}`);
  const data = await res.json();
  if (!data.drugGroup?.conceptGroup) throw new Error(`Drug not found: ${drugName}`);
  const concepts = data.drugGroup.conceptGroup
    .flatMap((g: any) => g.conceptProperties || [])
    .map((c: any) => ({ rxcui: c.rxcui, name: c.name, tty: c.tty }));
  return { drugName, concepts: concepts.slice(0, 10) };
}

// backend/src/agent/tools/openfda.ts
export async function openfdaAdverseEvents(rxcui: string, limit = 5) {
  const url = `https://api.fda.gov/drug/event.json?search=openfda.rxcui:${rxcui}&limit=${limit}`;
  const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
  if (!res.ok) {
    if (res.status === 404) return { rxcui, events: [], message: 'No adverse events found' };
    throw new Error(`openFDA API error: ${res.status}`);
  }
  const data = await res.json();
  const events = (data.results || []).map((r: any) => ({
    reactions: r.patient?.reaction?.map((rx: any) => rx.reactionmeddrapt) || [],
    serious: r.serious,
    outcomes: r.patient?.patientdeath ? 'death' : r.patient?.patientonsetage ? 'hospitalization' : 'other',
  }));
  return { rxcui, events };
}

// backend/src/agent/tools/executor.ts
export class ToolExecutor {
  async execute(toolName: string, args: Record<string, any>): Promise<any> {
    switch (toolName) {
      case 'rxnorm_lookup': return rxnormLookup(args.drugName);
      case 'openfda_adverse_events': return openfdaAdverseEvents(args.rxcui, args.limit);
      default: throw new Error(`Unknown tool: ${toolName}`);
    }
  }
}
```

## SSEWriter Interface
```typescript
// backend/src/common/types.ts
export interface SSEWriter {
  emit(event: string, data: Record<string, any>): void | Promise<void>;
}
```

## Testing the Agentic Loop
Mock the OpenAI client to return pre-built chunk sequences:
```typescript
function mockStreamChunks(chunks: any[]) {
  return {
    [Symbol.asyncIterator]: async function* () {
      for (const chunk of chunks) yield chunk;
    },
  };
}

// Text-only response
const textOnlyChunks = [
  { choices: [{ delta: { content: 'Hello' }, finish_reason: null }] },
  { choices: [{ delta: { content: ' world' }, finish_reason: 'stop' }] },
  { choices: [], usage: { prompt_tokens: 10, completion_tokens: 5 } },
];

// Response with tool call
const toolCallChunks = [
  { choices: [{ delta: { tool_calls: [{ index: 0, id: 'tc_1', function: { name: 'rxnorm_lookup', arguments: '{"drug' } }] }, finish_reason: null }] },
  { choices: [{ delta: { tool_calls: [{ index: 0, function: { arguments: 'Name":"ibuprofen"}' } }] }, finish_reason: 'tool_calls' }] },
  { choices: [], usage: { prompt_tokens: 20, completion_tokens: 10 } },
];
```
