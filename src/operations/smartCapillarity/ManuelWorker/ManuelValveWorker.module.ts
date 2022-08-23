import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GatewayModule } from 'src/units/gateway/gateway.module';
import { GatewayService } from 'src/units/gateway/gateway.service';
import { GatewayLogsModule } from 'src/units/gateway/gatewayLogs/gatewayLogs.module';
import { GatewayLogsService } from 'src/units/gateway/gatewayLogs/gatewayLogs.service';
import { SensorCalibrationLogModule } from 'src/units/workGroup/sensors/sensorCalibrationLogs/sensorCalibrationLog.module';
import { SensorCardLogsModule } from 'src/units/workGroup/sensors/sensorCardLogs/sensorCardLogs.Module';
import { SensorCardParamsModule } from 'src/units/workGroup/sensors/sensorCardParams/sensorCardParams.module';
import { SensorCardsModule } from 'src/units/workGroup/sensors/sensorCards/sensorCards.module';
import { SensorCardsService } from 'src/units/workGroup/sensors/sensorCards/sensorCards.service';
import { SensorMoistureLogModule } from 'src/units/workGroup/sensors/sensorMoistureLogs/sensorMoistureLog.module';
import { WorkGroupModule } from 'src/units/workGroup/workGroup/workGroup.module';
import { WorkGroupLogsModule } from 'src/units/workGroup/workGroupLogs/workGroupsLog.module';
import { ManuelValveWorkerService } from './ManuelValveWorker.service';

@Module({
  imports: [
    GatewayLogsModule,
    GatewayModule,
    SensorCardsModule,
    WorkGroupModule,
    WorkGroupLogsModule,
    SensorMoistureLogModule,
    SensorCalibrationLogModule,
    SensorCardParamsModule,
    SensorCardLogsModule,
    
  ],
  providers: [ManuelValveWorkerService],
  exports: [ManuelValveWorkerService],
})
export class ManuelValveWorkerModule {}
