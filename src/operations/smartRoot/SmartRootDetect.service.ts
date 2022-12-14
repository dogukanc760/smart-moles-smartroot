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
export class SmartRootInitializeService {
  private readonly logger = new Logger(SmartRootInitializeService.name);
  deltaData = 0;
  deltaDataSum = 0;
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
  //@Cron('*/10 * * * * *')
  public async ProcessStep(): Promise<void> {
    try {
      const gatewayData = this.GetClosedGateways()
        .then((datas) => {
          datas.forEach( (gateway) => {
            // var data = this.GetWorkGroupByGateway(gateway.contentId)
            // .then((wrk)=>{
            //     this.workGroups = wrk;
            // })
            // .catch(err=>console.log(err));
            var smartRootData = this.GetSmartRootByGateway(
              gateway.contentId,
            ).then((data) => {
              data.forEach((data, index) => {
                this.smartRoots.push(data);
              });
            });
            // if (typeof data.contentId !== 'undefined') {

            // }
          });
        })
        .catch((err) => console.log(err));
      console.log(gatewayData);

      this.smartRoots.forEach((rootData, index) => {
        const result = this.GetSmartRootDetailFirstBySmartRoot(
          rootData.contentId,
        ).then((data) => {
          this.DetectRootAndWriteTable(rootData.contentId).then(
           (ress) => {
              if (ress) {
                this.classificationData.forEach((data, index) => {
                  console.log("main loop:", index)
                  this.classificationDataStr.push(data.toString());
                });
                console.log(rootData.GatewayID);
                 this.smartRootClassificationService.createDetect({
                  createdAt: new Date(),
                  GatewayID: rootData.GatewayID,
                  isDeleted: rootData.isDeleted,
                  lastChangedDateTime: rootData.lastChangedDateTime,
                  SensorClasses: this.classificationDataStr,
                  SensorDatas: this.classificationDataStr,
                  Sensors: this.classificationDataStr,
                  SmartRootID: rootData.contentId,
                  updatedAt: rootData.updatedAt,
                });
                //   this.classificationData = [];
                //   this.classificationDataStr = [];
                this.logger.verbose(
                  `${rootData.Name} adl?? SmartRoot Analiz ????lemi Ba??ar??yla Tamamland??, S??n??flama Bitti`,
                );
                this.classificationData = [];

              } else {
                this.logger.warn(
                  `${rootData.Name} adl?? SmartRoot verisi s??n??flanamad??`,
                );
              }
            },
          );
        });
      });
    } catch (error) {
      this.logger.error(`????lem s??ras??nda bir hata olu??tu => ${error}`);
      return error;
    }
  }

  // KAPALI DURUMDA OLAN GATEWAYLARI ??EK??YORUZ
  public async GetClosedGateways(): Promise<GatewayDTO[]> {
    return await this.gatewayService.getAll();
  }

  // KAPALI GATEWAYLARE G??RE WORKGROUP LARI ALIYORUZ
  public async GetWorkGroupByGateway(id: string): Promise<WorkGroupDTO[]> {
    console.log(id);
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
  ): Promise<boolean> {
    let data = await (
      await this.smartRootDetailFirstService.getBySmartRoot(id)
    ).filter((data) => data.createdAt.getDate() - 7);
    data.forEach((root) => {
      root.SensorDatas = root.SensorDatas.sort((previous, next) =>
        previous > next ? -1 : 1,
      );
      root.SensorDatas.forEach((sensorDatas, index) => {
        root.SensorDatas[index] = (Number(sensorDatas[index]) * 1.1).toString();
      });
      // VER??LER?? SECOND DETA??LE YAZDIK VE A??A??IDA K?? FONKS??YONDA KAR??ILA??TIRACA??IZ
      this.smartRootDetailSecondService.create({
        contentId: root.contentId,
        createdAt: root.createdAt,
        isDeleted: root.isDeleted,
        lastChangedDateTime: root.lastChangedDateTime,
        SensorDatas: root.SensorDatas,
        Sensors: root.Sensors,
        SmartRootID: root.SmartRootID,
        updatedAt: root.updatedAt,
      });
    });
    if (data.length > 0) {
      return true;
    }
    return false;
  }

  // BURADA F??RSTDETA??L ??LE SECONDDETA??L TABLOLARINI KAR??ILA??TIRACA??IZ
  public async DetectRootAndWriteTable(id: string) {
    this.deltaDataSum = 0;
    let detailSecond = (
      await this.smartRootDetailSecondService.getBySmartRoot(id)
    ).filter((data) => data.createdAt.getDate() - 7);
    let detailFirst = (
      await this.smartRootDetailFirstService.getBySmartRoot(id)
    ).filter((data) => data.createdAt.getDate() - 7);

    let detailFirstData = [];
    // detailFirst.forEach((data) => {
    //   detailFirstData.push(data.SensorDatas);
    // });
    detailFirst.forEach((data) => {
      data.SensorDatas.forEach((sensor) => detailFirstData.push(sensor));
    });
    for (let i = 0; i < detailFirst.length; i++) {
      detailFirstData = [];
      detailFirst[i].SensorDatas.forEach((data) => {
        detailFirstData.push(data);
      });
      console.log(detailFirstData);
      this.deltaDataSum = 0;
      for (let j = 0; j <= detailFirstData.length; j++) {
        if (
          detailFirst[i].SensorDatas.length == 32
          //  Number(detailFirst[i].SensorDatas[j]) * 1.1 <=
          //  Number(detailSecond[i].SensorDatas[j]) * 1.1 &&
          //Number(detailFirst[i].SensorDatas[j]) >=
          // Number(detailSecond[i].SensorDatas[j])
        ) {
          this.logger.verbose(`${detailFirst[i].SmartRootID} ID'li SmartRoot
          verileri son g??nlerde e??le??iyor. Bu b??lge k??k b??lgesi olabilir.`);
          this.deltaDataSum += Number(detailSecond[i].SensorDatas[j]);
          this.logger.warn(`${this.deltaDataSum} e??le??en verilerin toplam??`);
          this.deltaData = this.deltaDataSum / 32;
          this.logger.warn(
            `${this.deltaData} e??le??en verilerin aritmetik ortalamas??`,
          );
          var lastRate = Number(detailSecond[i].SensorDatas[j]) * 1.1;
          if (lastRate < this.deltaData * 0.2) {
            this.classificationData.push(1);
            this.logger.debug(`En az  ??l??ekte k??k var`);
          }
          else if (
            lastRate > this.deltaData * 0.2 &&
            lastRate < this.deltaData * 0.4
          ) {
            this.classificationData.push(2);
            this.logger.debug(`Az  ??l??ekte k??k var`);
          }
          else if (
            lastRate > this.deltaData * 0.4 &&
            lastRate < this.deltaData * 0.6
          ) {
            this.classificationData.push(3);
            this.logger.debug(`Orta  ??l??ekte k??k var`);
          }
          else if (
            lastRate > this.deltaData * 0.6 &&
            lastRate < this.deltaData * 0.8
          ) {
            this.classificationData.push(4);
            this.logger.debug(`??ok  ??l??ekte k??k var`);
          }
          else if (lastRate > this.deltaData * 0.8) {
            this.classificationData.push(5);
            this.logger.debug(`En ??ok ??l??ekte k??k var`);
          }
          else {
            this.classificationData.push(2);
            this.logger.debug('Az ??l??ekli K??k')
          }
          return true;
          //return true;
        } else {
          this.logger.verbose(`${detailFirst[i].SmartRootID} ID'li SmartRoot
            verileri son g??nlerde e??le??miyor.`);
          return false;
        }
      }
    }
  }
}
