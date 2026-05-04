import { z } from "zod/v4";

export const listConversationsSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

export const conversationIdSchema = z.object({
  id: z.string().min(1),
});

export const chatRequestSchema = z.object({
  message: z.string().min(1).max(10000),
  conversationId: z.string().min(1).optional(),
});

/** DTO: validated query params for listing conversations */
export type ListConversationsDTO = z.infer<typeof listConversationsSchema>;

/** DTO: validated body passed from controller to ConversationService.handleChat() */
export type ChatRequestDTO = z.infer<typeof chatRequestSchema>;
