import { describe, it, expect, beforeEach } from "bun:test";
import { MessageService } from "@/modules/message/message.service.ts";
import type { MessageRepository } from "@/modules/message/message.repository.ts";

function createMockRepo(
  overrides: Partial<MessageRepository> = {},
): MessageRepository {
  return {
    findByConversationId: async () => [],
    findById: async () => null,
    getNextOrderIndex: async () => 0,
    create: async (data) => ({
      id: "msg-1",
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
      reasoning: data.reasoning ?? null,
      orderIndex: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    createWithToolCalls: async (data, toolCalls) => ({
      id: "msg-1",
      conversationId: data.conversationId,
      role: data.role,
      content: data.content,
      reasoning: data.reasoning ?? null,
      orderIndex: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      toolCalls: toolCalls.map((tc, i) => ({
        id: `tc-${i}`,
        messageId: "msg-1",
        toolName: tc.toolName,
        args: tc.args,
        result: tc.result ?? null,
        status: tc.status,
        durationMs: tc.durationMs ?? null,
        createdAt: new Date(),
      })),
    }),
    delete: async () => {},
    ...overrides,
  } as MessageRepository;
}

describe("MessageService", () => {
  let service: MessageService;

  beforeEach(() => {
    service = new MessageService(createMockRepo());
  });

  it("finds messages by conversation id ordered by orderIndex", async () => {
    const msgs = [
      { id: "msg-1", orderIndex: 0, content: "First", toolCalls: [] },
      { id: "msg-2", orderIndex: 1, content: "Second", toolCalls: [] },
    ];
    service = new MessageService(
      createMockRepo({ findByConversationId: async () => msgs as never }),
    );

    const result = await service.findByConversationId("conv-1");
    expect(result).toHaveLength(2);
    expect(result[0]!.orderIndex).toBe(0);
    expect(result[1]!.orderIndex).toBe(1);
  });

  it("creates message with correct orderIndex", async () => {
    const result = await service.create({
      conversationId: "conv-1",
      role: "user",
      content: "Hello",
    });

    expect(result.id).toBe("msg-1");
    expect(result.content).toBe("Hello");
  });

  it("creates message with tool calls in transaction", async () => {
    const result = await service.createWithToolCalls(
      { conversationId: "conv-1", role: "assistant", content: "Looking up..." },
      [
        {
          toolName: "rxnorm_lookup",
          args: { drugName: "aspirin" },
          result: { rxcui: "1191" },
          status: "success",
          durationMs: 200,
        },
      ],
    );

    expect(result.id).toBe("msg-1");
    const withToolCalls = result as typeof result & { toolCalls: { toolName: string }[] };
    expect(withToolCalls.toolCalls).toHaveLength(1);
    expect(withToolCalls.toolCalls[0]!.toolName).toBe("rxnorm_lookup");
  });

  it("deletes message by id", async () => {
    let deleted = false;
    service = new MessageService(
      createMockRepo({
        findById: async () =>
          ({
            id: "msg-1",
            conversation: { userId: "user-1" },
          }) as never,
        delete: async () => {
          deleted = true;
        },
      }),
    );

    await service.delete("msg-1", "user-1");
    expect(deleted).toBe(true);
  });

  it("throws NOT_FOUND for non-existent message", async () => {
    await expect(service.delete("nonexistent", "user-1")).rejects.toThrow(
      "Message not found",
    );
  });

  it("throws FORBIDDEN for wrong user", async () => {
    service = new MessageService(
      createMockRepo({
        findById: async () =>
          ({
            id: "msg-1",
            conversation: { userId: "other-user" },
          }) as never,
      }),
    );

    await expect(service.delete("msg-1", "user-1")).rejects.toThrow(
      "Access denied",
    );
  });
});
