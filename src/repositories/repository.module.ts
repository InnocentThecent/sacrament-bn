import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { SacramentRepository } from './sacrament.repository';
import { ChristianRepository } from './christian.repository';

@Module({
  providers: [UserRepository, SacramentRepository, ChristianRepository],
  exports: [UserRepository, SacramentRepository, ChristianRepository],
})
export class repositoryModule {}
