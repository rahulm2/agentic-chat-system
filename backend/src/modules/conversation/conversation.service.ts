import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";
import { AppError } from "@/common/errors.ts";
import type { SSEWriter } from "@/common/types.ts";
import type { MessageService } from "@/modules/message/message.service.ts";
import { AgentRunner } from "@/agent/agent-loop.ts";
import type { AgentConfig } from "@/agent/agent-loop.ts";
import type { ConversationRepository } from "./conversation.repository.ts";
import type { ChatRequest } from "./conversation.schema.ts";

export interface ConversationServiceConfig {
  openaiApiKey: string;
  model: string;
  maxSteps: number;
  timeoutMs: number;
}

export class ConversationService {
  private agentRunner: AgentRunner;
  private openai: OpenAI;

  constructor(
    private repository: ConversationRepository,
    private messageService: MessageService,
    config: ConversationServiceConfig,
  ) {
    this.openai = new OpenAI({ apiKey: config.openaiApiKey });
    this.agentRunner = new AgentRunner(this.openai, {
      model: config.model,
      maxSteps: config.maxSteps,
      timeoutMs: config.timeoutMs,
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

  private async generateTitle(userMessage: string): Promise<string> {
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Generate a short conversation title (max 6 words) for the following user message. " +
              "Return ONLY the title, no quotes, no punctuation at the end.",
          },
          { role: "user", content: userMessage },
        ],
        max_tokens: 20,
        temperature: 0.7,
      });
      return response.choices[0]?.message?.content?.trim() || "New conversation";
    } catch {
      return "New conversation";
    }
  }

  async handleChat(
    userId: string,
    request: ChatRequest,
    writer: SSEWriter,
  ): Promise<void> {
    // Get or create conversation
    let conversationId = request.conversationId;
    const isNewConversation = !conversationId;
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

    // Generate title for new conversations (fire-and-forget, don't block streaming)
    if (isNewConversation) {
      this.generateTitle(request.message).then((title) =>
        this.repository.updateTitle(conversationId!, title),
      );
    }

    // Build history for the agent
    const history = await this.messageService.findByConversationId(conversationId);
    const messages: ChatCompletionMessageParam[] = history.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content ?? "",
    }));

    // Run agent — handles streaming, tool calls, metadata, and done events
    const agentResult = await this.agentRunner.run(messages, writer, {
      conversationId,
      messageId: userMessage.id,
    });

    // Persist assistant message
    if (agentResult.content) {
      if (agentResult.toolCalls.length > 0) {
        await this.messageService.createWithToolCalls(
          {
            conversationId,
            role: "assistant",
            content: agentResult.content,
            reasoning: agentResult.reasoning || undefined,
          },
          agentResult.toolCalls.map((tc) => ({
            toolName: tc.toolName,
            args: tc.args,
            result: tc.result as Record<string, unknown>,
            status: tc.isError ? "error" : "success",
            durationMs: tc.durationMs,
          })),
        );
      } else {
        await this.messageService.create({
          conversationId,
          role: "assistant",
          content: agentResult.content,
          reasoning: agentResult.reasoning || undefined,
        });
      }
    }

    writer.close();
  }
}
