import { describe, it, expect, beforeAll, afterAll, afterEach } from "bun:test";
import { createApp } from "@/app.factory.ts";
import type { PrismaClient } from "@prisma/client";
import type { Hono } from "hono";

const JWT_SECRET = "a-very-long-secret-that-is-at-least-32-chars";
let app: Hono;
let prisma: PrismaClient;

beforeAll(async () => {
  const result = createApp({
    DATABASE_URL: process.env.DATABASE_URL!,
    JWT_SECRET,
  });
  app = result.app;
  prisma = result.container.prisma;
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

afterEach(async () => {
  await prisma.toolCall.deleteMany();
  await prisma.usageRecord.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.user.deleteMany();
});

async function createAuthUser(email = "test@example.com"): Promise<{ token: string; userId: string }> {
  const res = await app.request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "password123" }),
  });
  const body = await res.json() as { token: string; user: { id: string } };
  return { token: body.token, userId: body.user.id };
}

describe("Message API", () => {
  it("DELETE /api/messages/:id removes message", async () => {
    const { token, userId } = await createAuthUser();

    const conv = await prisma.conversation.create({
      data: { userId, title: "Test" },
    });
    const msg = await prisma.message.create({
      data: {
        conversationId: conv.id,
        role: "user",
        content: "Hello",
        orderIndex: 0,
      },
    });

    const res = await app.request(`/api/messages/${msg.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);

    const check = await prisma.message.findUnique({ where: { id: msg.id } });
    expect(check).toBeNull();
  });

  it("DELETE /api/messages/:id returns 403 for wrong user", async () => {
    const { userId } = await createAuthUser("owner@example.com");
    const { token: otherToken } = await createAuthUser("other@example.com");

    const conv = await prisma.conversation.create({
      data: { userId, title: "Test" },
    });
    const msg = await prisma.message.create({
      data: {
        conversationId: conv.id,
        role: "user",
        content: "Hello",
        orderIndex: 0,
      },
    });

    const res = await app.request(`/api/messages/${msg.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${otherToken}` },
    });
    expect(res.status).toBe(403);
  });

  it("DELETE /api/messages/:id returns 404 for non-existent", async () => {
    const { token } = await createAuthUser();

    const res = await app.request("/api/messages/nonexistent-id", {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(404);
  });

  it("DELETE /api/messages/:id returns 401 without auth", async () => {
    const res = await app.request("/api/messages/some-id", { method: "DELETE" });
    expect(res.status).toBe(401);
  });
});
