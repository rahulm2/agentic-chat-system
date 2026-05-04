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

export class ToolError extends AppError {
  constructor(
    message: string,
    public readonly toolName: string,
    code: ErrorCode = "TOOL_ERROR",
    status: number = 502,
  ) {
    super(message, code, status);
    this.name = "ToolError";
  }
}

export class ToolNotFoundError extends ToolError {
  constructor(drugName: string) {
    super(`No drugs found for "${drugName}"`, "rxnorm_lookup", "NOT_FOUND", 404);
    this.name = "ToolNotFoundError";
  }
}

export class ToolTimeoutError extends ToolError {
  constructor(toolName: string) {
    super(`${toolName} API request timed out`, toolName, "AI_TIMEOUT", 504);
    this.name = "ToolTimeoutError";
  }
}

export class ToolRateLimitError extends ToolError {
  constructor(toolName: string) {
    super(`${toolName} API rate limit exceeded. Please try again later.`, toolName, "RATE_LIMITED", 429);
    this.name = "ToolRateLimitError";
  }
}

export class ToolApiError extends ToolError {
  constructor(toolName: string, statusCode: number, statusText: string) {
    super(`${toolName} API error: ${statusCode} ${statusText}`, toolName, "TOOL_ERROR", 502);
    this.name = "ToolApiError";
  }
}
