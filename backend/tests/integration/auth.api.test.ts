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

async function registerUser(email = "test@example.com", password = "password123") {
  return app.request("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

async function loginUser(email = "test@example.com", password = "password123") {
  return app.request("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
}

describe("Auth API", () => {
  it("POST /api/auth/register creates user and returns token", async () => {
    const res = await registerUser();
    expect(res.status).toBe(201);

    const body = await res.json() as { user: { id: string; email: string }; token: string };
    expect(body.user.email).toBe("test@example.com");
    expect(body.token).toBeDefined();
    expect(body.token.split(".")).toHaveLength(3);
  });

  it("POST /api/auth/register rejects duplicate email with 409", async () => {
    await registerUser();
    const res = await registerUser();
    expect(res.status).toBe(409);

    const body = await res.json() as { error: { code: string } };
    expect(body.error.code).toBe("EMAIL_ALREADY_EXISTS");
  });

  it("POST /api/auth/login returns token for valid credentials", async () => {
    await registerUser();
    const res = await loginUser();
    expect(res.status).toBe(200);

    const body = await res.json() as { user: { email: string }; token: string };
    expect(body.user.email).toBe("test@example.com");
    expect(body.token).toBeDefined();
  });

  it("POST /api/auth/login returns 401 for invalid credentials", async () => {
    await registerUser();
    const res = await loginUser("test@example.com", "wrongpassword");
    expect(res.status).toBe(401);

    const body = await res.json() as { error: { code: string } };
    expect(body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("POST /api/auth/login returns 401 for non-existent email", async () => {
    const res = await loginUser("nobody@example.com", "password123");
    expect(res.status).toBe(401);

    const body = await res.json() as { error: { code: string } };
    expect(body.error.code).toBe("INVALID_CREDENTIALS");
  });

  it("GET /api/auth/me returns user profile with valid token", async () => {
    const regRes = await registerUser();
    const { token } = await regRes.json() as { token: string };

    const res = await app.request("/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    expect(res.status).toBe(200);

    const body = await res.json() as { email: string; id: string };
    expect(body.email).toBe("test@example.com");
    expect(body.id).toBeDefined();
  });

  it("GET /api/auth/me returns 401 without token", async () => {
    const res = await app.request("/api/auth/me");
    expect(res.status).toBe(401);

    const body = await res.json() as { error: { code: string } };
    expect(body.error.code).toBe("UNAUTHORIZED");
  });

  it("PATCH /api/auth/me updates user name", async () => {
    const regRes = await registerUser();
    const { token } = await regRes.json() as { token: string };

    const res = await app.request("/api/auth/me", {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "Updated Name" }),
    });
    expect(res.status).toBe(200);

    const body = await res.json() as { name: string };
    expect(body.name).toBe("Updated Name");
  });

  it("POST /api/auth/register validates email format", async () => {
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "not-an-email", password: "password123" }),
    });
    // Zod parse error caught by error handler
    expect(res.status).toBeGreaterThanOrEqual(400);
  });

  it("POST /api/auth/register validates password length >= 8", async () => {
    const res = await app.request("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: "test@example.com", password: "short" }),
    });
    expect(res.status).toBeGreaterThanOrEqual(400);
  });
});
