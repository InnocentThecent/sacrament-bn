import { Module } from '@nestjs/common';
import { ChristianController } from './christian.controller';
import { Christian } from './christian.service';
import { repositoryModule } from 'src/repositories/repository.module';
import { EmailModule } from 'src/email/email.module';
import { JwtHelperModule } from 'src/jwt-helper/jwt-helper.module';

@Module({
  imports: [repositoryModule, EmailModule, JwtHelperModule],
  controllers: [ChristianController],
  providers: [Christian],
  exports: [Christian],
})
export class ChristianModule {}
