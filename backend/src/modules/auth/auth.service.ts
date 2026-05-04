import { sign } from "hono/jwt";
import { AppError } from "@/common/errors.ts";
import type { AuthRepository } from "./auth.repository.ts";
import type { RegisterDTO, LoginDTO, UpdateProfileDTO } from "./auth.schema.ts";

export interface AuthUser {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  preferences: unknown;
  createdAt: Date;
}

function toAuthUser(user: {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  preferences: unknown;
  createdAt: Date;
}): AuthUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatar: user.avatar,
    preferences: user.preferences,
    createdAt: user.createdAt,
  };
}

export class AuthService {
  constructor(
    private repository: AuthRepository,
    private jwtSecret: string,
  ) {}

  async register(dto: RegisterDTO): Promise<{ user: AuthUser; token: string }> {
    const existing = await this.repository.findByEmail(dto.email);
    if (existing) {
      throw new AppError("Email already exists", "EMAIL_ALREADY_EXISTS", 409);
    }

    const passwordHash = await Bun.password.hash(dto.password);
    const user = await this.repository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
    });

    const token = await this.generateToken(user.id, user.email);
    return { user: toAuthUser(user), token };
  }

  async login(dto: LoginDTO): Promise<{ user: AuthUser; token: string }> {
    const user = await this.repository.findByEmail(dto.email);
    if (!user) {
      throw new AppError("Invalid credentials", "INVALID_CREDENTIALS", 401);
    }

    const valid = await Bun.password.verify(dto.password, user.passwordHash);
    if (!valid) {
      throw new AppError("Invalid credentials", "INVALID_CREDENTIALS", 401);
    }

    const token = await this.generateToken(user.id, user.email);
    return { user: toAuthUser(user), token };
  }

  async getProfile(userId: string): Promise<AuthUser> {
    const user = await this.repository.findById(userId);
    if (!user) {
      throw new AppError("User not found", "NOT_FOUND", 404);
    }
    return toAuthUser(user);
  }

  async updateProfile(userId: string, dto: UpdateProfileDTO): Promise<AuthUser> {
    const user = await this.repository.update(userId, dto);
    return toAuthUser(user);
  }

  private async generateToken(userId: string, email: string): Promise<string> {
    const now = Math.floor(Date.now() / 1000);
    return sign(
      { sub: userId, email, iat: now, exp: now + 7 * 24 * 60 * 60 },
      this.jwtSecret,
    );
  }
}
