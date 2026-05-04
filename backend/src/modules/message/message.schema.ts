import { z } from "zod/v4";

export const createMessageSchema = z.object({
  conversationId: z.string().min(1),
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string(),
  reasoning: z.string().optional(),
});

export const createMessageWithToolCallsSchema = z.object({
  conversationId: z.string().min(1),
  role: z.enum(["user", "assistant", "system", "tool"]),
  content: z.string(),
  reasoning: z.string().optional(),
  toolCalls: z.array(
    z.object({
      toolName: z.string(),
      args: z.record(z.string(), z.unknown()),
      result: z.record(z.string(), z.unknown()).optional(),
      status: z.string(),
      durationMs: z.number().optional(),
    }),
  ),
});

export const messageIdSchema = z.object({
  id: z.string().min(1),
});

/** DTO: validated body for creating a single message */
export type CreateMessageDTO = z.infer<typeof createMessageSchema>;

/** DTO: validated body for creating a message with tool calls */
export type CreateMessageWithToolCallsDTO = z.infer<typeof createMessageWithToolCallsSchema>;
