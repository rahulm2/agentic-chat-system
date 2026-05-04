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

async function createAuthUser(email = "test@example.com"): Promise<string> {
  const res = await app.request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password: "password123" }),
  });
  const body = await res.json() as { token: string };
  return body.token;
}

describe("Conversation API", () => {
  it("GET /api/conversations returns paginated list", async () => {
    const token = await createAuthUser();

    // Create some conversations directly
    const { token: _ } = await (
      await app.request("/api/auth/me", { headers: { Authorization: `Bearer ${token}` } })
    ).json() as { token: string };

    const res = await app.request("/api/conversations", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);

    const body = await res.json() as { conversations: unknown[]; total: number };
    expect(body.conversations).toBeDefined();
    expect(body.total).toBeDefined();
  });

  it("GET /api/conversations/:id returns conversation with messages", async () => {
    const token = await createAuthUser();

    // Get user id
    const meRes = await app.request("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await meRes.json() as { id: string };

    // Create conversation directly in DB
    const conv = await prisma.conversation.create({
      data: { userId: user.id, title: "Test Conv" },
    });
    await prisma.message.create({
      data: {
        conversationId: conv.id,
        role: "user",
        content: "Hello",
        orderIndex: 0,
      },
    });

    const res = await app.request(`/api/conversations/${conv.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);

    const body = await res.json() as { id: string; messages: unknown[] };
    expect(body.id).toBe(conv.id);
    expect(body.messages).toHaveLength(1);
  });

  it("GET /api/conversations/:id returns 404 for non-existent", async () => {
    const token = await createAuthUser();

    const res = await app.request("/api/conversations/nonexistent-id", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(404);
  });

  it("GET /api/conversations/:id returns 403 for wrong user", async () => {
    const token1 = await createAuthUser("user1@example.com");
    const token2 = await createAuthUser("user2@example.com");

    const meRes = await app.request("/api/auth/me", {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const user1 = await meRes.json() as { id: string };

    const conv = await prisma.conversation.create({
      data: { userId: user1.id, title: "Private" },
    });

    const res = await app.request(`/api/conversations/${conv.id}`, {
      headers: { Authorization: `Bearer ${token2}` },
    });
    expect(res.status).toBe(403);
  });

  it("DELETE /api/conversations/:id deletes conversation", async () => {
    const token = await createAuthUser();
    const meRes = await app.request("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const user = await meRes.json() as { id: string };

    const conv = await prisma.conversation.create({
      data: { userId: user.id, title: "To Delete" },
    });

    const res = await app.request(`/api/conversations/${conv.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);

    // Verify deleted
    const check = await prisma.conversation.findUnique({ where: { id: conv.id } });
    expect(check).toBeNull();
  });

  it("DELETE /api/conversations/:id returns 403 for wrong user", async () => {
    const token1 = await createAuthUser("owner@example.com");
    const token2 = await createAuthUser("other@example.com");

    const meRes = await app.request("/api/auth/me", {
      headers: { Authorization: `Bearer ${token1}` },
    });
    const user1 = await meRes.json() as { id: string };

    const conv = await prisma.conversation.create({
      data: { userId: user1.id, title: "Protected" },
    });

    const res = await app.request(`/api/conversations/${conv.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token2}` },
    });
    expect(res.status).toBe(403);
  });

  it("all endpoints return 401 without auth", async () => {
    const res1 = await app.request("/api/conversations");
    expect(res1.status).toBe(401);

    const res2 = await app.request("/api/conversations/some-id");
    expect(res2.status).toBe(401);

    const res3 = await app.request("/api/conversations/some-id", { method: "DELETE" });
    expect(res3.status).toBe(401);
  });
});
