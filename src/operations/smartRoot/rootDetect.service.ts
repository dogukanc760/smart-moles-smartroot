import { Injectable } from '@nestjs/common';
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
export class RootDetect {
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

  public async Process() {
    try {
      let sensorDatasForSecond = Array<string>();
      let workGroups = Array<WorkGroupDTO>();
      let smartRoot = Array<SmartRootDTO>();
      let valveCards = Array<ValveCardsDTO>();
      let sensorCards = Array<SensorCardsDTO>();
      let gatewayClosed = Array<GatewayDTO>();
      let smartRootDetailFirst = Array<SmartRootDetailFirstDTO>();
      let smartRootDetailSecond = Array<SmartRootDetailSecondDTO>();
      const gateways = await this.gatewayService.getAll();
      // BİR SENSÖRE AİT TOPLAM DATANIN DELTA DEĞERİ VE DELTA ZAMAN DEĞERİNİN BÖLÜMÜ BİZE
      // TOPLAM DEĞİŞİMİN YÜZDELİK CİNSİNDEN DEĞERİNİ VERİR
      let deltaData = 0;
      let deltaTime;
      let lastChangeData;
      let lastChangeDataArray: number[];
      // ÖNCE GATEWAYLERİ LİSTELİYORUZ VE GATEWAYE BAĞLI WORKGROUPLARI DAHA SONRA
      // WORKGROUPLARINA BAĞLI OLAN VALVECARDSLARI ÇEKİYORUZ
      // VALVECARDSLARDA İSOPEN FALSE OLAN YANİ KAPALI DURUMDA OLAN VANALAR İLE SMARTROOT İŞLEMLERİMİZİ YAPACAĞIZ
      gateways.forEach(async (gateway) => {
        console.log(gateway.contentId);
        const vorkgrup = await this.workGroupService.getByGateway(
          gateway.contentId,
        );
        vorkgrup.map((x) => workGroups.push(x));

        workGroups.map(async (workGroup) => {
          // VANA KARTLARIMIZI ALDIK VE ISOPEN===FALSE YANI KAPALI OLANLARI FİLTRELEYİP ÇEKTİK.
          var vanaKartları = await this.valveCardsService.getByWorkGroup(
            workGroup.contentId,
          );
          vanaKartları.map((x) => {
            if (!x.IsOpen) {
              console.log('bu vana kapalı');
              valveCards.push(x);
              console.log(valveCards.length + 'vena');
            }
          });
        });
        // İLK BAŞTA BÜTÜN WORKGROUPLARI ALMIŞTIK FAKAT BİZE SADECE VANASI KAPALI OLANLAR LAZIMDI
        // O YÜZDEN VANALARI KAPALI OLANLARI ALDIKTAN SONRA. KAPALI OLAN VANALARIN BAĞLI OLDUĞU WORKGROUPLARI ÇEKTİK
        // AYRI AYRI WORKGROUPSDTO REFERANSI ALMAMAK ICIN BURADA WORKGROUPS GENERIC ARRAYI BOSALTIYORUZ.
        workGroups = [];
        setTimeout(() => {
          if (valveCards.length > 0) {
            valveCards.forEach(async (fun) => {
              console.log(fun.Name + 'e geldi');
              workGroups.push(await this.workGroupService.get(fun.WorkGroupID));
            });
          } else {
            console.log('No work groups found');
          }
          console.log('closed gateway');
          if (workGroups.length > 0) {
            workGroups.forEach(async (len) => {
              gatewayClosed.push(await this.gatewayService.get(len.GatewayID));

              console.log(workGroups.length);
            });
          } else {
            console.log('Gateway closed');
          }
        }, 1100);

        // ARTIK ELIMIZDE VANASI KAPALI OLAN VE SMARTROOT İÇİN İŞLEMLER YAPABİLECEĞİMİZ WORKGROUPLAR VAR
        // ŞIMDI ISE BU WORK GROUPLARIN BAĞLI OLDUĞU GATEWAYLERİ BULACAĞIZ.
        // ÇÜNKÜ SMARTROOTLAR GATEWAYLERE BAĞLI BİR ÜNİTEDİR.
        // YANİ, VANASI KAPANMIŞ OLAN WORKGROUP-GATEWAYLERE BAĞLI SMARTROOTLARI ELDE ETMİŞ OLACAĞIZ
        // BURADA GATEWAY GENERİC ARRAYINI SIFIRLAYAMIYORUZ ÇÜNKÜ HALA ONA AİT DÖNGÜNÜN İÇERİSİNDEYİZ.

        // ARTIK BU GATEWAYLARI DE ALDIĞIMIZA GÖRE ŞİMDİ SMARTROOTLARLA ÇALISMAYA BAŞLAYABİLİRİZ. 01bd7493-fa91-47be-a9b5-8cd83ed9208a
        // BUNUDA BASKA BİR PROCESS DÖNGÜSÜNDE YAPACAĞIZ.
      });

      // VANASI KAPALI OLAN GATEWAYLERE GÖRE SMARTROOTLARIMIZI ALIYORUZ
      // VANASI KAPALI OLANLARI ALMAMIZIN SEBEBİ, DÜŞEY NEM HAREKETLERİNİ İNCELEYECEK OLMAMIZ.
      // SMARTROOTDETAILFIRST SENSORLERDEN TOPLANAN VERİLERDİR
      // SON 1 VE 2. VERİ WEB PANELDE Kİ SMARTROOT 1.VERİ VE SMARTROOT 2.VERİ OLARAK YER ALMAKTADIR
      // SMARTROOTSDETAILSECOND İSE HER BİR SENSÖRDE Kİ KÖK TESPİTİ İÇİN KULLANILACAK MATEMATKSEL FORMULDE KI VERILERIN TUTULDUĞU
      // VE TEKRAR UI TARAFINA ÇEKILDIGI TABLODUR.
      // BU YUZDENDIR Kİ SENSÖRLERDEN VERİLERİ TOPLAYIP FIRST TABLOSUNA, VERILERI ISLEDIKTEN SONRA SECOND TABLOSUNA YAZACAĞIZ
      // BELIRLI PAREMETRELERE GÖRE SECOND TABLOSUNDA ISLENMIS VERILER ILE KARSILASTIRDIKTAN SONRA ORADA KOK OLUP OLMADIGINI BULACAGIZ

      gatewayClosed.forEach(async (gateway) => {
        console.log('gatewaya geldi');
        smartRoot.push(
          ...(await this.smartRootService.getByGateway(gateway.contentId)),
        );
        smartRoot.forEach(async (smart) => {
          smartRootDetailFirst.push(
            ...(await this.smartRootDetailFirstService.getBySmartRoot(
              smart.contentId,
            )),
            // .filter((x) => x.lastChangedDateTime.getUTCDay() - 7),
          );
          // SENSOR DATALARINI BÜYÜKTEN KÜÇÜĞE SIRALAR
          // BU NOKTADA HER BİR SENSÖRDE 32 VERİ VAR VE 32 SENSÖRÜNDE TEK TEK VERİLERİNİN ALINIP İŞLENMESİ GEREK
          // BU YÜZDEN SENSORDATAS İÇİN AYRI BİR DÖNGÜSEL İŞLEM YAPMAN GEREKİYOR.
          smartRootDetailFirst.forEach(async (root, index) => {
            root.SensorDatas = root.SensorDatas.sort((previous, next) =>
              previous > next ? -1 : 1,
            );
            // BU DÖNGÜDE 32 VERİNİN STANDART SAPMA DAHİL EDİLMİŞ HALİ ALINIYOR
            // 32 SENSORDEN GELEN HER BİR DATA O DELTADATA DEĞİŞKENİNE YAZILIYOR
            // DAHA SONRA LASTCHANGEDATARRAY LİSTESİNE ATILIYOR VE ORDAN DA VERİTABANINA
            // SECONDDETAİL KISMINA YAZILIYOR BU SAYEDE 1. VE 2. VERİ ELDE EDİLMİŞ OLUYOR
            // DAHA SONRA VERİLEN TARİH, TARİH ARALIĞI VEYA GÜN SAYISI İÇERİSİNDE VERİ EŞLEŞİRSE
            // ORADA KÖK OLUP OLMADIĞINI ANLAYACAĞIZ
            // BUNU YA İLK GELEN SENSOR NEM DATASI İLE BİRLİKTE HESAPLAYIP FİRSTDETAİL' E YAZIP DAHA SONRA
            // BELİRLİ ZAMANLARDA EŞLEŞEN KISIMLARI 2. TABLOYA YAZIP FRONTENDE ORADAN AKTARACAĞIZ
            // DETECTROOT FONKSIYONUNA SECONDDETAİL VE FİRSTDETAİL DATALARINI ATARIZ
            // AMA ÖNCE FİRST DETAİL DATALARINI OLUŞTURMAMIZ GEREKİYOR HALİYLE
            // DAHA SONRA SENSORDATAS KISIMLARINI KARŞILAŞTIRIP (SECOND VE FİRST İÇİN)
            // EĞER DATALAR STANDART SAPMA PAYI KADAR (+-%5-10 ARASINDA) EŞLEŞİYORSA O EŞLEŞEN İNDEXTE Kİ DATAYI SECONDA YAZACAĞIZ VE ÇOK KÖK(KÖKVAR) DİYECEĞİZ
            // EŞLEŞMEYİ YAKALADIKÇA SECONDDETAİL ARRAYİNE YAZIP VERİTABANINA ATACAĞIZ
            // BELİRLİ ZAMAN ARALIĞINDA TOPLADIĞIMIZ KÖK VERİLERİ(ZAMANI T İLE İFADE EDİYORUZ) HER ZAMAN GELEN HER DATAYI SULAMA SONRASI EN YÜKSEK İLK DEĞERDEN ÇIKARIYORUZ
            // DAHA SONRA BU ÇIKARDIĞIMIZ DEĞERLERİN ORTALAMASINI BULUYORUZ VE BU DEĞERLERİN ORTALAMAYA OLAN SAYISAL UZAKLIKLARINA GÖRE SINIFLANDIRIYORUZ
            // BU VERİLER ORTALAMA ŞUAN İÇİN 7 GÜNLÜK GELMELİDİR. FAKAT SİSTEM OTOMATIK OLARAK 30 DK DA BİR BU VERILERI TOPLAYACAKTIR.
            // ORTALAMASINI BULDUĞUMUZ VERİ BİZİM İÇİN MUTLAK NOKTADIR. WEB UI SMARTROOT KISMINDA GÖSTERECEĞİMİZ VERİLER BU NOKTAYA GÖRE ŞEKİL ALIRLAR.
            // VERİLER SADECE SMARTROOTDETAILSECOND'DAN DEĞİL ARTIK SMARTROOTCLASSIFICATION ILE BIRLIKTE GELECEKTIR.
            // BUTUN VERILERE EK OLARAK DTO YU DONDUGUMUZ NOKTADA SPREAD OPERATOR ILE BIRLIKTE ILGILI SISTEMIN SON 7 GÜNLÜK SMARTROOTCLASSIFICATION BİLGİSİNİ DÖNECEĞİZ.
            for (let i = 0; i < root.SensorDatas.length; i++) {
              for (let j = 0; j <= i; j++) {
                // deltaData += Number(root.SensorDatas[j]) * 1.1;
                deltaTime += Date.parse(
                  root.lastChangedDateTime.toLocaleDateString(),
                );
                // lastChangeDataArray.push(deltaData.toString());
                lastChangeDataArray.push(Number(root.SensorDatas[j]) * 1.1);
                deltaData += Number(root.SensorDatas[j]);
              }
            }
            // BÜTÜN SENSÖR VERİLERİNİN ARİTMETİK ORTALAMASINI ALIYORUZ.
            deltaData /= lastChangeDataArray.length;

            // BÜYÜKTEN KÜÇÜĞE SIRALADIĞIMIZ VERİLERİN BÜYÜKTEN KÜÇÜĞE FARK VE ORANLARINI BULUP DEPOLAYACAĞIMIZ VE SINIFLANDIRMA İÇİN YAZACAĞIMIZ LİSTE
            let dataRateByGreaterThan = Array<Number>();
            let total = 0;
            // SENSÖR VERİLERİNİ BÜYÜKTEN KÜÇÜĞE SIRALIYORUZ
            lastChangeDataArray = lastChangeDataArray.sort((prev, next) =>
              prev > next ? -1 : 1,
            );
            // VERİLERİN BÜYÜKTEN KÜÇÜĞE DOĞRU FARKLARINI BULDUK
            for (let index = 1; index <= lastChangeDataArray.length; index++) {
              dataRateByGreaterThan.push(
                lastChangeDataArray[index] - lastChangeDataArray[0],
              );
            }
            lastChangeDataArray.push(deltaData);
            // ŞİMDİ ORANLARINI BULACAĞIZ VE SINIFLANDIRMA TABLOSUNA YAZACAĞIZ
            let dataRateByNumber = Array<Number>();
            let classificationRate = Array<Number>();
            for (let index = 0; index < dataRateByGreaterThan.length; index++) {
              total += Number(dataRateByGreaterThan[index]);
            }
            // ORANLARIN ORTALAMASINI BULDUK VE MUTLAK ORANI ELDE ETTİK
            total /= dataRateByGreaterThan.length;
            // ŞİMDİ İSE dataRateByGreaterThan ADLI ARRAYDE Kİ VERİLERİN MUTLAK ORANA OLAN YÜZDESEL UZAKLIĞINI ÖLÇECEĞİZ.
            let lastRate = 0;
            for (let index = 0; index < dataRateByGreaterThan.length; index++) {
              // HER BİR VERİNİN MUTLAK ORANA OLAN YÜZDESEL UZAKLIĞINI DA BULDUK ŞİMDİ BUNLARI SINIFLAYACAĞIZ.
              // YÜZDESEL OLARAK 100 ÜZERİNDEN 5 PAYDAYA BÖLÜP YÜZDELİK ARALIKLARINA GÖRE SINIFLIYORUZ
              lastRate = (total * Number(dataRateByGreaterThan[index])) / 100;
              if (lastRate < lastRate * 0.2) {
                classificationRate.push(1);
              }
              if (lastRate < lastRate * 0.4 && lastRate > lastRate * 0.2) {
                classificationRate.push(2);
              }

              if (lastRate < lastRate * 0.6 && lastRate > lastRate * 0.4) {
                classificationRate.push(3);
              }

              if (lastRate < lastRate * 0.8 && lastRate > lastRate * 0.6) {
                classificationRate.push(4);
              }

              if (lastRate > lastRate * 0.8) {
                classificationRate.push(5);
              }

              dataRateByNumber.push(lastRate);
            }
            let lastChangeDataArrayStr = [];
            let classificationRateStr = [];
            lastChangeData.map((x) => {
              lastChangeDataArrayStr.push(x.toString());
            });
            //  BURADA İSE SINIFLANDIRILMIŞ VERİYİ VERİTABANINA KAYDEDİYORUZ.
            classificationRate.map((x) => {
              classificationRateStr.push(x.toString());
            });
            await this.smartRootClassificationService.create({
              contentId: '',
              createdAt: new Date(),
              GatewayID: '',
              isDeleted: false,
              lastChangedDateTime: new Date(),
              SensorClasses: classificationRateStr,
              SensorDatas: lastChangeDataArrayStr,
              Sensors: root.Sensors,
              SmartRootID: root.SmartRootID,
              updatedAt: new Date(),
            });

            for (let index = 0; index < lastChangeDataArray.length; index++) {
              const element = lastChangeDataArray[index];
            }

            const firstResult = await this.smartRootDetailFirstService.create({
              createdAt: new Date(),
              isDeleted: false,
              SensorDatas: lastChangeDataArrayStr,
              lastChangedDateTime: new Date(),
              Sensors: root.Sensors,
              SmartRootID: root.SmartRootID,
              updatedAt: new Date(),
              contentId: '',
            });

            const detectResult = this.detectExistsRoot(firstResult);
            if (detectResult) {
              /// BURADA KÖKLER SON 7 GÜNDE EŞLEŞİYOR ONA GÖRE BİR DATA RETURN EDİP İŞLEM YAPMALIYIZ
              const recordSecond =
                await this.smartRootDetailSecondService.create({
                  createdAt: new Date(),
                  isDeleted: false,
                  SensorDatas: firstResult.SensorDatas,
                  lastChangedDateTime: new Date(),
                  Sensors: firstResult.Sensors,
                  SmartRootID: firstResult.SmartRootID,
                  updatedAt: new Date(),
                  contentId: '',
                });
              // return await this.smartRootDetailSecondService.getBySmartRoot(
              //   root.contentId,
              // );
            }
            // return await this.smartRootDetailSecondService.getBySmartRoot(
            //   root.contentId,
            // );
            /// EĞER İF İÇERİSİNE GİRMEZSE KÖKLER SON 7 GÜNDE DATA OLARAK EŞLEŞMİYORDUR ONA GÖRE VERİ DÖNMEMİZ GEREKİR.
          });

          //lastChangeData = deltaData / deltaTime;
        });
      });
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  public async detectExistsRoot(smartRootDetailFirst: SmartRootDetailFirstDTO) {
    let finalSensorDataSecond = Array<string>();
    let exists = false;
    const getSmartRoot = await (
      await this.smartRootDetailSecondService.getAll()
    ).filter((x) => x.contentId === smartRootDetailFirst.contentId);

    getSmartRoot.forEach((element, index) => {
      element.SensorDatas[index] === smartRootDetailFirst.SensorDatas[index]
        ? (exists = true)
        : (exists = false);
      if (exists) {
        finalSensorDataSecond.push(element.SensorDatas[index]);
      } else {
        finalSensorDataSecond.push('0');
      }
    });

    return finalSensorDataSecond;
  }

  public async writeLog() {}

  public async calculateFirst(sensorData: number, sensorTime: Date, sensor) {}

  public async calculateSecond() {}
}
