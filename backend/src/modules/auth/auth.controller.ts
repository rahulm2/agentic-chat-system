import { Controller, Get, Post, Patch, Use } from "@asla/hono-decorator";
import type { AppContext } from "@/common/typed-context.ts";
import { validateBody, getBody, getUser } from "@/middleware/validate.ts";
import type { AuthService } from "./auth.service.ts";
import { registerSchema, loginSchema, updateProfileSchema } from "./auth.schema.ts";
import type { RegisterDTO, LoginDTO, UpdateProfileDTO } from "./auth.schema.ts";

@Controller({ basePath: "/api/auth" })
export class AuthController {
  constructor(private service: AuthService) {}

  @Post("/register")
  @Use(validateBody(registerSchema))
  async register(c: AppContext) {
    const dto = getBody<RegisterDTO>(c);
    const result = await this.service.register(dto);
    return c.json(result, 201);
  }

  @Post("/login")
  @Use(validateBody(loginSchema))
  async login(c: AppContext) {
    const dto = getBody<LoginDTO>(c);
    const result = await this.service.login(dto);
    return c.json(result);
  }

  @Get("/me")
  async me(c: AppContext) {
    const user = getUser(c);
    const profile = await this.service.getProfile(user.sub);
    return c.json(profile);
  }

  @Patch("/me")
  @Use(validateBody(updateProfileSchema))
  async updateMe(c: AppContext) {
    const dto = getBody<UpdateProfileDTO>(c);
    const user = getUser(c);
    const profile = await this.service.updateProfile(user.sub, dto);
    return c.json(profile);
  }
}
