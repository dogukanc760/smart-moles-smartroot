import { HttpException, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Gateway } from 'src/model/Gateway/gateway.entity';
import { SensorCards } from 'src/model/WorkGroup/Sensors/sensorCards.entity';
import { WorkGroup } from 'src/model/WorkGroup/workGroup.entity';
import { SendMailService } from 'src/operations/mailer/mailer.service';
import { GatewayDTO } from 'src/units/gateway/gateway.dto';
import { GatewayService } from 'src/units/gateway/gateway.service';
import { GatewayLogsService } from 'src/units/gateway/gatewayLogs/gatewayLogs.service';
import { SensorCalibrationLogsService } from 'src/units/workGroup/sensors/sensorCalibrationLogs/sensorCalibrationLog.service';
import { SensorCardLogsService } from 'src/units/workGroup/sensors/sensorCardLogs/sensorCardLogs.service';
import { SensorCardParamsService } from 'src/units/workGroup/sensors/sensorCardParams/sensorCardParams.service';
import { SensorCardsDTO } from 'src/units/workGroup/sensors/sensorCards/sensorCards.dto';
import { SensorCardsService } from 'src/units/workGroup/sensors/sensorCards/sensorCards.service';
import { SensorMoistureLogService } from 'src/units/workGroup/sensors/sensorMoistureLogs/sensorMoistureLog.service';
import { WorkGroupDTO } from 'src/units/workGroup/workGroup/workGroup.dto';
import { WorkGroupService } from 'src/units/workGroup/workGroup/workGroup.service';
import { WorkGroupLogsService } from 'src/units/workGroup/workGroupLogs/workGroupsLog.service';
import { Repository } from 'typeorm';

@Injectable()
export class ManuelValveWorkerService {
  constructor(
    private readonly gatewayService: GatewayService,
    private readonly gatewayLogService: GatewayLogsService,
    private readonly sensorCardService: SensorCardsService,
    private readonly workGroupService: WorkGroupService,
    private readonly workGroupLogService: WorkGroupLogsService,
    private readonly sensorMoistureLogService: SensorMoistureLogService,
    private readonly sensorCalibrationLogService: SensorCalibrationLogsService,
    private readonly sensorCardParamsService: SensorCardParamsService,
    private readonly sensorLogService: SensorCardLogsService,
    private readonly mailerService: SendMailService,
  ) {}

  private readonly logger = new Logger(ManuelValveWorkerService.name);

  // GATEWAYLERE BA??LANIRKEN WORKER VEYA CONNECTTOGATEWAYANDPROCESS ????ER??S??NDE FONKS??YONLARI B??RB??R??NE BA??LA!

  // --------------------------------------------- KR??T??K NOKTALARDA MA??L G??NDERMEY?? UNUTMA !!!!!!!! ----------------------------

  public async Worker() {
    // Gateway ba??lant?? ad??m??
    await this.connectToGatewayAndProcess();
  }

