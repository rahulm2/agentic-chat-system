import { z } from "zod/v4";

export const ttsRequestSchema = z.object({
  text: z.string().min(1).max(4096),
  messageId: z.string().optional(),
});

export type TtsRequestInput = z.infer<typeof ttsRequestSchema>;
