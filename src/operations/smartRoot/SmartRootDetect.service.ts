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

  // BÜTÜN ADIMLARIN SIRAYLA GERÇERKLEŞECEĞİ YER
  @Cron("*/10 * * * * *")
  public async ProcessStep(): Promise<void> {
    try {
      const gatewayData = this.GetClosedGateways()
        .then((datas) => {
          datas.forEach(async (gateway) => {
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
          this.DetectRootAndWriteTable(rootData.contentId).then(async (ress) => {
            if (ress) {
              this.classificationData.forEach((data, index) => {
                this.classificationDataStr.push(data.toString());
              });
              console.log(rootData.GatewayID);
              await this.smartRootClassificationService.createDetect({
                
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
                `${rootData.Name} adlı SmartRoot Analiz İşlemi Başarıyla Tamamlandı, Sınıflama Bitti`,
              );
            } else {
              this.logger.warn(
                `${rootData.Name} adlı SmartRoot verisi sınıflanamadı`,
              );
            }
          });
        });
      });
    } catch (error) {
      this.logger.error(`İşlem sırasında bir hata oluştu => ${error}`);
      return error;
    }
  }

  // KAPALI DURUMDA OLAN GATEWAYLARI ÇEKİYORUZ
  public async GetClosedGateways(): Promise<GatewayDTO[]> {
    return await this.gatewayService.getAll();
  }

  // KAPALI GATEWAYLARE GÖRE WORKGROUP LARI ALIYORUZ
  public async GetWorkGroupByGateway(id: string): Promise<WorkGroupDTO[]> {
    console.log(id);
    return await this.workGroupService.getByGateway(id);
  }

  // WORKGROUPLARA GÖRE SENSÖR KART BİLGİSİ ÇEKİYORUZ
  public async GetSensorCardByWorkGroup(id: string): Promise<SensorCardsDTO> {
    return await this.sensorCardService.get(id);
  }

  // GATEWAY E GÖRE SMARTROOT BİLGİSİ ÇEKİYORUZ
  public async GetSmartRootByGateway(id: string) {
    return await this.smartRootService.getByGateway(id);
  }

  // SMARTROOT A GÖRE FİRST TABLOSUNU KÜÇÜKTEN BÜĞÜYE SIRALAYARAK ÇEKİYORUZ
  // FİRST DETAİLE GÖRE SON 7 GÜNDE STANDART SAPMAYA GÖRE (+-%10)
  // VERİLERİ FİLTERLAYIP SMARTROOTDETAILSECOND A YAZACAĞIZ
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
      // VERİLERİ SECOND DETAİLE YAZDIK VE AŞAĞIDA Kİ FONKSİYONDA KARŞILAŞTIRACAĞIZ
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

  // BURADA FİRSTDETAİL İLE SECONDDETAİL TABLOLARINI KARŞILAŞTIRACAĞIZ
  public async DetectRootAndWriteTable(id: string) {
    let detailSecond = (
      await this.smartRootDetailSecondService.getBySmartRoot(id)
    ).filter((data) => data.createdAt.getDate() - 7);
    let detailFirst = (
      await this.smartRootDetailFirstService.getBySmartRoot(id)
    ).filter((data) => data.createdAt.getDate() - 7);

    for (let i = 0; i < detailFirst.length; i++) {
      for (let j = 0; j <= i; j++) {
        if (1<2
        //  Number(detailFirst[i].SensorDatas[j]) * 1.1 <=
          //  Number(detailSecond[i].SensorDatas[j]) * 1.1 &&
          //Number(detailFirst[i].SensorDatas[j]) >=
           // Number(detailSecond[i].SensorDatas[j])
        ) {
          this.logger.verbose(`${detailFirst[i].SmartRootID} ID'li SmartRoot
          verileri son günlerde eşleşiyor. Bu bölge kök bölgesi olabilir.`);
          this.deltaDataSum += Number(detailSecond[i].SensorDatas[j]);
          this.logger.warn(`${this.deltaDataSum} eşleşen verilerin toplamı`);
          this.deltaData = this.deltaDataSum / 32;
          this.logger.warn(
            `${this.deltaData} eşleşen verilerin aritmetik ortalaması`,
          );
          var lastRate = Number(detailSecond[i].SensorDatas[j]) * 1.1;
          if (lastRate < this.deltaData * 0.2) {
            this.classificationData.push(1);
            this.logger.debug(`En az  ölçekte kök var`);
          }
          if (
            lastRate > this.deltaData * 0.2 &&
            lastRate < this.deltaData * 0.4
          ) {
            this.classificationData.push(2);
            this.logger.debug(`Az  ölçekte kök var`);
          }
          if (
            lastRate > this.deltaData * 0.4 &&
            lastRate < this.deltaData * 0.6
          ) {
            this.classificationData.push(3);
            this.logger.debug(`Orta  ölçekte kök var`);
          }
          if (
            lastRate > this.deltaData * 0.6 &&
            lastRate < this.deltaData * 0.8
          ) {
            this.classificationData.push(4);
            this.logger.debug(`Çok  ölçekte kök var`);
          }
          if (lastRate > this.deltaData * 0.8) {
            this.classificationData.push(5);
            this.logger.debug(`En çok ölçekte kök var`);
          }
          return true;
        } else {
          this.logger.verbose(`${detailFirst[i].SmartRootID} ID'li SmartRoot
            verileri son günlerde eşleşmiyor.`);
          return false;
        }
      }
    }
  }
}
