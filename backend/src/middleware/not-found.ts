import type { NotFoundHandler } from "hono";

export const notFound: NotFoundHandler = (c) => {
  return c.json(
    {
      error: {
        message: `Route not found: ${c.req.method} ${c.req.path}`,
        code: "NOT_FOUND",
      },
    },
    404,
  );
};
