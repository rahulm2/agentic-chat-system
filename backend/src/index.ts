import { app } from "@/app.ts";

const port = parseInt(process.env["PORT"] ?? "3000", 10);

Bun.serve({
  fetch: app.fetch,
  port,
});

console.log(`Server running on http://localhost:${port}`);
