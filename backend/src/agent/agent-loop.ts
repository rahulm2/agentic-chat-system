import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import type { SSEWriter } from "@/common/types.ts";
import { TOOL_DEFINITIONS } from "./tools/definitions.ts";
import type { ToolExecutor } from "./tools/executor.ts";

const SYSTEM_PROMPT = `You are a helpful healthcare assistant. You can look up drug information using RxNorm and check adverse event reports using openFDA.

When a user asks about a drug:
1. First use rxnorm_lookup to find the drug's RxCUI identifier
2. Then use openfda_adverse_events with that RxCUI to find adverse event reports

Always provide clear, well-organized responses. Include disclaimers that users should consult healthcare professionals for medical advice.`;

export interface AgentLoopConfig {
  model: string;
  maxSteps: number;
  timeoutMs: number;
}

export interface AgentResult {
  content: string;
  toolCalls: ToolCallRecord[];
  inputTokens: number;
  outputTokens: number;
}

export interface ToolCallRecord {
  toolName: string;
  args: Record<string, unknown>;
  result: Record<string, unknown>;
  status: string;
  durationMs: number;
}

export async function runAgentLoop(
  openai: OpenAI,
  history: ChatCompletionMessageParam[],
  toolExecutor: ToolExecutor,
  config: AgentLoopConfig,
  writer: SSEWriter,
): Promise<AgentResult> {
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history,
  ];

  let steps = 0;
  let totalInputTokens = 0;
  let totalOutputTokens = 0;
  let assistantContent = "";
  const allToolCalls: ToolCallRecord[] = [];

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), config.timeoutMs);

  try {
    while (steps < config.maxSteps) {
      steps++;

      const stream = await openai.chat.completions.create(
        {
          model: config.model,
          messages,
          tools: TOOL_DEFINITIONS,
          stream: true,
          stream_options: { include_usage: true },
        },
        { signal: controller.signal },
      );

      let finishReason: string | null = null;
      const toolCallBuffers = new Map<
        number,
        { id: string; name: string; arguments: string }
      >();
      let currentContent = "";

      for await (const chunk of stream) {
        const choice = chunk.choices?.[0];

        if (choice?.delta?.content) {
          currentContent += choice.delta.content;
          await writer.writeSSE("text-delta", {
            content: choice.delta.content,
          });
        }

        if (choice?.delta?.tool_calls) {
          for (const tc of choice.delta.tool_calls) {
            if (!toolCallBuffers.has(tc.index)) {
              toolCallBuffers.set(tc.index, {
                id: tc.id ?? "",
                name: tc.function?.name ?? "",
                arguments: "",
              });
            }
            const buffer = toolCallBuffers.get(tc.index)!;
            if (tc.id) buffer.id = tc.id;
            if (tc.function?.name) buffer.name = tc.function.name;
            if (tc.function?.arguments)
              buffer.arguments += tc.function.arguments;
          }
        }

        if (choice?.finish_reason) {
          finishReason = choice.finish_reason;
        }

        if (chunk.usage) {
          totalInputTokens += chunk.usage.prompt_tokens;
          totalOutputTokens += chunk.usage.completion_tokens;
        }
      }

      assistantContent += currentContent;

      if (finishReason === "stop") {
        messages.push({ role: "assistant", content: currentContent });
        break;
      }

      if (finishReason === "tool_calls" && toolCallBuffers.size > 0) {
        const pendingCalls = Array.from(toolCallBuffers.values()).map((tc) => ({
          ...tc,
          parsedArgs: JSON.parse(tc.arguments) as Record<string, unknown>,
        }));

        messages.push({
          role: "assistant",
          content: currentContent || null,
          tool_calls: pendingCalls.map((tc) => ({
            id: tc.id,
            type: "function" as const,
            function: { name: tc.name, arguments: tc.arguments },
          })),
        });

        // Emit start events
        for (const tc of pendingCalls) {
          await writer.writeSSE("tool-call-start", {
            toolCallId: tc.id,
            toolName: tc.name,
            args: tc.parsedArgs,
          });
        }

        // Execute tools in parallel
        const settled = await Promise.allSettled(
          pendingCalls.map(async (tc) => {
            const toolStart = Date.now();
            const result = await toolExecutor.execute(tc.name, tc.parsedArgs);
            const durationMs = Date.now() - toolStart;
            return { id: tc.id, toolName: tc.name, args: tc.parsedArgs, result, durationMs };
          }),
        );

        // Emit results and append to messages
        for (const entry of settled) {
          if (entry.status === "fulfilled") {
            const { id, toolName, args, result, durationMs } = entry.value;
            const isError = "error" in result;

            await writer.writeSSE("tool-call-result", {
              toolCallId: id,
              result,
              isError,
            });

            allToolCalls.push({ toolName, args, result, status: isError ? "error" : "success", durationMs });
            messages.push({ role: "tool", tool_call_id: id, content: JSON.stringify(result) });
          } else {
            const idx = settled.indexOf(entry);
            const tc = pendingCalls[idx]!;

            await writer.writeSSE("tool-call-result", {
              toolCallId: tc.id,
              result: { error: String(entry.reason) },
              isError: true,
            });

            allToolCalls.push({ toolName: tc.name, args: tc.parsedArgs, result: { error: String(entry.reason) }, status: "error", durationMs: 0 });
            messages.push({ role: "tool", tool_call_id: tc.id, content: JSON.stringify({ error: String(entry.reason) }) });
          }
        }

        continue;
      }

      break;
    }
  } catch (err: unknown) {
    if (controller.signal.aborted) {
      await writer.writeSSE("error", { message: "AI request timed out", code: "AI_TIMEOUT" });
    } else {
      await writer.writeSSE("error", {
        message: err instanceof Error ? err.message : "Agent loop error",
        code: "AGENT_ERROR",
      });
    }
  } finally {
    clearTimeout(timeout);
  }

  return {
    content: assistantContent,
    toolCalls: allToolCalls,
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
  };
}
