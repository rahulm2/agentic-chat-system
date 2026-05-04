import type { Context } from "hono";
import { Controller, Get, Post, Patch } from "@asla/hono-decorator";
import type { AuthService } from "./auth.service.ts";
import { registerSchema, loginSchema, updateProfileSchema } from "./auth.schema.ts";

@Controller({ basePath: "/api/auth" })
export class AuthController {
  constructor(private service: AuthService) {}

  @Post("/register")
  async register(c: Context) {
    const body = registerSchema.parse(await c.req.json());
    const result = await this.service.register(body);
    return c.json(result, 201);
  }

  @Post("/login")
  async login(c: Context) {
    const body = loginSchema.parse(await c.req.json());
    const result = await this.service.login(body);
    return c.json(result);
  }

  @Get("/me")
  async me(c: Context) {
    const user = c.get("user" as never) as { sub: string };
    const profile = await this.service.getProfile(user.sub);
    return c.json(profile);
  }

  @Patch("/me")
  async updateMe(c: Context) {
    const body = updateProfileSchema.parse(await c.req.json());
    const user = c.get("user" as never) as { sub: string };
    const profile = await this.service.updateProfile(user.sub, body);
    return c.json(profile);
  }
}
