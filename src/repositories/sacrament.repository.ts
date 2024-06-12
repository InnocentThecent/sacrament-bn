import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/libs/src/prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class SacramentRepository {
  constructor(private prismaService: PrismaService) {}

  async getSacraments(filters?: Prisma.SacramentWhereInput) {
    return await this.prismaService.sacrament.findMany({
      where: filters,
      include: {
        ChristianSacrament: true,
      },
    });
  }

  async deleteSacrament(id: number) {
    return await this.prismaService.sacrament.delete({
      where: {
        id,
      },
    });
  }

  async createSacrament(data: Prisma.SacramentCreateInput) {
    return await this.prismaService.sacrament.create({
      data,
    });
  }

  async updateSacrament(id: number, data: Prisma.SacramentUpdateInput) {
    return await this.prismaService.sacrament.update({
      where: {
        id,
      },
      data,
    });
  }
}
