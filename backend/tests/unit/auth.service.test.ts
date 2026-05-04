import { describe, it, expect, beforeEach } from "bun:test";
import { AuthService } from "@/modules/auth/auth.service.ts";
import type { AuthRepository } from "@/modules/auth/auth.repository.ts";

const JWT_SECRET = "a-very-long-secret-that-is-at-least-32-chars";

function createMockRepo(overrides: Partial<AuthRepository> = {}): AuthRepository {
  return {
    findByEmail: async () => null,
    findById: async () => null,
    create: async (data) => ({
      id: "user-1",
      email: data.email,
      name: data.name ?? null,
      passwordHash: data.passwordHash,
      avatar: null,
      preferences: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    update: async (id, data) => ({
      id,
      email: "test@example.com",
      name: data.name ?? null,
      passwordHash: "hash",
      avatar: data.avatar ?? null,
      preferences: data.preferences ?? null,
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    ...overrides,
  } as AuthRepository;
}

describe("AuthService", () => {
  let service: AuthService;
  let mockRepo: AuthRepository;

  beforeEach(() => {
    mockRepo = createMockRepo();
    service = new AuthService(mockRepo, JWT_SECRET);
  });

  it("registers user with hashed password", async () => {
    let savedHash = "";
    mockRepo = createMockRepo({
      create: async (data) => {
        savedHash = data.passwordHash;
        return {
          id: "user-1",
          email: data.email,
          name: data.name ?? null,
          passwordHash: data.passwordHash,
          avatar: null,
          preferences: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
      },
    });
    service = new AuthService(mockRepo, JWT_SECRET);

    const result = await service.register({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.user.email).toBe("test@example.com");
    expect(result.token).toBeDefined();
    expect(savedHash).not.toBe("password123");
    expect(savedHash.length).toBeGreaterThan(0);
  });

  it("rejects duplicate email", async () => {
    mockRepo = createMockRepo({
      findByEmail: async () => ({
        id: "user-1",
        email: "test@example.com",
        name: null,
        passwordHash: "hash",
        avatar: null,
        preferences: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    });
    service = new AuthService(mockRepo, JWT_SECRET);

    await expect(
      service.register({ email: "test@example.com", password: "password123" }),
    ).rejects.toThrow("Email already exists");
  });

  it("logs in with valid credentials", async () => {
    const hash = await Bun.password.hash("password123");
    mockRepo = createMockRepo({
      findByEmail: async () => ({
        id: "user-1",
        email: "test@example.com",
        name: "Test",
        passwordHash: hash,
        avatar: null,
        preferences: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    });
    service = new AuthService(mockRepo, JWT_SECRET);

    const result = await service.login({
      email: "test@example.com",
      password: "password123",
    });

    expect(result.user.email).toBe("test@example.com");
    expect(result.token).toBeDefined();
  });

  it("rejects invalid password", async () => {
    const hash = await Bun.password.hash("password123");
    mockRepo = createMockRepo({
      findByEmail: async () => ({
        id: "user-1",
        email: "test@example.com",
        name: null,
        passwordHash: hash,
        avatar: null,
        preferences: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }),
    });
    service = new AuthService(mockRepo, JWT_SECRET);

    await expect(
      service.login({ email: "test@example.com", password: "wrongpassword" }),
    ).rejects.toThrow("Invalid credentials");
  });

  it("rejects non-existent email", async () => {
    await expect(
      service.login({ email: "nobody@example.com", password: "password123" }),
    ).rejects.toThrow("Invalid credentials");
  });

  it("generates valid JWT token", async () => {
    const result = await service.register({
      email: "jwt@example.com",
      password: "password123",
    });

    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe("string");
    expect(result.token.split(".")).toHaveLength(3);
  });
});
