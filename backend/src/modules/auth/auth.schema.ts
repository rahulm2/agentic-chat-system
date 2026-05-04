import { z } from "zod/v4";

export const registerSchema = z.object({
  email: z.email(),
  password: z.string().min(8),
  name: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const updateProfileSchema = z.object({
  name: z.string().optional(),
  avatar: z.string().url().optional(),
  preferences: z.record(z.string(), z.unknown()).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
