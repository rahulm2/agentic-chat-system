import { describe, it, expect } from "bun:test";
import { app } from "@/app.ts";

describe("Health API", () => {
  it("GET /health returns 200 with status ok", async () => {
    const res = await app.request("/health");
    expect(res.status).toBe(200);

    const body = (await res.json()) as { status: string; timestamp: string };
    expect(body.status).toBe("ok");
    expect(body.timestamp).toBeDefined();
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp);
  });

  it("returns JSON content type", async () => {
    const res = await app.request("/health");
    expect(res.headers.get("content-type")).toContain("application/json");
  });

  it("unknown routes return 404 with structured error", async () => {
    const res = await app.request("/nonexistent");
    expect(res.status).toBe(404);

    const body = (await res.json()) as { error: { code: string; message: string } };
    expect(body.error).toBeDefined();
    expect(body.error.code).toBe("NOT_FOUND");
    expect(body.error.message).toBeDefined();
  });
});
