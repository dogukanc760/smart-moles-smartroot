import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permissions } from 'src/model/users/permissions.entity';
import { PermissionsController } from './permissions.controller';
import { PermissionsService } from './permissions.service';


@Module({
  imports: [TypeOrmModule.forFeature([Permissions])],
  providers: [PermissionsService],
  controllers: [PermissionsController],
  exports: [],
})
export class PermissionsModule {}
