import { PrismaService } from '@app/libs/src/prisma/prisma.service';
import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export class ChristianRepository {
  constructor(private prisma: PrismaService) {}

  async getChristians(filters?: Prisma.ChristianWhereInput) {
    return await this.prisma.christian.findMany({
      where: filters,
      include: {
        christianSacraments: true,
        sacramentApplication: true,
      },
    });
  }

  async getChristian(id: number) {
    return await this.prisma.christian.findUnique({
      where: {
        id,
      },
    });
  }

  async createChristian(data: Prisma.ChristianCreateInput) {
    return await this.prisma.christian.create({
      data,
      include: {
        user: true,
        sacramentApplication: true,
        christianSacraments: true,
      },
    });
  }

  async updateChristian(id: number, data: Prisma.ChristianUpdateInput) {
    return await this.prisma.christian.update({
      where: {
        id,
      },
      data,
      include: {
        sacramentApplication: true,
        christianSacraments: true,
      },
    });
  }
}
