import { describe, it, expect, beforeEach } from "bun:test";
import { ConversationService } from "@/modules/conversation/conversation.service.ts";
import type { ConversationRepository } from "@/modules/conversation/conversation.repository.ts";
import type { MessageService } from "@/modules/message/message.service.ts";
import type { ConversationServiceConfig } from "@/modules/conversation/conversation.service.ts";

const mockMessageService = {} as MessageService;
const mockConfig: ConversationServiceConfig = {
  openaiApiKey: "test-key",
  model: "gpt-4o",
  maxSteps: 6,
  timeoutMs: 30000,
};

function createMockRepo(
  overrides: Partial<ConversationRepository> = {},
): ConversationRepository {
  return {
    findByUserId: async () => ({ conversations: [], total: 0 }),
    findById: async () => null,
    create: async (data) => ({
      id: "conv-1",
      userId: data.userId,
      title: data.title ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    delete: async () => {},
    ...overrides,
  } as ConversationRepository;
}

function createService(repo: ConversationRepository): ConversationService {
  return new ConversationService(repo, mockMessageService, mockConfig);
}

describe("ConversationService", () => {
  let service: ConversationService;

  beforeEach(() => {
    service = createService(createMockRepo());
  });

  it("lists conversations for user", async () => {
    const mockConvs = [
      {
        id: "conv-1",
        userId: "user-1",
        title: "Test",
        createdAt: new Date(),
        updatedAt: new Date(),
        _count: { messages: 3 },
      },
    ];
    service = createService(createMockRepo({
      findByUserId: async () => ({ conversations: mockConvs as never, total: 1 }),
    }));

    const result = await service.list("user-1", 20, 0);
    expect(result.conversations).toHaveLength(1);
    expect(result.total).toBe(1);
  });

  it("returns conversation with messages by id", async () => {
    const conv = {
      id: "conv-1",
      userId: "user-1",
      title: "Test",
      createdAt: new Date(),
      updatedAt: new Date(),
      messages: [{ id: "msg-1", content: "Hello", orderIndex: 0, toolCalls: [] }],
    };
    service = createService(createMockRepo({
      findById: async () => conv as never,
    }));

    const result = await service.getById("conv-1", "user-1");
    expect(result.id).toBe("conv-1");
    expect(result.messages).toHaveLength(1);
  });

  it("creates new conversation", async () => {
    const result = await service.create("user-1", "New Chat");
    expect(result.id).toBe("conv-1");
    expect(result.userId).toBe("user-1");
  });

  it("deletes conversation", async () => {
    let deleted = false;
    service = createService(createMockRepo({
      findById: async () =>
        ({
          id: "conv-1",
          userId: "user-1",
          title: "Test",
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [],
        }) as never,
      delete: async () => {
        deleted = true;
      },
    }));

    await service.delete("conv-1", "user-1");
    expect(deleted).toBe(true);
  });

  it("throws NOT_FOUND for non-existent conversation", async () => {
    await expect(service.getById("nonexistent", "user-1")).rejects.toThrow(
      "Conversation not found",
    );
  });

  it("throws FORBIDDEN for wrong user", async () => {
    service = createService(createMockRepo({
      findById: async () =>
        ({
          id: "conv-1",
          userId: "other-user",
          title: "Test",
          createdAt: new Date(),
          updatedAt: new Date(),
          messages: [],
        }) as never,
    }));

    await expect(service.getById("conv-1", "user-1")).rejects.toThrow(
      "Access denied",
    );
  });
});
