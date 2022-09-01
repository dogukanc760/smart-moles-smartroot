import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { GatewayModule } from 'src/units/gateway/gateway.module';
import { GatewayService } from 'src/units/gateway/gateway.service';
import { GatewayLogsModule } from 'src/units/gateway/gatewayLogs/gatewayLogs.module';
import { GatewayLogsService } from 'src/units/gateway/gatewayLogs/gatewayLogs.service';
import { SmartRootModule } from 'src/units/smartRoot/smartRoot.module';
import { SmartRootClassificationModule } from 'src/units/smartRoot/smartRootClassification/smartRootClassification.module';
import { SmartRootDetailFirstModule } from 'src/units/smartRoot/smartRootDetailFirst/smartRootDetailFirst.module';
import { SmartRootDetailSecondModule } from 'src/units/smartRoot/smartRootDetailSecond/smartRootDetailSecond.module';
import { SensorCalibrationLogModule } from 'src/units/workGroup/sensors/sensorCalibrationLogs/sensorCalibrationLog.module';
import { SensorCardLogsModule } from 'src/units/workGroup/sensors/sensorCardLogs/sensorCardLogs.Module';
import { SensorCardParamsModule } from 'src/units/workGroup/sensors/sensorCardParams/sensorCardParams.module';
import { SensorCardsModule } from 'src/units/workGroup/sensors/sensorCards/sensorCards.module';
import { SensorCardsService } from 'src/units/workGroup/sensors/sensorCards/sensorCards.service';
import { SensorMoistureLogModule } from 'src/units/workGroup/sensors/sensorMoistureLogs/sensorMoistureLog.module';
import { PumpCardsModule } from 'src/units/workGroup/valveCards/pumpCards/pumpCards.module';
import { ValveCardsModule } from 'src/units/workGroup/valveCards/valveCards/valveCards.module';
import { WorkGroupModule } from 'src/units/workGroup/workGroup/workGroup.module';
import { WorkGroupLogsModule } from 'src/units/workGroup/workGroupLogs/workGroupsLog.module';
import { RootDetect } from './rootDetect.service';
import { SmartRootInitializeV2Service } from './SmartRootDetClass.service';
import { SmartRootInitializeService } from './SmartRootDetect.service';

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
    PumpCardsModule,
    ValveCardsModule,
    SmartRootModule,
    SmartRootDetailFirstModule,
    SmartRootDetailSecondModule,
    SmartRootClassificationModule
    
  ],
  providers: [RootDetect, SmartRootInitializeService, SmartRootInitializeV2Service],
  exports: [RootDetect, SmartRootInitializeService, SmartRootInitializeV2Service],
})
export class RootDetectModule {}
