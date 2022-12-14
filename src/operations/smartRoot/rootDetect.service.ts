import { Injectable, Logger } from '@nestjs/common';
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
export class RootDetect {
  private readonly logger = new Logger(RootDetect.name);

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
      // B??R SENS??RE A??T TOPLAM DATANIN DELTA DE??ER?? VE DELTA ZAMAN DE??ER??N??N B??L??M?? B??ZE
      // TOPLAM DE????????M??N Y??ZDEL??K C??NS??NDEN DE??ER??N?? VER??R
      let deltaData = 0;
      let deltaTime;
      let lastChangeData = [];
      let lastChangeDataArray = Array<number>();
      // ??NCE GATEWAYLER?? L??STEL??YORUZ VE GATEWAYE BA??LI WORKGROUPLARI DAHA SONRA
      // WORKGROUPLARINA BA??LI OLAN VALVECARDSLARI ??EK??YORUZ
      // VALVECARDSLARDA ??SOPEN FALSE OLAN YAN?? KAPALI DURUMDA OLAN VANALAR ??LE SMARTROOT ????LEMLER??M??Z?? YAPACA??IZ
      gateways.forEach(async (gateway) => {
        console.log(gateway.contentId);
        const vorkgrup = await this.workGroupService.getByGateway(
          gateway.contentId,
        );
        vorkgrup.map((x) => workGroups.push(x));

        workGroups.map(async (workGroup) => {
          // VANA KARTLARIMIZI ALDIK VE ISOPEN===FALSE YANI KAPALI OLANLARI F??LTRELEY??P ??EKT??K.
          var vanaKartlar?? = await this.valveCardsService.getByWorkGroup(
            workGroup.contentId,
          );
          vanaKartlar??.map((x) => {
            if (!x.IsOpen) {
              console.log('bu vana kapal??');
              this.logger.warn(`${x.Name} isimli vana kapal??`);
              valveCards.push(x);
            }
          });
        });
        // ??LK BA??TA B??T??N WORKGROUPLARI ALMI??TIK FAKAT B??ZE SADECE VANASI KAPALI OLANLAR LAZIMDI
        // O Y??ZDEN VANALARI KAPALI OLANLARI ALDIKTAN SONRA. KAPALI OLAN VANALARIN BA??LI OLDU??U WORKGROUPLARI ??EKT??K
        // AYRI AYRI WORKGROUPSDTO REFERANSI ALMAMAK ICIN BURADA WORKGROUPS GENERIC ARRAYI BOSALTIYORUZ.
        workGroups = [];
        setTimeout(() => {
          if (valveCards.length > 0) {
            valveCards.forEach(async (fun) => {
              this.logger.verbose(`${fun.Name} adl?? vana kart?? i??leniyor.`);
              workGroups.push(await this.workGroupService.get(fun.WorkGroupID));
            });
          } else {
            this.logger.error(`Work Groups not found`);
          }
          this.logger.warn(`${gateway.Name} adl?? gatewayde sulama yap??lm??yor.`);
          if (workGroups.length > 0) {
            workGroups.forEach(async (len) => {
              const gateClo = await this.gatewayService.get(len.GatewayID);
              gatewayClosed.push(gateClo);
            });
          } else {
            this.logger.warn(
              `${gateway.Name} adl?? gatewayde sulama yap??lm??yor.`,
            );
          }
        }, 2500);

        // ARTIK ELIMIZDE VANASI KAPALI OLAN VE SMARTROOT ??????N ????LEMLER YAPAB??LECE????M??Z WORKGROUPLAR VAR
        // ??IMDI ISE BU WORK GROUPLARIN BA??LI OLDU??U GATEWAYLER?? BULACA??IZ.
        // ????NK?? SMARTROOTLAR GATEWAYLERE BA??LI B??R ??N??TED??R.
        // YAN??, VANASI KAPANMI?? OLAN WORKGROUP-GATEWAYLERE BA??LI SMARTROOTLARI ELDE ETM???? OLACA??IZ
        // BURADA GATEWAY GENER??C ARRAYINI SIFIRLAYAMIYORUZ ????NK?? HALA ONA A??T D??NG??N??N ????ER??S??NDEY??Z.

        // ARTIK BU GATEWAYLARI DE ALDI??IMIZA G??RE ????MD?? SMARTROOTLARLA ??ALISMAYA BA??LAYAB??L??R??Z. 01bd7493-fa91-47be-a9b5-8cd83ed9208a
        // BUNUDA BASKA B??R PROCESS D??NG??S??NDE YAPACA??IZ.
      });

