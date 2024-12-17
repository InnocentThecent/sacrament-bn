import { PrismaService } from '@app/libs/src/prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ChristianRepository } from 'src/repositories/christian.repository';
import { SacramentRepository } from 'src/repositories/sacrament.repository';
import { UserRepository } from 'src/repositories/user.repository';
import { createChristianDto, makeApplicationDto } from './dto/christian.dto';
import { Password } from 'src/auth/helpers/password';
import { EmailService } from 'src/email/email.service';
import { JwtHelperService } from 'src/jwt-helper/jwt-helper.service';
import { UserDecoratorType } from 'src/guard/user.decorator';
import { EnvConfig } from '@app/libs/src/dto/env.config.dto';
import axios from 'axios';
const PaypackJs = require('paypack-js').default;

@Injectable()
export class Christian {
  private paypack;
  constructor(
    private prisma: PrismaService,
    private userRepository: UserRepository,
    private sacramentRepository: SacramentRepository,
    private christianRepository: ChristianRepository,
    private readonly emailService: EmailService,
    private jwtHelperService: JwtHelperService,
    private envConfig: EnvConfig,
  ) {
    this.paypack = PaypackJs.config({
      client_id: this.envConfig.PAY_PACK_CLIENT_ID,
      client_secret: this.envConfig.PAY_PACK_CLIENT_SECRET,
    });
  }

  async getChristians(filters?: Prisma.ChristianWhereInput) {
    return await this.getChristians(filters);
  }

  async getChristian(id: number) {
    return await this.getChristian(id);
  }

  async createChristian(data: createChristianDto) {
    try {
      const userExists = await this.prisma.user.findFirst({
        where: {
          OR: [
            {
              username: data.telephone,
            },
            {
              email: data.email,
            },
          ],
        },
      });

      if (userExists) {
        throw new BadRequestException('User already exists');
      }

      const password = await Password.generateRandomPassword();
      const uniqueCode = await Password.generateRandomNumber();

      const christian = await this.christianRepository.createChristian({
        fatherName: data.fatherName,
        motherName: data.motherName,
        homeAddress: data.home,
        dob: new Date(data.dob),
        user: {
          create: {
            username: `${data.firstname} ${data.lastname}`,
            email: data.email,
            password: await Password.hashPassword(password, 10),
            role: 'CHRISTIAN',
            firstName: data.firstname,
            lastName: data.lastname,
            gender: data?.gender,
            telephone: data?.telephone,
          },
        },
        uniqueCode: String(uniqueCode),
        province: data.province,
        district: data.district,
      });

      if (data?.baptismDate !== '') {
        await this.prisma.christianSacrament.create({
          data: {
            sacrament: {
              connect: {
                name: 'Baptism',
              },
            },
            christian: {
              connect: {
                id: christian.id,
              },
            },
            dateReceived: new Date(data?.baptismDate),
          },
        });
      }

      if (data?.marriageDate !== '') {
        await this.prisma.christianSacrament.create({
          data: {
            sacrament: {
              connect: {
                name: 'Marriage',
              },
            },
            christian: {
              connect: {
                id: christian.id,
              },
            },
            dateReceived: new Date(data?.marriageDate),
          },
        });
      }

      if (data?.euchuristicDate !== '') {
        await this.prisma.christianSacrament.create({
          data: {
            sacrament: {
              connect: {
                name: 'Eucharist',
              },
            },
            christian: {
              connect: {
                id: christian.id,
              },
            },
            dateReceived: new Date(data?.euchuristicDate),
          },
        });
      }

      if (data?.confirmationDate !== '') {
        await this.prisma.christianSacrament.create({
          data: {
            sacrament: {
              connect: {
                name: 'Confirmation',
              },
            },
            christian: {
              connect: {
                id: christian.id,
              },
            },
            dateReceived: new Date(data?.baptismDate),
          },
        });
      }

      const activationToken = await this.jwtHelperService.generateAuthTokens(
        christian?.userId,
      );

      await this.emailService.sendUserWelcome(
        {
          email: christian.user.email,
          name: christian.user.username,
          password,
          role: 'CHRISTIAN',
        },

        activationToken.accessToken,
      );

      return christian;
    } catch (error: any) {
      console.log(error);
      throw new BadRequestException(
        error?.message?.length < 13 ? error?.message : 'User already exists',
      );
    }
  }

  async updateChristian(id: number, data: Prisma.ChristianUpdateInput) {
    return await this.updateChristian(id, data);
  }

