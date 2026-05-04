import type OpenAI from "openai";
import type {
  ChatCompletionMessageParam,
  ChatCompletionChunk,
} from "openai/resources/chat/completions";
import { AppError } from "@/common/errors.ts";
import type { SSEWriter } from "@/common/types.ts";
import { toolDefinitions } from "./tools/definitions.ts";
import { executeTool } from "./tools/executor.ts";

export interface AgentConfig {
  model: string;
  maxSteps: number;
  timeoutMs: number;
}

export interface AgentToolCall {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  result: unknown;
  isError: boolean;
  durationMs: number;
}

export interface AgentResult {
  content: string;
  reasoning: string;
  toolCalls: AgentToolCall[];
  usage: { inputTokens: number; outputTokens: number; totalTokens: number };
  model: string;
}

interface ToolCallBuffer {
  id: string;
  name: string;
  arguments: string;
}

export class AgentRunner {
  constructor(
    private openai: OpenAI,
    private config: AgentConfig,
  ) {}

  private static readonly SYSTEM_PROMPT: ChatCompletionMessageParam = {
    role: "system",
    content:
      "You are a helpful healthcare assistant. " +
      "Only call the rxnorm_lookup or openfda_adverse_events tools when the user explicitly asks about a specific medication, drug interactions, dosages, or adverse effects. " +
      "For greetings, general questions, follow-ups, or any non-medication topic, respond conversationally without calling any tools.",
  };

