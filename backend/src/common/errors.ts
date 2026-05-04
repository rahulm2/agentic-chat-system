export type ErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR"
  | "AGENT_ERROR"
  | "TOOL_ERROR"
  | "AI_TIMEOUT"
  | "STREAM_ERROR"
  | "EMAIL_ALREADY_EXISTS"
  | "INVALID_CREDENTIALS";

export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: ErrorCode,
    public readonly status: number = 500,
  ) {
    super(message);
    this.name = "AppError";
  }

  toJSON() {
    return {
      error: {
        message: this.message,
        code: this.code,
      },
    };
  }
}
