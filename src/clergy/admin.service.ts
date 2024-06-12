import { Injectable, BadRequestException, Post } from '@nestjs/common';
import { UserRepository } from 'src/repositories/user.repository';
import { createUserDto } from './dto/user.dto';
import { Password } from 'src/auth/helpers/password';
import { Prisma } from '@prisma/client';
import { PrismaService } from '@app/libs/src/prisma/prisma.service';
import { JwtHelperService } from 'src/jwt-helper/jwt-helper.service';
import { EmailService } from 'src/email/email.service';

@Injectable()
export class AdminService {
  constructor(
    private userRepository: UserRepository,
    private prismaService: PrismaService,
    private jwtHelperService: JwtHelperService,
    private emailService: EmailService,
  ) {}

  async createUser(data: createUserDto) {
    try {
      const password = await Password.generateRandomPassword();

      const username = `${data.firstname} ${data.lastname}`;
      const user = await this.userRepository.createUser({
        username,
        password: password,
        role: data.role,
        gender: data.gender,
        telephone: data.telephone,
        email: data.email,
        firstName: data.firstname,
        lastName: data.lastname,
      });

      const activationToken = await this.jwtHelperService.generateAuthTokens(
        user.id,
      );
      await this.emailService.sendUserWelcome(
        {
          email: user.email,
          name: user.username,
          password,
          role: user.role,
        },
        activationToken.accessToken,
      );

      return user;
    } catch (error: any) {
      throw new BadRequestException(error.message);
    }
  }

  async getUsers(filters?: Prisma.UserWhereInput) {
    const users = await this.userRepository.getUsers({
      ...filters,
      role: {
        notIn: ['CLERGY', 'HIGH_PRIEST'],
      },
    });

    return users;
  }

  async deleteUser(userId: number) {
    const user = await this.userRepository.deleteUser(userId);
    return user;
  }

  async updateUser(userId: number, data: Prisma.UserUpdateInput) {
    try {
      const user = await this.userRepository.updateUser(userId, data);
      return user;
    } catch (error: any) {
      console.log(error);
      throw new BadRequestException(error.message);
    }
  }

  async getParishInfo() {
    return await this.prismaService.parish.findMany();
  }

  async updateParishInfo(data: Prisma.ParishCreateInput) {
    return await this.prismaService.parish.update({
      where: {
        id: 1,
      },
      data,
    });
  }

  async getOfferings(filter?: Prisma.OfferingWhereInput) {
    return await this.prismaService.offering.findMany({
      where: {
        ...filter,
      },
    });
  }

  async updateOffering(data: Prisma.OfferingUpdateInput, id: number) {
    return await this.prismaService.offering.update({
      where: {
        id,
      },
      data,
    });
  }
}
