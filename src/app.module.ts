import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from '@app/libs/src/shared.module';
import { AuthModule } from './auth/auth.module';
import { AuthGuard, RolesGuard } from './guard/auth.guard';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from '@app/libs/src/prisma/prisma.module';
import { JwtHelperModule } from './jwt-helper/jwt-helper.module';
import { repositoryModule } from './repositories/repository.module';
import { AdminModule } from './clergy/admin.module';
import { MulterModule } from '@nestjs/platform-express';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { EmailModule } from './email/email.module';
import { ChristianModule } from './christian/christian.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    SharedModule.registerZodValidationPipe(),
    AuthModule,
    PrismaModule,
    JwtHelperModule,
    AdminModule,
    repositoryModule,
    CloudinaryModule,
    EmailModule,
    ChristianModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
