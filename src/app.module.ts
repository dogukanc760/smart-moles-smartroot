import { GatewayFieldsModule } from './units/gateway/gatewayFields/gatewayFields.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configService } from './config/config.service';
import { DevicesLocationModule } from './units/externalUnits/devicesLocation/devicesLocation.module';
import { DeviceTypesModule } from './units/externalUnits/devicesTypes/devicesTypes.module';
import { IrrigationTypesModule } from './units/externalUnits/irrigationTypes/irrigationTypes.module';
import { ModemImeiRecordsModule } from './units/externalUnits/modemImeriRecords/modemImeiRecords.module';
import { PlantsModule } from './units/externalUnits/plants/plants.module';
import { SimCardsModule } from './units/externalUnits/simCards/simCards.module';
import { GatewayModule } from './units/gateway/gateway.module';
import { GatewayKhasConditionsModule } from './units/gateway/gatewayKhasConditions/gatewayKhasConditions.module';
import { GatewayLogsModule } from './units/gateway/gatewayLogs/gatewayLogs.module';
import { GatewayMoistureConditionsModule } from './units/gateway/gatewayMoistureConditions/gatewayMoistureConditions.module';
import { SmartRootModule } from './units/smartRoot/smartRoot.module';
import { SmartRootDetailFirstModule } from './units/smartRoot/smartRootDetailFirst/smartRootDetailFirst.module';
import { SmartRootDetailSecondModule } from './units/smartRoot/smartRootDetailSecond/smartRootDetailSecond.module';
import { WorkGroupModule } from './units/workGroup/workGroup/workGroup.module';
import { WorkGroupLogsModule } from './units/workGroup/workGroupLogs/workGroupsLog.module';
import { ManuelValveStrategiesModule } from './units/workGroup/sensors/manuelValveStrategies/manuelValveStrategies.module';
import { PumpManagementTypesModule } from './units/workGroup/sensors/pumpManagementTypes/pumpManagementTypes.module';
import { SensorCalibrationLogModule } from './units/workGroup/sensors/sensorCalibrationLogs/sensorCalibrationLog.module';
import { SensorCardLogsModule } from './units/workGroup/sensors/sensorCardLogs/sensorCardLogs.Module';
import { SensorCardParamsModule } from './units/workGroup/sensors/sensorCardParams/sensorCardParams.module';
import { SensorCardsModule } from './units/workGroup/sensors/sensorCards/sensorCards.module';
import { SensorMoistureLogModule } from './units/workGroup/sensors/sensorMoistureLogs/sensorMoistureLog.module';
import { TimerManagementModule } from './units/workGroup/timerManagement/timerManagement/timerManagement.module';
import { TimerManagementDetailModule } from './units/workGroup/timerManagement/timerManagementDetail/timerManagementDetail.module';
import { TimerManagementLogsModule } from './units/workGroup/timerManagement/timerManagementLogs/timerManagementLogs.module';
import { PumpCardLogsModule } from './units/workGroup/valveCards/pumpCardLogs/pumpCardLogs.module';
import { PumpCardsModule } from './units/workGroup/valveCards/pumpCards/pumpCards.module';
import { ValveCardsModule } from './units/workGroup/valveCards/valveCards/valveCards.module';
import { ValveCardLogsModule } from './units/workGroup/valveCards/valveCardLogs/valveCardLogs.module';
import { UsersModule } from './units/users/users.module';
import { MailModule } from './operations/mailer/mailer.module';
import { MulterModule } from '@nestjs/platform-express';
import { ContractTypesModule } from './units/users/contract/contractType/contractType.module';
import { SubscriptionModule } from './units/users/contract/subscription/subscription.module';
import { UserContractModule } from './units/users/contract/userContract/userContract.module';
import { PermissionsModule } from './units/users/userClaims/permissions/permissions.module';
import { RolesModule } from './units/users/userClaims/roles/roles.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ManuelValveWorkerModule } from './operations/smartCapillarity/ManuelWorker/ManuelValveWorker.module';
import { SmartRootClassificationModule } from './units/smartRoot/smartRootClassification/smartRootClassification.module';
import { RootDetectModule } from './operations/smartRoot/rootDetect.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    ScheduleModule.forRoot(),
    MulterModule.register({
      dest: './files',
    }),

    //Operations
    ManuelValveWorkerModule,
    

    //Users
    UsersModule,
    ContractTypesModule,
    SubscriptionModule,
    UserContractModule,
    PermissionsModule,
    RolesModule,

    // Mailer
    MailModule,

    //External Units
    DevicesLocationModule,
    DeviceTypesModule,
    IrrigationTypesModule,
    ModemImeiRecordsModule,
    PlantsModule,
    SimCardsModule,

    //Gateways
    GatewayModule,
    GatewayFieldsModule,
    GatewayKhasConditionsModule,
    GatewayLogsModule,
    GatewayMoistureConditionsModule,

    //SmartRoots
    SmartRootModule,
    SmartRootDetailFirstModule,
    SmartRootDetailSecondModule,
    SmartRootClassificationModule,

    //Work Groups
    WorkGroupModule,
    WorkGroupLogsModule,

    //Management Types
    ManuelValveStrategiesModule,
    PumpManagementTypesModule,

    //Sensor Components
    SensorCalibrationLogModule,
    SensorCardLogsModule,
    SensorCardParamsModule,
    SensorCardsModule,
    SensorMoistureLogModule,

    //Timer Managements
    TimerManagementModule,
    TimerManagementDetailModule,
    TimerManagementLogsModule,

    //Pumps
    PumpCardLogsModule,
    PumpCardsModule,

    //Valves
    ValveCardsModule,
    ValveCardLogsModule,

    // Root Detect
    RootDetectModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
