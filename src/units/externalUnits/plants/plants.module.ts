import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DevicesLocation } from 'src/model/ExternalUnits/devicesLocation.entity';
import { Plants } from 'src/model/ExternalUnits/plants.entity';
import { RootDetectModule } from 'src/operations/smartRoot/rootDetect.module';
import { PlantsController } from './plants.controller';
import { PlantService } from './plants.service';


@Module({
  imports: [TypeOrmModule.forFeature([Plants]), RootDetectModule],
  providers: [PlantService],
  controllers: [PlantsController],
  exports: [],
})
export class PlantsModule {}
