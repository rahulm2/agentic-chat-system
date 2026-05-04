import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { AppError } from "@/common/errors.ts";
import type { SSEWriter } from "@/common/types.ts";
import type { MessageService } from "@/modules/message/message.service.ts";
import { runAgentLoop } from "@/agent/agent-loop.ts";
import { ToolExecutor } from "@/agent/tools/executor.ts";
import type { ConversationRepository } from "./conversation.repository.ts";
import type { ChatRequest } from "./conversation.schema.ts";

export interface AgentConfig {
  openaiApiKey: string;
  model: string;
  maxSteps: number;
  timeoutMs: number;
  openfdaApiKey?: string;
}

const COST_RATES: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 2.5 / 1_000_000, output: 10 / 1_000_000 },
  "gpt-4o-mini": { input: 0.15 / 1_000_000, output: 0.6 / 1_000_000 },
};

export class ConversationService {
  private openai: OpenAI;
  private toolExecutor: ToolExecutor;

  constructor(
    private repository: ConversationRepository,
    private messageService: MessageService,
    private config: AgentConfig,
  ) {
    this.openai = new OpenAI({ apiKey: config.openaiApiKey });
    this.toolExecutor = new ToolExecutor({
      openfdaApiKey: config.openfdaApiKey,
    });
  }

  async list(userId: string, limit: number, offset: number) {
    return this.repository.findByUserId(userId, limit, offset);
  }

  async getById(id: string, userId: string) {
    const conversation = await this.repository.findById(id);
    if (!conversation) {
      throw new AppError("Conversation not found", "NOT_FOUND", 404);
    }
    if (conversation.userId !== userId) {
      throw new AppError("Access denied", "FORBIDDEN", 403);
    }
    return conversation;
  }

  async create(userId: string, title?: string) {
    return this.repository.create({ userId, title });
  }

  async delete(id: string, userId: string) {
    const conversation = await this.repository.findById(id);
    if (!conversation) {
      throw new AppError("Conversation not found", "NOT_FOUND", 404);
    }
    if (conversation.userId !== userId) {
      throw new AppError("Access denied", "FORBIDDEN", 403);
    }
    await this.repository.delete(id);
  }

  async handleChat(
    userId: string,
    request: ChatRequest,
    writer: SSEWriter,
  ): Promise<void> {
    const startTime = Date.now();

    // Get or create conversation
    let conversationId = request.conversationId;
    if (!conversationId) {
      const conversation = await this.create(userId);
      conversationId = conversation.id;
    }

    // Save user message
    const userMessage = await this.messageService.create({
      conversationId,
      role: "user",
      content: request.message,
    });

    // Build history for the agent
    const history = await this.messageService.findByConversationId(conversationId);
    const messages: ChatCompletionMessageParam[] = history.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content ?? "",
    }));

    await writer.writeSSE("stream-start", {
      conversationId,
      messageId: userMessage.id,
    });

    // Run agent loop — writes SSE events directly to the client
    const agentResult = await runAgentLoop(
      this.openai,
      messages,
      this.toolExecutor,
      {
        model: this.config.model,
        maxSteps: this.config.maxSteps,
        timeoutMs: this.config.timeoutMs,
      },
      writer,
    );

    // Persist assistant message
    if (agentResult.content) {
      if (agentResult.toolCalls.length > 0) {
        await this.messageService.createWithToolCalls(
          { conversationId, role: "assistant", content: agentResult.content },
          agentResult.toolCalls,
        );
      } else {
        await this.messageService.create({
          conversationId,
          role: "assistant",
          content: agentResult.content,
        });
      }
    }

    // Emit metadata + done
    const latencyMs = Date.now() - startTime;
    const rate = COST_RATES[this.config.model] ?? COST_RATES["gpt-4o"]!;
    const estimatedCost =
      agentResult.inputTokens * rate!.input +
      agentResult.outputTokens * rate!.output;

    await writer.writeSSE("metadata", {
      model: this.config.model,
      inputTokens: agentResult.inputTokens,
      outputTokens: agentResult.outputTokens,
      latencyMs,
      estimatedCost,
    });

    await writer.writeSSE("done", {});
    writer.close();
  }
}
