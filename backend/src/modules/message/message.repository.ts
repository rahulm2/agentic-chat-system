import type { PrismaClient, Message, Prisma } from "@prisma/client";

/** DAO: data shape the repository accepts to create a message row */
export interface CreateMessageDAO {
  conversationId: string;
  role: string;
  content: string;
  reasoning?: string;
}

/** DAO: data shape the repository accepts for each tool call row */
export interface ToolCallDAO {
  toolName: string;
  args: Record<string, unknown>;
  result?: Record<string, unknown>;
  status: string;
  durationMs?: number;
}

export class MessageRepository {
  constructor(private prisma: PrismaClient) {}

  async findByConversationId(conversationId: string) {
    return this.prisma.message.findMany({
      where: { conversationId },
      orderBy: { orderIndex: "asc" },
      include: { toolCalls: true },
    });
  }

  async findById(id: string) {
    return this.prisma.message.findUnique({
      where: { id },
      include: { toolCalls: true, conversation: true },
    });
  }

  async getNextOrderIndex(conversationId: string): Promise<number> {
    const last = await this.prisma.message.findFirst({
      where: { conversationId },
      orderBy: { orderIndex: "desc" },
      select: { orderIndex: true },
    });
    return last ? last.orderIndex + 1 : 0;
  }

  async create(dao: CreateMessageDAO): Promise<Message> {
    const orderIndex = await this.getNextOrderIndex(dao.conversationId);
    return this.prisma.message.create({
      data: { ...dao, orderIndex },
    });
  }

  async createWithToolCalls(
    dao: CreateMessageDAO,
    toolCalls: ToolCallDAO[],
  ) {
    const orderIndex = await this.getNextOrderIndex(dao.conversationId);
    return this.prisma.message.create({
      data: {
        ...dao,
        orderIndex,
        toolCalls: {
          create: toolCalls.map((tc) => ({
            toolName: tc.toolName,
            args: tc.args as Prisma.InputJsonValue,
            result: tc.result as Prisma.InputJsonValue | undefined,
            status: tc.status,
            durationMs: tc.durationMs,
          })),
        },
      },
      include: { toolCalls: true },
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.message.delete({ where: { id } });
  }
}
