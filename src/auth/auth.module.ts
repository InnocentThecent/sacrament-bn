import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtHelperService } from 'src/jwt-helper/jwt-helper.service';
import { EmailModule } from 'src/email/email.module';
import { UserRepository } from 'src/repositories/user.repository';
import { CloudinaryModule } from 'src/cloudinary/cloudinary.module';

@Module({
  imports: [EmailModule, CloudinaryModule],
  controllers: [AuthController],
  providers: [AuthService, JwtHelperService, UserRepository],
})
export class AuthModule {}
