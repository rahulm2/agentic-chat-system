import type { PrismaClient, Conversation } from "@prisma/client";

export class ConversationRepository {
  constructor(private prisma: PrismaClient) {}

  async findByUserId(
    userId: string,
    limit: number,
    offset: number,
  ): Promise<{ conversations: (Conversation & { _count: { messages: number } })[]; total: number }> {
    const [conversations, total] = await Promise.all([
      this.prisma.conversation.findMany({
        where: { userId },
        orderBy: { updatedAt: "desc" },
        skip: offset,
        take: limit,
        include: { _count: { select: { messages: true } } },
      }),
      this.prisma.conversation.count({ where: { userId } }),
    ]);
    return { conversations, total };
  }

  async findById(id: string) {
    return this.prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { orderIndex: "asc" },
          include: { toolCalls: true },
        },
      },
    });
  }

  async create(data: { userId: string; title?: string }): Promise<Conversation> {
    return this.prisma.conversation.create({ data });
  }

  async updateTitle(id: string, title: string): Promise<Conversation> {
    return this.prisma.conversation.update({
      where: { id },
      data: { title },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.conversation.delete({ where: { id } });
  }
}