  async deleteChristian(id: number) {
    return await this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async getSacraments(filters?: Prisma.SacramentWhereInput) {
    return await this.getSacraments(filters);
  }

  async deleteSacrament(id: number) {
    return await this.deleteSacrament(id);
  }

  async createSacrament(data: Prisma.SacramentCreateInput) {
    return await this.createSacrament(data);
  }

  async updateSacrament(id: number, data: Prisma.SacramentUpdateInput) {
    return await this.updateSacrament(id, data);
  }

  async makeApplication(data: makeApplicationDto, user: UserDecoratorType) {
    try {
      const applyingFor = await this.prisma.christian.findFirst({
        where: {
          AND: [
            { uniqueCode: data?.uniqueCode },
            {
              NOT: {
                userId: user.id,
              },
            },
          ],
        },
      });
      if (!applyingFor && data?.type == 'Mass') {
        throw new BadRequestException('Invalid unique code');
      }

      const application = await this.prisma.sacramentApplication.create({
        data: {
          type: data?.type,
          relationship: data.relationship,
          burialDate: data?.massDate !== '' ? new Date(data?.massDate) : null,
          christian: {
            connect: {
              userId: user.id,
            },
          },
          massRequester:
            data?.type === 'Mass'
              ? { connect: { id: applyingFor?.id } }
              : undefined,
        },
        include: {
          christian: {
            include: {
              user: true,
            },
          },
        },
      });

      const clergy = await this.prisma.user.findFirst({
        where: {
          role: 'CLERGY',
        },
      });
      await this.emailService.sendNewApplication(
        {
          email: clergy?.email,
          name: application.christian?.user.firstName,
        },
        data?.type,
        data?.massDate,
      );

      return application;
    } catch (error: any) {
      console.log(error);
      throw new BadRequestException(
        error?.message?.length < 20
          ? error?.message
          : 'Problem creating application',
      );
    }
  }

  async getApplications(filters?: Prisma.SacramentApplicationWhereInput) {
    return await this.prisma.sacramentApplication.findMany({
      where: {
        ...filters,
      },
      include: {
        christian: {
          include: {
            user: true,
            christianSacraments: true,
            sacramentApplication: true,
            offerings: true,
          },
        },
        massRequester: {
          include: {
            user: true,
            christianSacraments: true,
          },
        },
      },
    });
  }

  async updateApplication(
    id: number,
    data: Prisma.SacramentApplicationUpdateInput,
  ) {
    return await this.prisma.sacramentApplication.update({
      where: {
        id,
      },
      data,
      include: {
        christian: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async generateAccessToken() {
    var options = {
      method: 'POST',
      url: 'https://payments.paypack.rw/api/auth/agents/authorize',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: this.envConfig.PAY_PACK_CLIENT_ID,
        client_secret: this.envConfig.PAY_PACK_CLIENT_SECRET,
      }),
    };

    const response = await axios.post(options.url, options.body, {
      headers: options.headers,
    });

    return response.data?.access;
  }

  async payOffering(
    userId: number,
    phoneNumber: number,
    sacramentAmount: number,
    applicationId: number,
  ) {
    try {
      const token = await this.generateAccessToken();
      var options = {
        url: 'https://payments.paypack.rw/api/transactions/cashin',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(sacramentAmount),
          number: phoneNumber,
        }),
      };

      const response = await axios.post(options.url, options.body, {
        headers: options.headers,
      });

      if (response.data.status === 'pending') {
        await this.prisma.sacramentApplication.update({
          where: {
            id: applicationId,
          },
          data: {
            status: 'PAYMENT_COMPLETED',
          },
        });
      }
    } catch (err) {
      console.error('Paypack cashin error:', err);
      throw new BadRequestException(
        'Problem connecting with the payment vendor',
      );
    }
  }
  async giveOfferings(userId: number, phoneNumber: number, amount: number, year:number) {
    try {
      const token = await this.generateAccessToken();
      var options = {
        url: 'https://payments.paypack.rw/api/transactions/cashin',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          amount: Number(amount),
          number: phoneNumber,
        }),
      };

      const response = await axios.post(options.url, options.body, {
        headers: options.headers,
      });

      if (response.data.status === 'pending') {
        await this.prisma.offering.create({
          data: {
            christian: {
              connect: {
                userId,
              },
            },
            amount: Number(amount),
            year
          },
        });
      }
    } catch (err) {
      console.error('Paypack cashin error:', err);
      throw new BadRequestException('Problem processing payment');
    }
  }

  async addNewMemberSacrament(data: { sacrament: string; date: Date; userId }) {
    const christian = await this.prisma.christian.findFirst({
      where: {
        userId: data?.userId,
      },
    });
    if (!christian) {
      throw new BadRequestException('Member does not exist');
    }
    const memberSacrament = await this.prisma.christianSacrament.create({
      data: {
        sacrament: {
          connect: {
            name: data?.sacrament,
          },
        },
        dateReceived: data?.date,
        christian: {
          connect: {
            id: christian?.id,
          },
        },
      },
    });

    return memberSacrament;
  }
}
