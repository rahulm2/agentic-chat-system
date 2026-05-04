import type { Context } from "hono";

/** JWT payload attached to every authenticated request by the auth guard. */
export interface AuthPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

/** Hono context variable map — extends the base Context with typed variables. */
export type AppEnv = {
  Variables: {
    user: AuthPayload;
  };
};

/** Typed Hono context — use this in all controllers instead of bare `Context`. */
export type AppContext = Context<AppEnv>;
