import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { SacramentRepository } from 'src/repositories/sacrament.repository';
import { createChristianDto, makeApplicationDto } from './dto/christian.dto';
import { Christian } from './christian.service';
import { User, UserDecoratorType } from 'src/guard/user.decorator';
import { Prisma } from '@prisma/client';
import { EmailService } from 'src/email/email.service';

@Controller('christian')
export class ChristianController {
  constructor(
    private sacramentRepository: SacramentRepository,
    private christianService: Christian,
    private emailService: EmailService,
  ) {}
  @Get('/')
  async getChristians() {}
  @Delete(':id')
  async deleteChristian(@Param('id', ParseIntPipe) id: number) {
    return this.christianService.deleteChristian(id);
  }
  @Post('/')
  async createChristian(@Body() data: createChristianDto) {
    return await this.christianService.createChristian(data);
  }
  @Get('/sacraments')
  async getSacraments() {
    return await this.sacramentRepository.getSacraments();
  }
  @Post('/give-offering')
  async giveOfferings(
    @Body()
    data: {
      telephone: number;
      amount: number;
    },
    @User() user: UserDecoratorType,
  ) {
    const application = await this.christianService.giveOfferings(
      user.id,
      data?.telephone,
      data?.amount,
    );
    return application;
  }

  @Post('/application')
  async makeApplication(
    @Body() data: makeApplicationDto,
    @User() user: UserDecoratorType,
  ) {
    return await this.christianService.makeApplication(data, user);
  }

  @Get('/application')
  async getApplications(@User() user: UserDecoratorType) {
    let filters: Prisma.SacramentApplicationWhereInput;
    if (user?.role == 'CHRISTIAN') {
      filters = {
        christian: {
          userId: user.id,
        },
      };
    }
    return await this.christianService.getApplications(filters);
  }

  @Patch('/application/:id/approve')
  async approveApplication(@Param('id', ParseIntPipe) id: number) {
    return this.christianService.updateApplication(id, {
      status: 'APPROVED',
    });
  }

  @Patch('/application/:id/reject')
  async rejectApplication(@Param('id', ParseIntPipe) id: number) {
    return this.christianService.updateApplication(id, {
      status: 'REJECTED',
    });
  }

  @Patch('/application/:id/cancel')
  async cancelApplication(@Param('id', ParseIntPipe) id: number) {
    console.log(id);
    return this.christianService.updateApplication(id, {
      status: 'CANCELLED',
    });
  }

  @Patch('/application/:id/request-payment')
  async requestPayment(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    data: {
      sacramentAmount: number;
    },
  ) {
    const application = await this.christianService.updateApplication(id, {
      status: 'REQUESTED_PAYMENT',
      sacramentAmount: data.sacramentAmount,
    });

    await this.emailService.requestPayment(
      {
        email: application?.christian?.user?.email,
        name: application?.christian?.user?.firstName,
      },
      application?.sacramentAmount,
    );
  }

  @Post('/application/:id/pay')
  async payForApplication(
    @Param('id', ParseIntPipe) id: number,
    @Body()
    data: {
      telephone: number;
      sacramentAmount: number;
    },
    @User() user: UserDecoratorType,
  ) {
    const application = await this.christianService.payOffering(
      user.id,
      data?.telephone,
      data?.sacramentAmount,
      id,
    );
    return application;
  }
}
