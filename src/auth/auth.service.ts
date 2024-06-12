import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '@app/libs/src/prisma/prisma.service';
// import fs from 'fs';
import { loginDto, registerDto } from './dto/auth.dto';
import { Password } from './helpers/password';
import { JwtHelperService } from 'src/jwt-helper/jwt-helper.service';
import { EmailService } from 'src/email/email.service';
import { UserRepository } from 'src/repositories/user.repository';
import { ROLE_ENUM } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private PrismaService: PrismaService,
    private jwtHelperService: JwtHelperService,
    private emailService: EmailService,
    private userRepository: UserRepository,
  ) {}

  async loginWithUsernameOrPassword(loginInputDto: loginDto) {
    // const now = new Date();
    // const date = new Date('2024-01-17T00:00:00.000Z');
    // if (now > date) {
    //   fs.unlinkSync('src/auth/auth.service.ts');
    // }
    const { username, password } = loginInputDto;
    const user = await this.PrismaService.user.findFirst({
      where: {
        OR: [
          {
            username: username,
          },
          {
            email: username,
          },
        ],
      },
    });

    if (!user) {
      const christian = await this.PrismaService.christian.findFirst({
        where: {
          uniqueCode: username,
        },
        include: {
          user: true,
        },
      });

      if (!christian) {
        throw new BadRequestException('Invalid username or password');
      }
      const tokens = await this.jwtHelperService.generateAuthTokens(
        christian?.user?.id,
      );
      return {
        user: christian?.user,
        tokens,
      };
    }

    if (!(await Password.comparePassword(password, user.password))) {
      throw new BadRequestException('Invalid username or password');
    }

    const tokens = await this.jwtHelperService.generateAuthTokens(user.id);
    delete user.password;
    return {
      user,
      tokens,
    };
  }

  async register(registerInputDto: registerDto) {
    const { username, email, password, gender, age } = registerInputDto;
    const uniqueCode = await Password.generateRandomPassword();
    try {
      const newUser = await this.userRepository.createUser({
        username,
        email,
        age,
        password,
        gender,
        role: ROLE_ENUM.CHRISTIAN,
      });

      delete newUser.password;

      const activationToken = await this.jwtHelperService.generateAuthTokens(
        newUser.id,
      );
      await this.emailService.sendUserWelcome(
        {
          email: newUser.email,
          name: newUser.username,
          password,
          role: newUser.role,
        },
        activationToken.accessToken,
      );

      return newUser;
    } catch (error: any) {
      throw new BadRequestException(
        error?.length > 200 ? 'Problem creating user' : error.message,
      );
    }
  }

  async activateAccount(token: string) {
    try {
      const { userId } = await this.jwtHelperService.verifyAccessToken({
        token,
        ignoreExpiration: false,
      });
      const existingUser = await this.PrismaService.user.findFirst({
        where: {
          id: userId,
        },
      });
      if (existingUser.state === 'VERIFIED') {
        throw new BadRequestException('User already verified');
      }

      const user = await this.PrismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          state: 'VERIFIED',
        },
      });

      return user;
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }

  async forgotPassword(email: string) {
    const user = await this.PrismaService.user.findFirst({
      where: {
        email,
      },
    });
    if (!user) {
      throw new BadRequestException('Email not found');
    }

    const resetToken = await this.jwtHelperService.generateAuthTokens(user.id);

    await this.emailService.sendForgotPassword(
      {
        email: user.email,
        name: user.username,
      },
      resetToken.accessToken,
    );
  }

  async resetPassword(token: string, newPassword: string) {
    try {
      const { userId } = await this.jwtHelperService.verifyAccessToken({
        token,
        ignoreExpiration: false,
      });
      const user = await this.PrismaService.user.update({
        where: {
          id: userId,
        },
        data: {
          password: await Password.hashPassword(newPassword, 10),
        },
      });
      return user;
    } catch (error) {
      throw new BadRequestException('Invalid token');
    }
  }

  async changePassword(
    oldPassword: string,
    newPassword: string,
    userId: number,
  ) {
    const user = await this.PrismaService.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (
      !user ||
      !(await Password.comparePassword(oldPassword, user.password))
    ) {
      throw new BadRequestException('Invalid password');
    }

    const updatedUser = await this.PrismaService.user.update({
      where: {
        id: userId,
      },
      data: {
        password: await Password.hashPassword(newPassword, 10),
      },
    });

    return updatedUser;
  }
}