  async run(
    messages: ChatCompletionMessageParam[],
    writer: SSEWriter,
    meta: { conversationId: string; messageId: string },
  ): Promise<AgentResult> {
    await writer.writeSSE("stream-start", {
      conversationId: meta.conversationId,
      messageId: meta.messageId,
    });

    const allToolCalls: AgentToolCall[] = [];
    let totalInputTokens = 0;
    let totalOutputTokens = 0;
    let finalContent = "";
    let finalReasoning = "";
    const startTime = performance.now();

    const abortController = new AbortController();
    const timeout = setTimeout(
      () => abortController.abort(),
      this.config.timeoutMs,
    );

    try {
      for (let step = 0; step < this.config.maxSteps; step++) {
        const { content, reasoning, toolCallBuffers, usage, finishReason } =
          await this.streamStep(messages, writer, abortController.signal);

        totalInputTokens += usage.inputTokens;
        totalOutputTokens += usage.outputTokens;

        if (reasoning) {
          finalReasoning += (finalReasoning ? "\n" : "") + reasoning;
        }

        if (finishReason === "stop" || toolCallBuffers.length === 0) {
          finalContent = content;
          break;
        }

        // Execute tool calls
        const assistantMessage: ChatCompletionMessageParam = {
          role: "assistant" as const,
          content: content || null,
          tool_calls: toolCallBuffers.map((tc) => ({
            id: tc.id,
            type: "function" as const,
            function: { name: tc.name, arguments: tc.arguments },
          })),
        };
        messages.push(assistantMessage);

        const toolResults = await this.executeToolCalls(
          toolCallBuffers,
          writer,
        );
        allToolCalls.push(...toolResults);

        for (const result of toolResults) {
          messages.push({
            role: "tool" as const,
            tool_call_id: result.toolCallId,
            content: JSON.stringify(result.result),
          });
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") {
        const timeoutError = new AppError(
          "AI request timed out",
          "AI_TIMEOUT",
          504,
        );
        await writer.writeSSE("error", {
          message: timeoutError.message,
          code: timeoutError.code,
        });
        throw timeoutError;
      }
      throw err;
    } finally {
      clearTimeout(timeout);
    }

    const latencyMs = Math.round(performance.now() - startTime);

    await writer.writeSSE("metadata", {
      model: this.config.model,
      inputTokens: totalInputTokens,
      outputTokens: totalOutputTokens,
      latencyMs,
      estimatedCost: this.estimateCost(
        this.config.model,
        totalInputTokens,
        totalOutputTokens,
      ),
    });
    await writer.writeSSE("done", {});

    return {
      content: finalContent,
      reasoning: finalReasoning,
      toolCalls: allToolCalls,
      usage: {
        inputTokens: totalInputTokens,
        outputTokens: totalOutputTokens,
        totalTokens: totalInputTokens + totalOutputTokens,
      },
      model: this.config.model,
    };
  }

  private async streamStep(
    messages: ChatCompletionMessageParam[],
    writer: SSEWriter,
    signal: AbortSignal,
  ) {
    const stream = await this.openai.chat.completions.create(
      {
        model: this.config.model,
        messages: [AgentRunner.SYSTEM_PROMPT, ...messages],
        tools: toolDefinitions,
        stream: true,
        stream_options: { include_usage: true },
      },
      { signal },
    );

    let content = "";
    let reasoning = "";
    const toolCallBuffers = new Map<number, ToolCallBuffer>();
    let finishReason = "";
    let inputTokens = 0;
    let outputTokens = 0;

    for await (const chunk of stream) {
      const choice = chunk.choices[0];

      if (choice) {
        const delta = choice.delta;

        if (delta.content) {
          content += delta.content;
          await writer.writeSSE("text-delta", { content: delta.content });
        }

        // Handle reasoning (if model supports it)
        const deltaAny = delta as Record<string, unknown>;
        if (typeof deltaAny["reasoning"] === "string" && deltaAny["reasoning"]) {
          reasoning += deltaAny["reasoning"];
          await writer.writeSSE("reasoning", {
            content: deltaAny["reasoning"],
          });
        }

        // Accumulate tool call chunks
        if (delta.tool_calls) {
          for (const tc of delta.tool_calls) {
            const existing = toolCallBuffers.get(tc.index);
            if (existing) {
              existing.arguments += tc.function?.arguments ?? "";
            } else {
              toolCallBuffers.set(tc.index, {
                id: tc.id ?? "",
                name: tc.function?.name ?? "",
                arguments: tc.function?.arguments ?? "",
              });
            }
          }
        }

        if (choice.finish_reason) {
          finishReason = choice.finish_reason;
        }
      }

      // Usage comes in the final chunk (choices is empty)
      if (chunk.usage) {
        inputTokens = chunk.usage.prompt_tokens;
        outputTokens = chunk.usage.completion_tokens;
      }
    }

    return {
      content,
      reasoning,
      toolCallBuffers: Array.from(toolCallBuffers.values()),
      usage: { inputTokens, outputTokens },
      finishReason,
    };
  }

  private async executeToolCalls(
    buffers: ToolCallBuffer[],
    writer: SSEWriter,
  ): Promise<AgentToolCall[]> {
    const results: AgentToolCall[] = [];

    // Execute all tool calls in parallel (OpenAI may return multiple)
    const executions = buffers.map(async (buffer) => {
      let args: Record<string, unknown>;
      try {
        args = JSON.parse(buffer.arguments) as Record<string, unknown>;
      } catch {
        args = {};
      }

      await writer.writeSSE("tool-call-start", {
        toolCallId: buffer.id,
        toolName: buffer.name,
        args,
      });

      const result = await executeTool(buffer.name, args);

      await writer.writeSSE("tool-call-result", {
        toolCallId: buffer.id,
        result: result.result,
        isError: result.isError,
      });

      return {
        toolCallId: buffer.id,
        toolName: buffer.name,
        args,
        result: result.result,
        isError: result.isError,
        durationMs: result.durationMs,
      };
    });

    const settled = await Promise.allSettled(executions);
    for (const outcome of settled) {
      if (outcome.status === "fulfilled") {
        results.push(outcome.value);
      } else {
        // Feed errors back — executeTool already catches, but just in case
        results.push({
          toolCallId: "unknown",
          toolName: "unknown",
          args: {},
          result: { error: outcome.reason?.message ?? "Tool execution failed" },
          isError: true,
          durationMs: 0,
        });
      }
    }

    return results;
  }

  private estimateCost(
    model: string,
    inputTokens: number,
    outputTokens: number,
  ): number {
    const rates: Record<string, { input: number; output: number }> = {
      "gpt-4o": { input: 2.5 / 1_000_000, output: 10 / 1_000_000 },
      "gpt-4o-mini": { input: 0.15 / 1_000_000, output: 0.6 / 1_000_000 },
    };
    const rate = rates[model] ?? rates["gpt-4o"]!;
    return inputTokens * rate.input + outputTokens * rate.output;
  }
}
