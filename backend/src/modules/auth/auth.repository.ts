import type { PrismaClient, User, Prisma } from "@prisma/client";
import type { UpdateProfileInput } from "./auth.schema.ts";

export class AuthRepository {
  constructor(private prisma: PrismaClient) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async create(data: {
    email: string;
    passwordHash: string;
    name?: string;
  }): Promise<User> {
    return this.prisma.user.create({ data });
  }

  async update(id: string, data: UpdateProfileInput): Promise<User> {
    const updateData: Prisma.UserUpdateInput = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.preferences !== undefined) updateData.preferences = data.preferences as Prisma.InputJsonValue;
    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }
}
