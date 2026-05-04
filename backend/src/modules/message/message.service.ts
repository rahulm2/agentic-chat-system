import { AppError } from "@/common/errors.ts";
import type { MessageRepository, CreateMessageDAO, ToolCallDAO } from "./message.repository.ts";

export class MessageService {
  constructor(private repository: MessageRepository) {}

  async findByConversationId(conversationId: string) {
    return this.repository.findByConversationId(conversationId);
  }

  async create(dao: CreateMessageDAO) {
    return this.repository.create(dao);
  }

  async createWithToolCalls(dao: CreateMessageDAO, toolCalls: ToolCallDAO[]) {
    return this.repository.createWithToolCalls(dao, toolCalls);
  }

  async delete(id: string, userId: string) {
    const message = await this.repository.findById(id);
    if (!message) {
      throw new AppError("Message not found", "NOT_FOUND", 404);
    }
    if (message.conversation.userId !== userId) {
      throw new AppError("Access denied", "FORBIDDEN", 403);
    }
    await this.repository.delete(id);
  }
}
