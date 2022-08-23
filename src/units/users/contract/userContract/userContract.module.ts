import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserContract } from 'src/model/users/userContract.entity';
import { UserContractsController } from './userContract.controller';
import { UserContractService } from './userContract.service';




@Module({
  imports: [TypeOrmModule.forFeature([UserContract])],
  providers: [UserContractService],
  controllers: [UserContractsController],
  exports: [],
})
export class UserContractModule {}
