import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import { AuthRepository } from "@/modules/auth/auth.repository.ts";
import { AuthService } from "@/modules/auth/auth.service.ts";
import { AuthController } from "@/modules/auth/auth.controller.ts";
import { ConversationRepository } from "@/modules/conversation/conversation.repository.ts";
import { ConversationService } from "@/modules/conversation/conversation.service.ts";
import { ConversationController } from "@/modules/conversation/conversation.controller.ts";
import { MessageRepository } from "@/modules/message/message.repository.ts";
import { MessageService } from "@/modules/message/message.service.ts";
import { MessageController } from "@/modules/message/message.controller.ts";
import { TtsService } from "@/modules/tts/tts.service.ts";
import { TtsController } from "@/modules/tts/tts.controller.ts";
import { authGuard } from "@/middleware/auth-guard.ts";

export function createContainer(env: {
  DATABASE_URL: string;
  JWT_SECRET: string;
}) {
  const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  // Repositories
  const authRepository = new AuthRepository(prisma);
  const conversationRepository = new ConversationRepository(prisma);
  const messageRepository = new MessageRepository(prisma);

  // Services
  const authService = new AuthService(authRepository, env.JWT_SECRET);
  const messageService = new MessageService(messageRepository);
  const conversationService = new ConversationService(
    conversationRepository,
    messageService,
    {
      openaiApiKey: process.env.OPENAI_API_KEY ?? "",
      model: process.env.AI_MODEL ?? "gpt-4o",
      maxSteps: Number(process.env.MAX_AGENT_STEPS ?? 6),
      timeoutMs: Number(process.env.AI_TIMEOUT_MS ?? 30000),
    },
  );

  // TTS
  const ttsService = new TtsService({
    openaiApiKey: process.env.OPENAI_API_KEY ?? "",
    model: process.env.TTS_MODEL ?? "tts-1",
    voice: process.env.TTS_VOICE ?? "alloy",
  });

  // Controllers
  const authController = new AuthController(authService);
  const conversationController = new ConversationController(conversationService);
  const messageController = new MessageController(messageService);
  const ttsController = new TtsController(ttsService);

  // Middleware
  const guard = authGuard(env.JWT_SECRET);

  return {
    prisma,
    pool,
    guard,
    authController,
    conversationController,
    messageController,
    ttsController,
    // Expose services for use by other modules
    authService,
    conversationService,
    messageService,
    messageRepository,
    conversationRepository,
  };
}
