import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { exit } from 'process';
import datasource from 'src/config/migration.config';
import { GatewayDTO } from 'src/units/gateway/gateway.dto';
import { GatewayService } from 'src/units/gateway/gateway.service';
import { SmartRootDTO } from 'src/units/smartRoot/smartRoot.dto';
import { SmartRootService } from 'src/units/smartRoot/smartRoot.service';
import { SmartRootClassificationService } from 'src/units/smartRoot/smartRootClassification/smartRootClassification.service';
import { SmartRootDetailFirstDTO } from 'src/units/smartRoot/smartRootDetailFirst/smartRootDetailFirst.dto';
import { SmartRootDetailFirstService } from 'src/units/smartRoot/smartRootDetailFirst/smartRootDetailFirst.service';
import { SmartRootDetailSecondDTO } from 'src/units/smartRoot/smartRootDetailSecond/smartRootDetailSecond.dto';
import { SmartRootDetailSecondService } from 'src/units/smartRoot/smartRootDetailSecond/smartRootDetailSecond.service';
import { SensorCardsDTO } from 'src/units/workGroup/sensors/sensorCards/sensorCards.dto';
import { SensorCardsService } from 'src/units/workGroup/sensors/sensorCards/sensorCards.service';
import { SensorMoistureLogService } from 'src/units/workGroup/sensors/sensorMoistureLogs/sensorMoistureLog.service';
import { PumpCardsService } from 'src/units/workGroup/valveCards/pumpCards/pumpCards.service';
import { ValveCardsDTO } from 'src/units/workGroup/valveCards/valveCards/valveCards.dto';
import { ValveCardsService } from 'src/units/workGroup/valveCards/valveCards/valveCards.service';
import { WorkGroupDTO } from 'src/units/workGroup/workGroup/workGroup.dto';
import { WorkGroupService } from 'src/units/workGroup/workGroup/workGroup.service';

@Injectable()
export class SmartRootInitializeV2Service {
  private readonly logger = new Logger(SmartRootInitializeV2Service.name);
  deltaData = 0;
  deltaDataSum = 0;
  // Mutlak oran
  infiniteRange = 0;
  classificationData = Array<number>();
  workGroups = Array<WorkGroupDTO>();
  smartRoots = Array<SmartRootDTO>();
  classificationDataStr = Array<string>();
  detectResult = false;
  constructor(
    private readonly sensorMoistureLogService: SensorMoistureLogService,
    private readonly gatewayService: GatewayService,
    private readonly workGroupService: WorkGroupService,
    private readonly sensorCardService: SensorCardsService,
    private readonly pumpService: PumpCardsService,
    private readonly valveCardsService: ValveCardsService,
    private readonly smartRootService: SmartRootService,
    private readonly smartRootDetailFirstService: SmartRootDetailFirstService,
    private readonly smartRootDetailSecondService: SmartRootDetailSecondService,
    private readonly smartRootClassificationService: SmartRootClassificationService,
  ) {}

