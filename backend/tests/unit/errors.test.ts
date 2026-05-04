import { describe, it, expect } from "bun:test";
import { AppError } from "@/common/errors.ts";

describe("AppError", () => {
  it("creates AppError with code and status", () => {
    const error = new AppError("Not found", "NOT_FOUND", 404);

    expect(error).toBeInstanceOf(Error);
    expect(error).toBeInstanceOf(AppError);
    expect(error.message).toBe("Not found");
    expect(error.code).toBe("NOT_FOUND");
    expect(error.status).toBe(404);
  });

  it("defaults to 500 status", () => {
    const error = new AppError("Something broke", "INTERNAL_ERROR");

    expect(error.status).toBe(500);
  });

  it("serializes to JSON correctly", () => {
    const error = new AppError("Unauthorized", "UNAUTHORIZED", 401);
    const json = error.toJSON();

    expect(json).toEqual({
      error: {
        message: "Unauthorized",
        code: "UNAUTHORIZED",
      },
    });
  });
});
