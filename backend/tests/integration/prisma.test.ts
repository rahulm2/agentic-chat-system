import { describe, it, expect, beforeAll, afterAll, afterEach } from "bun:test";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  // Delete in dependency order: leaves first, roots last
  await prisma.toolCall.deleteMany();
  await prisma.usageRecord.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.user.deleteMany();
});

describe("Prisma database integration", () => {
  it("connects to database successfully", async () => {
    await prisma.$connect();
    await prisma.$disconnect();
    await prisma.$connect();
    // If we reach here, the connection succeeded
    expect(true).toBe(true);
  });

  it("creates a user with all fields", async () => {
    const user = await prisma.user.create({
      data: {
        email: "test@example.com",
        name: "Test User",
        passwordHash: "hashed_password_value",
        avatar: "https://example.com/avatar.png",
        preferences: { theme: "dark", language: "en" },
      },
    });

    expect(user.id).toBeDefined();
    expect(user.email).toBe("test@example.com");
    expect(user.name).toBe("Test User");
    expect(user.passwordHash).toBe("hashed_password_value");
    expect(user.avatar).toBe("https://example.com/avatar.png");
    expect(user.preferences).toEqual({ theme: "dark", language: "en" });
    expect(user.createdAt).toBeInstanceOf(Date);
    expect(user.updatedAt).toBeInstanceOf(Date);
  });

  it("creates conversation linked to user", async () => {
    const user = await prisma.user.create({
      data: {
        email: "conv-user@example.com",
        passwordHash: "hashed_password",
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: "Test Conversation",
      },
    });

    expect(conversation.id).toBeDefined();
    expect(conversation.userId).toBe(user.id);
    expect(conversation.title).toBe("Test Conversation");
    expect(conversation.createdAt).toBeInstanceOf(Date);
    expect(conversation.updatedAt).toBeInstanceOf(Date);
  });

  it("creates message with orderIndex", async () => {
    const user = await prisma.user.create({
      data: {
        email: "msg-user@example.com",
        passwordHash: "hashed_password",
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: "Message Test Conversation",
      },
    });

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: "Hello, world!",
        reasoning: "Some reasoning here",
        orderIndex: 0,
      },
    });

    expect(message.id).toBeDefined();
    expect(message.conversationId).toBe(conversation.id);
    expect(message.role).toBe("user");
    expect(message.content).toBe("Hello, world!");
    expect(message.reasoning).toBe("Some reasoning here");
    expect(message.orderIndex).toBe(0);
    expect(message.createdAt).toBeInstanceOf(Date);
    expect(message.updatedAt).toBeInstanceOf(Date);
  });

  it("creates tool call linked to message", async () => {
    const user = await prisma.user.create({
      data: {
        email: "toolcall-user@example.com",
        passwordHash: "hashed_password",
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
      },
    });

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: "I will look up that drug for you.",
        orderIndex: 0,
      },
    });

    const toolCall = await prisma.toolCall.create({
      data: {
        messageId: message.id,
        toolName: "rxnorm_lookup",
        args: { drugName: "aspirin" },
        result: { rxcui: "1191", name: "Aspirin" },
        status: "success",
        durationMs: 342,
      },
    });

    expect(toolCall.id).toBeDefined();
    expect(toolCall.messageId).toBe(message.id);
    expect(toolCall.toolName).toBe("rxnorm_lookup");
    expect(toolCall.args).toEqual({ drugName: "aspirin" });
    expect(toolCall.result).toEqual({ rxcui: "1191", name: "Aspirin" });
    expect(toolCall.status).toBe("success");
    expect(toolCall.durationMs).toBe(342);
    expect(toolCall.createdAt).toBeInstanceOf(Date);
  });

  it("creates usage record with all metrics", async () => {
    const user = await prisma.user.create({
      data: {
        email: "usage-user@example.com",
        passwordHash: "hashed_password",
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
      },
    });

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "assistant",
        content: "Here is the information.",
        orderIndex: 0,
      },
    });

    const usageRecord = await prisma.usageRecord.create({
      data: {
        userId: user.id,
        conversationId: conversation.id,
        messageId: message.id,
        model: "gpt-4o",
        inputTokens: 512,
        outputTokens: 256,
        totalTokens: 768,
        latencyMs: 1240,
        estimatedCost: 0.00384,
      },
    });

    expect(usageRecord.id).toBeDefined();
    expect(usageRecord.userId).toBe(user.id);
    expect(usageRecord.conversationId).toBe(conversation.id);
    expect(usageRecord.messageId).toBe(message.id);
    expect(usageRecord.model).toBe("gpt-4o");
    expect(usageRecord.inputTokens).toBe(512);
    expect(usageRecord.outputTokens).toBe(256);
    expect(usageRecord.totalTokens).toBe(768);
    expect(usageRecord.latencyMs).toBe(1240);
    expect(usageRecord.estimatedCost).toBeCloseTo(0.00384);
    expect(usageRecord.createdAt).toBeInstanceOf(Date);
  });

  it("cascade deletes: deleting user removes conversations, messages, tool calls", async () => {
    const user = await prisma.user.create({
      data: {
        email: "cascade-user@example.com",
        passwordHash: "hashed_password",
      },
    });

    const conversation = await prisma.conversation.create({
      data: {
        userId: user.id,
        title: "Cascade Test",
      },
    });

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        role: "user",
        content: "Will this cascade?",
        orderIndex: 0,
      },
    });

    await prisma.toolCall.create({
      data: {
        messageId: message.id,
        toolName: "test_tool",
        args: {},
        status: "success",
      },
    });

    // Delete the user — should cascade to everything
    await prisma.user.delete({ where: { id: user.id } });

    const conversations = await prisma.conversation.findMany({
      where: { id: conversation.id },
    });
    const messages = await prisma.message.findMany({
      where: { id: message.id },
    });
    const toolCalls = await prisma.toolCall.findMany({
      where: { messageId: message.id },
    });

    expect(conversations).toHaveLength(0);
    expect(messages).toHaveLength(0);
    expect(toolCalls).toHaveLength(0);
  });

  it("enforces unique email constraint", async () => {
    await prisma.user.create({
      data: {
        email: "unique@example.com",
        passwordHash: "hashed_password",
      },
    });

    await expect(
      prisma.user.create({
        data: {
          email: "unique@example.com",
          passwordHash: "another_hash",
        },
      })
    ).rejects.toThrow();
  });
});