      // VANASI KAPALI OLAN GATEWAYLERE G??RE SMARTROOTLARIMIZI ALIYORUZ
      // VANASI KAPALI OLANLARI ALMAMIZIN SEBEB??, D????EY NEM HAREKETLER??N?? ??NCELEYECEK OLMAMIZ.
      // SMARTROOTDETAILFIRST SENSORLERDEN TOPLANAN VER??LERD??R
      // SON 1 VE 2. VER?? WEB PANELDE K?? SMARTROOT 1.VER?? VE SMARTROOT 2.VER?? OLARAK YER ALMAKTADIR
      // SMARTROOTSDETAILSECOND ??SE HER B??R SENS??RDE K?? K??K TESP??T?? ??????N KULLANILACAK MATEMATKSEL FORMULDE KI VERILERIN TUTULDU??U
      // VE TEKRAR UI TARAFINA ??EKILDIGI TABLODUR.
      // BU YUZDENDIR K?? SENS??RLERDEN VER??LER?? TOPLAYIP FIRST TABLOSUNA, VERILERI ISLEDIKTEN SONRA SECOND TABLOSUNA YAZACA??IZ
      // BELIRLI PAREMETRELERE G??RE SECOND TABLOSUNDA ISLENMIS VERILER ILE KARSILASTIRDIKTAN SONRA ORADA KOK OLUP OLMADIGINI BULACAGIZ

