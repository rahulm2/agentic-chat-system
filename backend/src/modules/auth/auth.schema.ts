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

/** DTO: validated body passed from controller to AuthService.register() */
export type RegisterDTO = z.infer<typeof registerSchema>;

/** DTO: validated body passed from controller to AuthService.login() */
export type LoginDTO = z.infer<typeof loginSchema>;

/** DTO: validated body passed from controller to AuthService.updateProfile() */
export type UpdateProfileDTO = z.infer<typeof updateProfileSchema>;