  public async process(processNumber: Number) {
    switch (processNumber) {
      case 1:
        this.connectToGatewayAndProcess();
        break;

      default:
        break;
    }
  }

  
  public async connectToGatewayAndProcess() {
    try {
      this.logger.verbose('PROCESS HAS BEEN STARTED');
      const gateways = await this.gatewayService.getAll();

      await gateways.map(async (element) => {
        //connect to gateway for each a element on this lines

        const resultMoisture = await this.readMoisture(
          element.contentId,
          element.ServerIP,
          element.ServerPort,
          element,
        );
        if (resultMoisture) {
          this.logger.verbose(
            `${element.Name} ISIMLI GATEWAY NEM VERISI OKUMA ????LEM?? BA??ARILI!`,
          );
        }

        const resultDate = await this.readDateAndTime(
          element.contentId,
          element.ServerIP,
          element.ServerPort,
          element,
        );
        if (resultDate) {
          this.logger.verbose(
            `${element.Name} ISIMLI GATEWAY TAR??H SAAT OKUNMA ????LEM?? BA??ARILI!`,
          );
        }
      });

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  // TAR??H VE ZAMAN OKUNDUKTAN SONRA DB'DE KAYITLI OLAN TAR??H VE ZAMAN ARALI??INDA ??SE (T??MER LI Y??NETIMDE GE??ERLI)
  // ??ALI??MA ZAMAN ARALI??INDADIR D??Y??P B??LG?? LOGU ATMALI
  async readDateAndTime(
    contentId: string,
    serverIP: string,
    port: string,
    gateways: GatewayDTO,
  ) {
    try {
      this.logger.verbose('TARIH OKUNUYOR');
      //get request for date and time by gateway
      //after go typeorm and update target gateways 'updatedAt' property
      // okunan tarih updatedAt, huba g??nderilen tarih lastChangedAt ' e yaz??l??r
      // ??uan karta ba??l?? olmad??????m??z i??in ??uan??n tarihini yaz??yoruz.
      gateways.updatedAt = new Date();

      const workGroups = await this.workGroupService.getByGateway(
        gateways.contentId,
      );

      //return false;

      workGroups.forEach((element) => {
        if (element.WorkType == 'MANUEL') {
          // burada e??er manuel ise saat tarih okumak i??in karta ba??lan??p i??lemleri yapaca????z.
          this.logger.verbose(
            `${element.Name} ISIMLI GATEWAY BA??LANTISI SA??LANDI!`,
          );
          // karta ba??lant??m??z olmad?????? i??in varsay??msal olarak kodluyoruz.
          const gatewayEntity = new GatewayDTO();
          gatewayEntity.GatewayIP = gateways.GatewayIP;
          gatewayEntity.GatewayPort = gateways.GatewayPort;
          gatewayEntity.isDeleted = gateways.isDeleted;
          gatewayEntity.Lang = gateways.Lang;
          gatewayEntity.Lat = gateways.Lat;
          gatewayEntity.Name = gateways.Name;
          gatewayEntity.SalesID = gateways.SalesID;
          gatewayEntity.ServerIP = gateways.ServerIP;
          gatewayEntity.ServerPort = gateways.ServerPort;
          gatewayEntity.TelitClientPort = gateways.TelitClientPort;
          gatewayEntity.UserID = gateways.UserID;

          const updated = this.gatewayService.update(gateways.contentId, gatewayEntity);
          if (updated) {
            this.logger.verbose(
              `${element.Name} ISIMLI GATEWAY TAR??H SAAT OKUNMA ????LEM?? BA??ARILIa!`,
            );
            this.gatewayLogService.create({
              GatewayID: contentId,
              LogContent: `${contentId}'li ${gateways.Name}'li Gateway Tarih Saat Okuma ????lemi Ba??ar??l??!`,
              LogDescription: `${gateways.Name} Ba??lant?? Sa??land?? ve Tarih Saat Okundu`,
              LogTitle: `${gateways.Name} Rutin ????lemler`,
              LogStatus: 'Success',
              contentId: '',
              createdAt: new Date(),
              isDeleted: false,
              lastChangedDateTime: new Date(),
              updatedAt: new Date(),
            });
            return true;
          }
          this.logger.error(
            `${element.Name} ISIMLI GATEWAY TAR??H SAAT OKUNMA ????LEM?? BA??ARISIZ!!!`,
          );
          this.gatewayLogService.create({
            GatewayID: contentId,
            LogContent: `${contentId}'li ${gateways.Name}'li Gateway Tarih Saat Okuma ????lemi Ba??ar??s??z!`,
            LogDescription: `${gateways.Name} Tarih ve Saat Okuma ????lemi Ba??ar??s??z.`,
            LogTitle: `${gateways.Name} Rutin ????lemler`,
            LogStatus: 'Failed',
            contentId: '',
            createdAt: new Date(),
            isDeleted: false,
            lastChangedDateTime: new Date(),
            updatedAt: new Date(),
          });
          return false;
        }
        this.workGroupLogService.create({
          WorkGroupID: element.contentId,
          LogContent: `${contentId}'li ${element.Name}'li Sulama Grubu Manuel Y??netime G??re De??il!`,
          LogDescription: `${element.Name} Ba??lant?? Sa??land??`,
          LogTitle: `${element.Name} Rutin ????lemler`,
          LogStatus: 'Success',
          contentId: '',
          createdAt: new Date(),
          isDeleted: false,
          lastChangedDateTime: new Date(),
          updatedAt: new Date(),
        });
        this.logger.error(
          `${element.Name} ISIMLI GATEWAY MANUEL YONETIME GORE DEGIL!!!`,
        );
        return false;
      });
    } catch (error) {
      console.log(error);
      this.gatewayLogService.create({
        GatewayID: contentId,
        LogContent: `${contentId}'li ${gateways.Name}'li Gateway Tarih Saat Okuma ????lemi Ba??ar??s??z!`,
        LogDescription: `${gateways.Name} Gateway hata i??eri??i => ${error}`,
        LogTitle: `${gateways.Name} Rutin ????lemler`,
        LogStatus: 'Failed',
        contentId: '',
        createdAt: new Date(),
        isDeleted: false,
        lastChangedDateTime: new Date(),
        updatedAt: new Date(),
      });
      this.logger.error(
        `${gateways.Name} ISIMLI GATEWAY TAR??H SAAT OKUNMA ????LEM?? BA??ARISIZ!!!`,
      );
      return false;
    }
  }

  // NEM VER??S?? GELD??KTEN SONRA E??ER T??MERDAYSA NEM VER??S??NE GEREK YOK ????NK?? ??ALISMA PLANI BELL??
  // FAKAT SENS??RE G??RE VEYA NEM SEV??YES?? VS G??RE Y??NET??M VARSA VE BEL??RL?? NEM ARALI??INDANA A??A??IDA
  // NEM SEV??YES?? D??????K ??SE BEL??RL?? ARAYA GELENE KADAR BEL??RT??LEN ZAMAN ????ER??S??NDE ??ALI??MASI GEREK??YOR
  async readMoisture(
    contentId: string,
    serverIP: string,
    port: string,
    gateways: GatewayDTO,
  ) {
    //get request for sensor moisture by gateway

    let workGroups = Array<WorkGroupDTO>();
    var sensorCards = Array<SensorCardsDTO>();
    workGroups = await this.workGroupService.getByGateway(contentId);
    // KART BA??LANTIMIZ OLMADI??I ??????N KOD YAPISINI OLU??TURMAK ADINA TUTTU??UM MOCK DATA T??P??NDE DE??????KENLER
    var previousMoistureData = 54500;
    var nextMoistureData = 65000;
    // ------------------------------------------------------------------------------------------------
    const data = workGroups.map(async (element) => {
     
      if (element.WorkType == 'MANUEL') {
        sensorCards = await this.sensorCardService.getByWorkGroup(
          element.contentId,
        );
        sensorCards.map(async (sensorCard) => {
          try {
            this.logger.verbose(
              `${element.Name} ISIMLI SULAMA GRUBUNA BA??LANTI SA??LANDI`,
            );
            //get request for data
            //d??nen her bir sens??r ile, herbir sens??r nem verisini ilgili yerlere yaz
            // daha sonra d??nen veriye g??re ortalama al??p moisture log tablosuna yaz
            // BURASI SADECE NEM OKUMA ????LEM?? ??????ND??R. KAL??BRASYON ZAMANI CAL??BRAT??ON LOG TABLOSUNA YAZILIR!!!!!!!!!
            // SENSORDATAS VE SENSORS PROPERTYLER??NE VER?? YAZILDIKTAN SONRA (KALIBRASYON SEKLINE GORE ORTALAMA ALINDIKTAN SONRA)
            // SENSOR LOG ENT??TYS??NE LOGBASE ENT??TY ?? ENJTEKE ET

            this.logger.verbose(
              `${element.Name} ISIMLI SULAMA GRUBUNDAN NEM VERISI OKUNDU!!!`,
            );

            const create = this.sensorMoistureLogService.create({
              ContentId: '',
              createdAt: new Date(),
              GetDataAt: new Date(),
              isDeleted: false,
              lastChangedDateTime: new Date(),
              SensorCardID: sensorCard.contentId,
              SensorDatas: [''],
              Sensors: [''],
              SensorDatasAverage: '', // B??t??n sens??rlerin ortalamas??,
              updatedAt: new Date(),
            });

            if (create) {
              this.sensorLogService.create({
                SensorCardID: contentId,
                contentId: '',
                LogContent: `${gateways.contentId}'li ${gateways.Name}'li Gateway'e ait ${sensorCard.Name} isimli sens??rden nem verisi ba??ar??yla okundu!`,
                LogDescription: `${gateways.contentId}'li ${gateways.Name}'li Gateway'e ait ${sensorCard.Name} isimli sens??rde nem okundu`,
                LogTitle: `${gateways.Name} Rutin ????lemler`,
                LogStatus: 'Success',
                createdAt: new Date(),
                isDeleted: false,
                lastChangedDateTime: new Date(),
                updatedAt: new Date(),
              });
              this.logger.verbose(
                `${element.Name} ISIMLI SULAMA GRUBUNDAN NEM VERISI OKUNDU!!!`,
              );
              // E??ER SULAMA YAPILMASI GEREKEN NEM SEV??YES??NDEYSE YAPILMASI GEREKEN ????LEM
              if (previousMoistureData < nextMoistureData) {
                // SULAMA YAPTIRMAK ??????N GEREKL?? KOD BLOKLARI
                // VE DAHA SONRA LOG ATILIR
                // SMS G??NDERME
                // MA??L G??NDERME
                // WHATSAPP MESAJ G??NDERME
                this.sensorLogService.create({
                  SensorCardID: contentId,
                  contentId: '',
                  LogContent: `${gateways.contentId}'li ${gateways.Name}'li Gateway'e ait ${sensorCard.Name} isimli sens??r sulama nem seviyesinde, sulama yap??l??yor`,
                  LogDescription: `${gateways.contentId}'li ${gateways.Name}'li Gateway'e ait ${sensorCard.Name} isimli sens??rde ??al????ma aral??????ndad??r.`,
                  LogTitle: `${gateways.Name} Rutin ????lemler`,
                  LogStatus: 'Success',
                  createdAt: new Date(),
                  isDeleted: false,
                  lastChangedDateTime: new Date(),
                  updatedAt: new Date(),
                });
                this.workGroupLogService.create({
                  WorkGroupID: element.contentId,
                  LogContent: `${contentId}'li ${element.Name}'li Sulama Grubunda ${sensorCard.Name} isimli sens??r b??lgesinde sulama yap??l??yor!`,
                  LogDescription: `${element.Name} Nem ??al????ma Aral??????ndad??r.`,
                  LogTitle: `${element.Name} Rutin ????lemler`,
                  LogStatus: 'Success',
                  contentId: '',
                  createdAt: new Date(),
                  isDeleted: false,
                  lastChangedDateTime: new Date(),
                  updatedAt: new Date(),
                });
                this.logger.error(
                  `${element.Name} ISIMLI SULAMA GRUBUNDA VANA A??ILDI SULAMA YAPILIYOR!!!`,
                );
                return true;
              } else {
                this.sensorLogService.create({
                  SensorCardID: contentId,
                  contentId: '',
                  LogContent: `${gateways.contentId}'li ${gateways.Name}'li Gateway'e ait ${sensorCard.Name} isimli sens??r sulama nem seviyesine ula??mad??!`,
                  LogDescription: `${gateways.contentId}'li ${gateways.Name}'li Gateway'e ait ${sensorCard.Name} isimli sens??rde nem seviyesi stabil.`,
                  LogTitle: `${gateways.Name} Rutin ????lemler`,
                  LogStatus: 'Success',
                  createdAt: new Date(),
                  isDeleted: false,
                  lastChangedDateTime: new Date(),
                  updatedAt: new Date(),
                });
                this.logger.warn(
                  `${element.Name} ISIMLI SULAMA GRUBUNDAN NEM VERISI YETERLI SEVIYEDE DEGIL SULAMA YAPILMIYOR!!!`,
                );
                this.workGroupLogService.create({
                  WorkGroupID: element.contentId,
                  LogContent: `${contentId}'li ${element.Name}'li Sulama Grubunda ${sensorCard.Name} isimli sens??r b??lgesi hen??z gerekli nem seviyesinden yukar??dad??r!`,
                  LogDescription: `${element.Name} Nem ??al????ma Aral??????nda De??ildir.`,
                  LogTitle: `${element.Name} Rutin ????lemler`,
                  LogStatus: 'Success',
                  contentId: '',
                  createdAt: new Date(),
                  isDeleted: false,
                  lastChangedDateTime: new Date(),
                  updatedAt: new Date(),
                });
              }

              return true;
            }
            this.sensorLogService.create({
              SensorCardID: contentId,
              contentId: '',
              LogContent: `${gateways.contentId}'li ${gateways.Name}'li Gateway'e ait ${sensorCard.Name} isimli sens??rden nem verisi ba??ar??s??z!`,
              LogDescription: `${gateways.contentId}'li ${gateways.Name}'li Gateway'e ait ${sensorCard.Name} isimli sens??rde nem okunamad??`,
              LogTitle: `${gateways.Name} Rutin ????lemler`,
              LogStatus: 'Failed',
              createdAt: new Date(),
              isDeleted: false,
              lastChangedDateTime: new Date(),
              updatedAt: new Date(),
            });
            this.logger.error(
              `${element.Name} ISIMLI SULAMA GRUBUNDAN NEM VERISI OKUNAMADI!!!`,
            );
            return false;
          } catch (error) {
            this.sensorLogService.create({
              SensorCardID: contentId,
              contentId: '',
              LogContent: `${gateways.contentId}'li ${gateways.Name}'li Gateway'e ait ${sensorCard.Name} isimli sens??rden nem verisi ba??ar??s??z!`,
              LogDescription: ` ${sensorCard.Name} isimli sens??rde nem okunamad?? hata=> ${error}`,
              LogTitle: `${gateways.Name} Rutin ????lemler`,
              LogStatus: 'Failed',
              createdAt: new Date(),
              isDeleted: false,
              lastChangedDateTime: new Date(),
              updatedAt: new Date(),
            });
            this.logger.error(
              `${element.Name} ISIMLI SULAMA GRUBUNDAN NEM VERISI OKUNAMADI!!!`,
            );
            return false;
          }
        });
        return true;
      }
      this.workGroupLogService.create({
        WorkGroupID: element.contentId,
        LogContent: `${contentId}'li ${element.Name}'li Sulama Grubu Manuel Y??netime G??re De??il!`,
        LogDescription: `${element.Name} Ba??lant?? Sa??land??`,
        LogTitle: `${element.Name} Rutin ????lemler`,
        LogStatus: 'Success',
        contentId: '',
        createdAt: new Date(),
        isDeleted: false,
        lastChangedDateTime: new Date(),
        updatedAt: new Date(),
      });
      this.logger.error(
        `${element.Name} ISIMLI SULAMA GRUBU MANUEL YONETIME GORE DEGIL!!!`,
      );
      return false;
    });
    return data;
  }

  public async sendData(
    contentId: string,
    serverIP: string,
    port: string,
    command: string,
  ) {
    try {
      // SERVER IP VE PORTU BELL?? OLAN GATEWAY'E KOMUTU G??NDER,
      // DURUMA G??RE D??N?????? SA??LA
      return true;
    } catch (error) {
      return false;
    }
  }

  public async recieveData() {}
}
