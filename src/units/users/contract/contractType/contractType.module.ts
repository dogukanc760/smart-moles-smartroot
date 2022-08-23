import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContractType } from 'src/model/users/contractType.entity';
import { ContractTypesController } from './contractType.controller';
import { ContractTypeService } from './contractType.service';



@Module({
  imports: [TypeOrmModule.forFeature([ContractType])],
  providers: [ContractTypeService],
  controllers: [ContractTypesController],
  exports: [],
})
export class ContractTypesModule {}