  // B??T??N ADIMLARIN SIRAYLA GER??ERKLE??ECE???? YER
  //@Cron('*/300 * * * * *')
  public async ProcessStep(): Promise<void> {
    const delay = (ms) => new Promise((res) => setTimeout(res, ms));
    this.smartRoots = [];
    let smartRootFirst = Array<SmartRootDetailFirstDTO>();

    this.logger.log('SmartRoot i??lemleri ba??l??yor.');
    const gateways = await this.GetClosedGateways();
    gateways.forEach(async (x) => {
      let data = await this.smartRootService.getByGateway(x.contentId);
      data.forEach((y) => {
        this.smartRoots.push(y);
      });
    });
    let smrtFirstGate;

    await delay(2000);
    if (this.smartRoots.length > 0) {
      this.logger.verbose(
        `${this.smartRoots.length} SmartRoot Veri Paket Uzunlu??u`,
      );
      this.smartRoots.forEach(async (smartRoot) => {
        let smrtByGate = this.GetSmartRootDetailFirstBySmartRoot(
          smartRoot.contentId,
        );
        smrtByGate.then((gate) => {
          gate.forEach((smartRoot) => {
            smartRoot.SensorDatas.forEach((sensor) => {
              sensor = (Number(sensor) * 1.1).toString();
            });
            this.CreateSecondDataForSmartRoot({
              contentId: smartRoot.contentId,
              createdAt: new Date(),
              isDeleted: false,
              lastChangedDateTime: new Date(),
              SensorDatas: smartRoot.SensorDatas,
              Sensors: smartRoot.Sensors,
              SmartRootID: smartRoot.SmartRootID,
              updatedAt: smartRoot.updatedAt,
            });
          });
        });
        await delay(1100);

        let smartSecond = this.GetSmartRootDetailSecondBySmartRoot(
          smartRoot.contentId,
        );
        this.logger.debug('SmartRoot ??kinci Verisi D??zenleniyor....');
        smartSecond.then((second) => {
          second.forEach((sec) => {
            sec.SensorDatas = sec.SensorDatas.sort((previous, next) =>
              previous > next ? -1 : 1,
            );
            this.logger.verbose(
              `SmartRoot D??zenlenmi?? Verisi: ${sec.SensorDatas}`,
            );
            this.logger.warn(
              'SmartRoot ??kinci Verileri ????in DeltaData ve DeltaTime hesaplamalar?? yap??l??yor.',
            );
            sec.SensorDatas.forEach((infini, index) => {
              this.infiniteRange =
                Number(sec.SensorDatas[sec.SensorDatas.length - 1]) -
                Number(infini);
              this.deltaDataSum += Number(infini);
              this.logger.log(
                `Mutlak oran-${index + 1}: ${this.infiniteRange}`,
              );
            });
            // VER??LER??N ORTALAMASI
            this.deltaData = this.deltaDataSum / 32;
            this.logger
              .verbose(`${smartRoot.Name} Adl?? SmartRoot Verileri Topland?? DeltaData: ${this.deltaDataSum}, Final Mutlak Oran
            : ${this.infiniteRange} olarak hesapland?? ve s??n??flanmaya ge??iliyor.`);
            sec.SensorDatas.forEach((sum, index) => {
              if (
                Number(sum) <
                Number(sec.SensorDatas[sec.SensorDatas.length - 1]) * 0.2
              ) {
                this.logger.warn('En az oranl?? k??k b??lgesi');
                this.classificationData.push(1);
              }
              if (
                Number(sum) >
                  Number(sec.SensorDatas[sec.SensorDatas.length - 1]) * 0.2 &&
                Number(sum) <
                  Number(sec.SensorDatas[sec.SensorDatas.length - 1]) * 0.4
              ) {
                this.logger.warn('Az oranl?? k??k b??lgesi');
                this.classificationData.push(2);
              }
              if (
                Number(sum) >
                  Number(sec.SensorDatas[sec.SensorDatas.length - 1]) * 0.4 &&
                Number(sum) <
                  Number(sec.SensorDatas[sec.SensorDatas.length - 1]) * 0.6
              ) {
                this.logger.warn('Orta ??l??ekli oranl?? k??k b??lgesi');
                this.classificationData.push(3);
              }
              if (
                Number(sum) >
                  Number(sec.SensorDatas[sec.SensorDatas.length - 1]) * 0.6 &&
                Number(sum) <
                  Number(sec.SensorDatas[sec.SensorDatas.length - 1]) * 0.8
              ) {
                this.logger.warn('??ok Oranl?? k??k b??lgesi');
                this.classificationData.push(4);
              }
              if (
                Number(sum) >
                Number(sec.SensorDatas[sec.SensorDatas.length - 1]) * 0.8
              ) {
                this.logger.warn('En ??ok Oranl?? k??k b??lgesi');
                this.classificationData.push(5);
              } else {
                this.logger.warn('K??k Olmayan B??lge');
                this.classificationData.push(0);
              }
            });
            this.logger.debug(
              `${smartRoot.Name} Adl?? SmartRoot S??n??fland??r??lmas?? bitti veritaban??na kaydediliyor...`,
            );
            this.classificationData.forEach((classi) => {
              this.classificationDataStr.push(classi.toString());
            });
            this.smartRootClassificationService.createDetect({
              createdAt: new Date(),
              GatewayID: smartRoot.GatewayID,
              isDeleted: sec.isDeleted,
              lastChangedDateTime: sec.lastChangedDateTime,
              SensorClasses: this.classificationDataStr,
              SensorDatas: this.classificationDataStr,
              Sensors: this.classificationDataStr,
              SmartRootID: sec.SmartRootID,
              updatedAt: sec.updatedAt,
            });
            this.classificationData = [];
            this.classificationDataStr = [];
            this.logger.debug(
              `${smartRoot.Name} Adl?? SmartRoot S??n??fland??r??lmas?? bitti ??nceki veriler temizleniyor s??rada ki SmartRoot ????lemleri ba??layacak`,
            );
          });
        });
      });
    } else {
      this.logger.error('SmartRoot verileri bulunamad??.');
    }
  }

  // KAPALI DURUMDA OLAN GATEWAYLARI ??EK??YORUZ
  public async GetClosedGateways(): Promise<GatewayDTO[]> {
    return await this.gatewayService.getAll();
  }

  // KAPALI GATEWAYLARE G??RE WORKGROUP LARI ALIYORUZ
  public async GetWorkGroupByGateway(id: string): Promise<WorkGroupDTO[]> {
    return await this.workGroupService.getByGateway(id);
  }

  // WORKGROUPLARA G??RE SENS??R KART B??LG??S?? ??EK??YORUZ
  public async GetSensorCardByWorkGroup(id: string): Promise<SensorCardsDTO> {
    return await this.sensorCardService.get(id);
  }

  // GATEWAY E G??RE SMARTROOT B??LG??S?? ??EK??YORUZ
  public async GetSmartRootByGateway(id: string) {
    return await this.smartRootService.getByGateway(id);
  }

  // SMARTROOT A G??RE F??RST TABLOSUNU K??????KTEN B??????YE SIRALAYARAK ??EK??YORUZ
  // F??RST DETA??LE G??RE SON 7 G??NDE STANDART SAPMAYA G??RE (+-%10)
  // VER??LER?? F??LTERLAYIP SMARTROOTDETAILSECOND A YAZACA??IZ
  public async GetSmartRootDetailFirstBySmartRoot(
    id: string,
  ): Promise<SmartRootDetailFirstDTO[]> {
    // let data;
    // this.smartRootDetailFirstService
    //   .getBySmartRoot(id)
    //   .then((result) => (data = result))
    //   .then((res) => {
    //     return data;
    //   });
    // return data;
    return await this.smartRootDetailFirstService.getBySmartRoot(id);
  }

  public async GetSmartRootDetailSecondBySmartRoot(
    id: string,
  ): Promise<SmartRootDetailSecondDTO[]> {
    return await this.smartRootDetailSecondService.getBySmartRoot(id);
  }

  public async CreateSecondDataForSmartRoot(data: SmartRootDetailSecondDTO) {
    return await this.smartRootDetailSecondService.create(data);
  }

  // BURADA F??RSTDETA??L ??LE SECONDDETA??L TABLOLARINI KAR??ILA??TIRACA??IZ
  public async DetectRootAndWriteTable(id: string) {}
}
