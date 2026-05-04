import { z } from "zod/v4";

export const ttsRequestSchema = z.object({
  text: z.string().min(1).max(4096),
  messageId: z.string().optional(),
});

/** DTO: validated body passed from controller to TtsService.synthesize() */
export type TtsRequestDTO = z.infer<typeof ttsRequestSchema>;
