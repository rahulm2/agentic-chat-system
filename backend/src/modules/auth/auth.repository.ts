import type { PrismaClient, User, Prisma } from "@prisma/client";
import type { UpdateProfileDTO } from "./auth.schema.ts";

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

  async update(id: string, dto: UpdateProfileDTO): Promise<User> {
    const updateData: Prisma.UserUpdateInput = {};
    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.avatar !== undefined) updateData.avatar = dto.avatar;
    if (dto.preferences !== undefined) updateData.preferences = dto.preferences as Prisma.InputJsonValue;
    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }
}
