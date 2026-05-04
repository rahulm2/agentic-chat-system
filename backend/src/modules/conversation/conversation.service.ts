import { AppError } from "@/common/errors.ts";
import type { ConversationRepository } from "./conversation.repository.ts";

export class ConversationService {
  constructor(private repository: ConversationRepository) {}

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
}
