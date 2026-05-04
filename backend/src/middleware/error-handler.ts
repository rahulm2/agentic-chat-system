import type { ErrorHandler } from "hono";
import { AppError } from "@/common/errors.ts";

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    return c.json(err.toJSON(), err.status as never);
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
