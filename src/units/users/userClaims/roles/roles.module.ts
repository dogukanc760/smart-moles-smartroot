import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Roles } from 'src/model/users/roles.entity';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';


@Module({
  imports: [TypeOrmModule.forFeature([Roles])],
  providers: [RolesService],
  controllers: [RolesController],
  exports: [],
})
export class RolesModule {}