      setTimeout(() => {
        gatewayClosed.forEach(async (gateway) => {
          this.logger.verbose(`${gateway.Name} adl?? gateway i??leniyor.`);
          const gatewData = await this.smartRootService.getByGateway(
            gateway.contentId,
          );
          gatewData.map((gate) => smartRoot.push(gate));

          smartRoot.forEach(async (smart) => {
            const smtData =
              await this.smartRootDetailFirstService.getBySmartRoot(
                smart.contentId,
              );
            smtData.map((sm) => smartRootDetailFirst.push(sm));

            // SENSOR DATALARINI B??Y??KTEN K????????E SIRALAR
            // BU NOKTADA HER B??R SENS??RDE 32 VER?? VAR VE 32 SENS??R??NDE TEK TEK VER??LER??N??N ALINIP ????LENMES?? GEREK
            // BU Y??ZDEN SENSORDATAS ??????N AYRI B??R D??NG??SEL ????LEM YAPMAN GEREK??YOR.
            smartRootDetailFirst.forEach(async (root, index) => {
              root.SensorDatas = root.SensorDatas.sort((previous, next) =>
                previous > next ? -1 : 1,
              );
              // BU D??NG??DE 32 VER??N??N STANDART SAPMA DAH??L ED??LM???? HAL?? ALINIYOR
              // 32 SENSORDEN GELEN HER B??R DATA O DELTADATA DE??????KEN??NE YAZILIYOR
              // DAHA SONRA LASTCHANGEDATARRAY L??STES??NE ATILIYOR VE ORDAN DA VER??TABANINA
              // SECONDDETA??L KISMINA YAZILIYOR BU SAYEDE 1. VE 2. VER?? ELDE ED??LM???? OLUYOR
              // DAHA SONRA VER??LEN TAR??H, TAR??H ARALI??I VEYA G??N SAYISI ????ER??S??NDE VER?? E??LE????RSE
              // ORADA K??K OLUP OLMADI??INI ANLAYACA??IZ
              // BUNU YA ??LK GELEN SENSOR NEM DATASI ??LE B??RL??KTE HESAPLAYIP F??RSTDETA??L' E YAZIP DAHA SONRA
              // BEL??RL?? ZAMANLARDA E??LE??EN KISIMLARI 2. TABLOYA YAZIP FRONTENDE ORADAN AKTARACA??IZ
              // DETECTROOT FONKSIYONUNA SECONDDETA??L VE F??RSTDETA??L DATALARINI ATARIZ
              // AMA ??NCE F??RST DETA??L DATALARINI OLU??TURMAMIZ GEREK??YOR HAL??YLE
              // DAHA SONRA SENSORDATAS KISIMLARINI KAR??ILA??TIRIP (SECOND VE F??RST ??????N)
              // E??ER DATALAR STANDART SAPMA PAYI KADAR (+-%5-10 ARASINDA) E??LE????YORSA O E??LE??EN ??NDEXTE K?? DATAYI SECONDA YAZACA??IZ VE ??OK K??K(K??KVAR) D??YECE????Z
              // E??LE??MEY?? YAKALADIK??A SECONDDETA??L ARRAY??NE YAZIP VER??TABANINA ATACA??IZ
              // BEL??RL?? ZAMAN ARALI??INDA TOPLADI??IMIZ K??K VER??LER??(ZAMANI T ??LE ??FADE ED??YORUZ) HER ZAMAN GELEN HER DATAYI SULAMA SONRASI EN Y??KSEK ??LK DE??ERDEN ??IKARIYORUZ
              // DAHA SONRA BU ??IKARDI??IMIZ DE??ERLER??N ORTALAMASINI BULUYORUZ VE BU DE??ERLER??N ORTALAMAYA OLAN SAYISAL UZAKLIKLARINA G??RE SINIFLANDIRIYORUZ
              // BU VER??LER ORTALAMA ??UAN ??????N 7 G??NL??K GELMEL??D??R. FAKAT S??STEM OTOMATIK OLARAK 30 DK DA B??R BU VERILERI TOPLAYACAKTIR.
              // ORTALAMASINI BULDU??UMUZ VER?? B??Z??M ??????N MUTLAK NOKTADIR. WEB UI SMARTROOT KISMINDA G??STERECE????M??Z VER??LER BU NOKTAYA G??RE ??EK??L ALIRLAR.
              // VER??LER SADECE SMARTROOTDETAILSECOND'DAN DE????L ARTIK SMARTROOTCLASSIFICATION ILE BIRLIKTE GELECEKTIR.
              // BUTUN VERILERE EK OLARAK DTO YU DONDUGUMUZ NOKTADA SPREAD OPERATOR ILE BIRLIKTE ILGILI SISTEMIN SON 7 G??NL??K SMARTROOTCLASSIFICATION B??LG??S??N?? D??NECE????Z.
              for (let i = 1; i < 32; i++) {
                for (let j = 1; j <= i; j++) {
                  // deltaData += Number(root.SensorDatas[j]) * 1.1;
                  deltaTime = Date.parse(
                    root.lastChangedDateTime.toLocaleDateString(),
                  );
                  // lastChangeDataArray.push(deltaData.toString());
                  var value = Number(root.SensorDatas[i]) * 1.1;
                  lastChangeDataArray.push(value);
                  deltaData += Number(root.SensorDatas[i]);
                }
              }
              // B??T??N SENS??R VER??LER??N??N AR??TMET??K ORTALAMASINI ALIYORUZ.
              console.log(
                'B??T??N SENS??R VER??LER??N??N AR??TMET??K ORTALAMASINI ALIYORUZ.',
              );
              this.logger.verbose(
                `${smart.Name} adl?? SmartRoot Kurulumuna ait verilerin aritmetik ortalamas?? al??n??yor.`,
              );
              deltaData /= lastChangeDataArray.length;

              // B??Y??KTEN K????????E SIRALADI??IMIZ VER??LER??N B??Y??KTEN K????????E FARK VE ORANLARINI BULUP DEPOLAYACA??IMIZ VE SINIFLANDIRMA ??????N YAZACA??IMIZ L??STE
              // console.log(
              //   'B??Y??KTEN K????????E SIRALADI??IMIZ VER??LER??N B??Y??KTEN K????????E FARK VE ORANLARINI BULUP DEPOLAYACA??IMIZ VE SINIFLANDIRMA ??????N YAZACA??IMIZ L??STE',
              // );
              this.logger.verbose(
                `${smart.Name} adl?? SmartRoot Kurulumuna ait veriler b??y??kten k????????e s??ralan??yor, fark ve oranlar?? bulunuyor.`,
              );

              let dataRateByGreaterThan = Array<Number>();
              let total = 0;
              // SENS??R VER??LER??N?? B??Y??KTEN K????????E SIRALIYORUZ
              console.log('SENS??R VER??LER??N?? B??Y??KTEN K????????E SIRALIYORUZ');
              this.logger.verbose(
                `${smart.Name} adl?? SmartRoot verileri b??y??kten k????????e s??ralan??p tepe noktas?? belirleniyor.`,
              );

              lastChangeDataArray = lastChangeDataArray.sort((prev, next) =>
                prev > next ? -1 : 1,
              );
              // VER??LER??N B??Y??KTEN K????????E DO??RU FARKLARINI BULDUK
              // console.log('VER??LER??N B??Y??KTEN K????????E DO??RU FARKLARINI BULDUK');
              this.logger.verbose(
                `${smart.Name} adl?? SmartRoot Kurulumuna ait verilerin aritmetik ortalamas?? al??n??yor.`,
              );

              // for (
              //   let index = 1;
              //   index <= lastChangeDataArray.length;
              //   index++
              // ) {
              //   let val = 0;
              //   val = lastChangeDataArray[index] - lastChangeDataArray[0];
              //   dataRateByGreaterThan.push(val);
              // }
              lastChangeDataArray.map((val, index) => {
                let lastData = 0;
                lastData = lastChangeDataArray[0] - val;
                dataRateByGreaterThan.push(lastData);
              });
              lastChangeDataArray.push(deltaData);

              // ????MD?? ORANLARINI BULACA??IZ VE SINIFLANDIRMA TABLOSUNA YAZACA??IZ
              // console.log(
              //   '????MD?? ORANLARINI BULACA??IZ VE SINIFLANDIRMA TABLOSUNA YAZACA??IZ',
              // );
              this.logger.verbose(
                `${smart.Name} adl?? SmartRoot Kurulumuna ait verilerin aritmetik ortalamas?? al??nd??. Oranlar?? bulup s??n??fland??rma tablosuna yazaca????z.`,
              );

              let dataRateByNumber = Array<Number>();
              let classificationRate = Array<Number>();
              // for (
              //   let index = 0;
              //   index < dataRateByGreaterThan.length;
              //   index++
              // ) {
              //   total += parseFloat(dataRateByGreaterThan[index].toString());
              // }

              dataRateByGreaterThan.map((val, index) => {
                total += Number(val);
              });
              // ORANLARIN ORTALAMASINI BULDUK VE MUTLAK ORANI ELDE ETT??K
              // console.log(
              //   'ORANLARIN ORTALAMASINI BULDUK VE MUTLAK ORANI ELDE ETT??K',
              // );

              total = total / 32;
              this.logger.verbose(
                `${smart.Name} adl?? SmartRoot Kurulumuna ait verilerin mutlak oran?? elde edildi: ${total}.`,
              );

              // ????MD?? ??SE dataRateByGreaterThan ADLI ARRAYDE K?? VER??LER??N MUTLAK ORANA OLAN Y??ZDESEL UZAKLI??INI ??L??ECE????Z.
              // console.log(
              //   '????MD?? ??SE dataRateByGreaterThan ADLI ARRAYDE K?? VER??LER??N MUTLAK ORANA OLAN Y??ZDESEL UZAKLI??INI ??L??ECE????Z.',
              // );
              this.logger.verbose(
                `${smart.Name} adl?? SmartRoot Kurulumuna ait verilerin mutlak orana olan uzakl??klar?? ??l????lecek.`,
              );

              let lastRate = 0;
              // for (
              //   let index = 0;
              //   index < dataRateByGreaterThan.length;
              //   index++
              // ) {

              //   //dataRateByNumber.push(lastRate);
              // }
              dataRateByGreaterThan.map((val, index) => {
                // HER B??R VER??N??N MUTLAK ORANA OLAN Y??ZDESEL UZAKLI??INI DA BULDUK ????MD?? BUNLARI SINIFLAYACA??IZ.
                // Y??ZDESEL OLARAK 100 ??ZER??NDEN 5 PAYDAYA B??L??P Y??ZDEL??K ARALIKLARINA G??RE SINIFLIYORUZ
                // console.log(
                //   'HER B??R VER??N??N MUTLAK ORANA OLAN Y??ZDESEL UZAKLI??INI DA BULDUK ????MD?? BUNLARI SINIFLAYACA??IZ.',
                // );
                // this.logger.verbose(`${smart.Name} adl?? SmartRoot Kurulumuna ait veriler s??n??flan??yor. ${dataRateByGreaterThan.length}`);
                // if(index==5){
                //   exit(1);
                // }
                lastRate = (total * Number(val)) / 100;
                if (lastRate < lastRate * 1.2) {
                  //    this.logger.debug(`En az  ??l??ekte k??k var`)
                  classificationRate.push(1);
                }
                if (lastRate < lastRate * 1.4 && lastRate > lastRate * 1.2) {
                  //     this.logger.debug(`Az ??l??ekte k??k var`)
                  classificationRate.push(2);
                }

                if (lastRate < lastRate * 1.6 && lastRate > lastRate * 1.4) {
                  //    this.logger.debug(` Orta ??l??ekte k??k var`)
                  classificationRate.push(3);
                }

                if (lastRate < lastRate * 1.8 && lastRate > lastRate * 1.6) {
                  //     this.logger.debug(` ??ok ??l??ekte k??k var`)
                  classificationRate.push(4);
                }

                if (lastRate > lastRate * 1.8) {
                  //    this.logger.debug(` En ??ok k??k b??lgesi`)
                  classificationRate.push(5);
                } else {
                  classificationRate.push(3);
                }
                if (dataRateByGreaterThan.length == index) {
                  return index;
                }
              });
              let lastChangeDataArrayStr = Array<string>();
              let classificationRateStr = [];
              lastChangeDataArray.map((x) => {
                lastChangeDataArrayStr.push(x.toString());
              });
              this.logger.warn('String array:', classificationRate.length);
              lastChangeDataArray = [];
              //  BURADA ??SE SINIFLANDIRILMI?? VER??Y?? VER??TABANINA KAYDED??YORUZ.
              classificationRate.map((x) => {
                classificationRateStr.push(x.toString());
              });
              try {
                const resultRecord =
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
                if (resultRecord.GatewayID) {
                  this.logger.error('ba??ar??l??!!!');
                }
              } catch (error) {
                console.log(error);
                throw new Error(error);
              }
              this.logger.verbose(
                `${smart.Name} adl?? SmartRoot Kurulumuna ait veriler s??n??fland?? ve kaydediliyor.`,
              );

              // for (let index = 0; index < lastChangeDataArray.length; index++) {
              //   const element = lastChangeDataArray[index];
              // }

              // const firstResult = await this.smartRootDetailFirstService.create(
              //   {
              //     createdAt: new Date(),
              //     isDeleted: false,
              //     SensorDatas: lastChangeDataArrayStr,
              //     lastChangedDateTime: new Date(),
              //     Sensors: root.Sensors,
              //     SmartRootID: root.SmartRootID,
              //     updatedAt: new Date(),
              //     contentId: '',
              //   },
              // );

              // const detectResult = this.detectExistsRoot(firstResult);
              // if (detectResult) {
              //   /// BURADA K??KLER SON 7 G??NDE E??LE????YOR ONA G??RE B??R DATA RETURN ED??P ????LEM YAPMALIYIZ
              //   const recordSecond =
              //     await this.smartRootDetailSecondService.create({
              //       createdAt: new Date(),
              //       isDeleted: false,
              //       SensorDatas: firstResult.SensorDatas,
              //       lastChangedDateTime: new Date(),
              //       Sensors: firstResult.Sensors,
              //       SmartRootID: firstResult.SmartRootID,
              //       updatedAt: new Date(),
              //       contentId: '',
              //     });
              //   // return await this.smartRootDetailSecondService.getBySmartRoot(
              //   //   root.contentId,
              //   // );
              // }
              // return await this.smartRootDetailSecondService.getBySmartRoot(
              //   root.contentId,
              // );
              /// E??ER ??F ????ER??S??NE G??RMEZSE K??KLER SON 7 G??NDE DATA OLARAK E??LE??M??YORDUR ONA G??RE VER?? D??NMEM??Z GEREK??R.
            });

            //lastChangeData = deltaData / deltaTime;
          });
        });
      }, 2500);
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
