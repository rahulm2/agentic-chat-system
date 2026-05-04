import type { ErrorHandler } from "hono";
import { AppError } from "@/common/errors.ts";
import { z } from "zod/v4";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    return c.json(err.toJSON(), err.status as never);
  }

  if (err instanceof z.ZodError) {
    return c.json(
      {
        error: {
          message: err.issues.map((i) => i.message).join(", "),
          code: "VALIDATION_ERROR",
        },
      },
      400,
    );
  }

  console.error("Unhandled error:", err);
  return c.json(
    {
      error: {
        message: "Internal server error",
        code: "INTERNAL_ERROR",
      },
    },
    500,
  );
};
