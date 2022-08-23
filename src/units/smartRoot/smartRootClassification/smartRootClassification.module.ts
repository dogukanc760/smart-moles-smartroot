import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SmartRootClassification } from 'src/model/SmartRoot/smartRootClassification.entity';
import { SmartRootClassificationController } from './smartRootClassification.controller';
import { SmartRootClassificationService } from './smartRootClassification.service';

@Module({
  imports: [TypeOrmModule.forFeature([SmartRootClassification])],
  providers: [SmartRootClassificationService],
  controllers: [SmartRootClassificationController],
  exports: [],
})
export class SmartRootClassificationModule {}
