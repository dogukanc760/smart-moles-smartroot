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

  // GATEWAYLERE BAĞLANIRKEN WORKER VEYA CONNECTTOGATEWAYANDPROCESS İÇERİSİNDE FONKSİYONLARI BİRBİRİNE BAĞLA!

  // --------------------------------------------- KRİTİK NOKTALARDA MAİL GÖNDERMEYİ UNUTMA !!!!!!!! ----------------------------

  public async Worker() {
    // Gateway bağlantı adımı
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
            `${element.Name} ISIMLI GATEWAY NEM VERISI OKUMA İŞLEMİ BAŞARILI!`,
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
            `${element.Name} ISIMLI GATEWAY TARİH SAAT OKUNMA İŞLEMİ BAŞARILI!`,
          );
        }
      });

      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  // TARİH VE ZAMAN OKUNDUKTAN SONRA DB'DE KAYITLI OLAN TARİH VE ZAMAN ARALIĞINDA İSE (TİMER LI YÖNETIMDE GEÇERLI)
  // ÇALIŞMA ZAMAN ARALIĞINDADIR DİYİP BİLGİ LOGU ATMALI
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
      // okunan tarih updatedAt, huba gönderilen tarih lastChangedAt ' e yazılır
      // şuan karta bağlı olmadığımız için şuanın tarihini yazıyoruz.
      gateways.updatedAt = new Date();

      const workGroups = await this.workGroupService.getByGateway(
        gateways.contentId,
      );

      //return false;

      workGroups.forEach((element) => {
        if (element.WorkType == 'MANUEL') {
          // burada eğer manuel ise saat tarih okumak için karta bağlanıp işlemleri yapacağız.
          this.logger.verbose(
            `${element.Name} ISIMLI GATEWAY BAĞLANTISI SAĞLANDI!`,
          );
          // karta bağlantımız olmadığı için varsayımsal olarak kodluyoruz.
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
              `${element.Name} ISIMLI GATEWAY TARİH SAAT OKUNMA İŞLEMİ BAŞARILIa!`,
            );
            this.gatewayLogService.create({
              GatewayID: contentId,
              LogContent: `${contentId}'li ${gateways.Name}'li Gateway Tarih Saat Okuma İşlemi Başarılı!`,
              LogDescription: `${gateways.Name} Bağlantı Sağlandı ve Tarih Saat Okundu`,
              LogTitle: `${gateways.Name} Rutin İşlemler`,
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
            `${element.Name} ISIMLI GATEWAY TARİH SAAT OKUNMA İŞLEMİ BAŞARISIZ!!!`,
          );
          this.gatewayLogService.create({
            GatewayID: contentId,
            LogContent: `${contentId}'li ${gateways.Name}'li Gateway Tarih Saat Okuma İşlemi Başarısız!`,
            LogDescription: `${gateways.Name} Tarih ve Saat Okuma İşlemi Başarısız.`,
            LogTitle: `${gateways.Name} Rutin İşlemler`,
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
          LogContent: `${contentId}'li ${element.Name}'li Sulama Grubu Manuel Yönetime Göre Değil!`,
          LogDescription: `${element.Name} Bağlantı Sağlandı`,
          LogTitle: `${element.Name} Rutin İşlemler`,
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
        LogContent: `${contentId}'li ${gateways.Name}'li Gateway Tarih Saat Okuma İşlemi Başarısız!`,
        LogDescription: `${gateways.Name} Gateway hata içeriği => ${error}`,
        LogTitle: `${gateways.Name} Rutin İşlemler`,
        LogStatus: 'Failed',
        contentId: '',
        createdAt: new Date(),
        isDeleted: false,
        lastChangedDateTime: new Date(),
        updatedAt: new Date(),
      });
      this.logger.error(
        `${gateways.Name} ISIMLI GATEWAY TARİH SAAT OKUNMA İŞLEMİ BAŞARISIZ!!!`,
      );
      return false;
    }
  }

  // NEM VERİSİ GELDİKTEN SONRA EĞER TİMERDAYSA NEM VERİSİNE GEREK YOK ÇÜNKÜ ÇALISMA PLANI BELLİ
  // FAKAT SENSÖRE GÖRE VEYA NEM SEVİYESİ VS GÖRE YÖNETİM VARSA VE BELİRLİ NEM ARALIĞINDANA AŞAĞIDA
  // NEM SEVİYESİ DÜŞÜK İSE BELİRLİ ARAYA GELENE KADAR BELİRTİLEN ZAMAN İÇERİSİNDE ÇALIŞMASI GEREKİYOR
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
    // KART BAĞLANTIMIZ OLMADIĞI İÇİN KOD YAPISINI OLUŞTURMAK ADINA TUTTUĞUM MOCK DATA TİPİNDE DEĞİŞKENLER
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
              `${element.Name} ISIMLI SULAMA GRUBUNA BAĞLANTI SAĞLANDI`,
            );
            //get request for data
            //dönen her bir sensör ile, herbir sensör nem verisini ilgili yerlere yaz
            // daha sonra dönen veriye göre ortalama alıp moisture log tablosuna yaz
            // BURASI SADECE NEM OKUMA İŞLEMİ İÇİNDİR. KALİBRASYON ZAMANI CALİBRATİON LOG TABLOSUNA YAZILIR!!!!!!!!!
            // SENSORDATAS VE SENSORS PROPERTYLERİNE VERİ YAZILDIKTAN SONRA (KALIBRASYON SEKLINE GORE ORTALAMA ALINDIKTAN SONRA)
            // SENSOR LOG ENTİTYSİNE LOGBASE ENTİTY İ ENJTEKE ET

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
              SensorDatasAverage: '', // Bütün sensörlerin ortalaması,
              updatedAt: new Date(),
            });

            if (create) {
              this.sensorLogService.create({
                SensorCardID: contentId,
                contentId: '',
                LogContent: `${gateways.contentId}'li ${gateways.Name}'li Gateway'e ait ${sensorCard.Name} isimli sensörden nem verisi başarıyla okundu!`,
                LogDescription: `${gateways.contentId}'li ${gateways.Name}'li Gateway'e ait ${sensorCard.Name} isimli sensörde nem okundu`,
                LogTitle: `${gateways.Name} Rutin İşlemler`,
                LogStatus: 'Success',
                createdAt: new Date(),
                isDeleted: false,
                lastChangedDateTime: new Date(),
                updatedAt: new Date(),
              });
              this.logger.verbose(
                `${element.Name} ISIMLI SULAMA GRUBUNDAN NEM VERISI OKUNDU!!!`,
              );
              // EĞER SULAMA YAPILMASI GEREKEN NEM SEVİYESİNDEYSE YAPILMASI GEREKEN İŞLEM
              if (previousMoistureData < nextMoistureData) {
                // SULAMA YAPTIRMAK İÇİN GEREKLİ KOD BLOKLARI
                // VE DAHA SONRA LOG ATILIR
                // SMS GÖNDERME
                // MAİL GÖNDERME
                // WHATSAPP MESAJ GÖNDERME
                this.sensorLogService.create({
                  SensorCardID: contentId,
                  contentId: '',
                  LogContent: `${gateways.contentId}'li ${gateways.Name}'li Gateway'e ait ${sensorCard.Name} isimli sensör sulama nem seviyesinde, sulama yapılıyor`,
                  LogDescription: `${gateways.contentId}'li ${gateways.Name}'li Gateway'e ait ${sensorCard.Name} isimli sensörde çalışma aralığındadır.`,
                  LogTitle: `${gateways.Name} Rutin İşlemler`,
                  LogStatus: 'Success',
                  createdAt: new Date(),
                  isDeleted: false,
                  lastChangedDateTime: new Date(),
                  updatedAt: new Date(),
                });
                this.workGroupLogService.create({
                  WorkGroupID: element.contentId,
                  LogContent: `${contentId}'li ${element.Name}'li Sulama Grubunda ${sensorCard.Name} isimli sensör bölgesinde sulama yapılıyor!`,
                  LogDescription: `${element.Name} Nem Çalışma Aralığındadır.`,
                  LogTitle: `${element.Name} Rutin İşlemler`,
                  LogStatus: 'Success',
                  contentId: '',
                  createdAt: new Date(),
                  isDeleted: false,
                  lastChangedDateTime: new Date(),
                  updatedAt: new Date(),
                });
                this.logger.error(
                  `${element.Name} ISIMLI SULAMA GRUBUNDA VANA AÇILDI SULAMA YAPILIYOR!!!`,
                );
                return true;
              } else {
                this.sensorLogService.create({
                  SensorCardID: contentId,
                  contentId: '',
                  LogContent: `${gateways.contentId}'li ${gateways.Name}'li Gateway'e ait ${sensorCard.Name} isimli sensör sulama nem seviyesine ulaşmadı!`,
                  LogDescription: `${gateways.contentId}'li ${gateways.Name}'li Gateway'e ait ${sensorCard.Name} isimli sensörde nem seviyesi stabil.`,
                  LogTitle: `${gateways.Name} Rutin İşlemler`,
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
                  LogContent: `${contentId}'li ${element.Name}'li Sulama Grubunda ${sensorCard.Name} isimli sensör bölgesi henüz gerekli nem seviyesinden yukarıdadır!`,
                  LogDescription: `${element.Name} Nem Çalışma Aralığında Değildir.`,
                  LogTitle: `${element.Name} Rutin İşlemler`,
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
              LogContent: `${gateways.contentId}'li ${gateways.Name}'li Gateway'e ait ${sensorCard.Name} isimli sensörden nem verisi başarısız!`,
              LogDescription: `${gateways.contentId}'li ${gateways.Name}'li Gateway'e ait ${sensorCard.Name} isimli sensörde nem okunamadı`,
              LogTitle: `${gateways.Name} Rutin İşlemler`,
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
              LogContent: `${gateways.contentId}'li ${gateways.Name}'li Gateway'e ait ${sensorCard.Name} isimli sensörden nem verisi başarısız!`,
              LogDescription: ` ${sensorCard.Name} isimli sensörde nem okunamadı hata=> ${error}`,
              LogTitle: `${gateways.Name} Rutin İşlemler`,
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
        LogContent: `${contentId}'li ${element.Name}'li Sulama Grubu Manuel Yönetime Göre Değil!`,
        LogDescription: `${element.Name} Bağlantı Sağlandı`,
        LogTitle: `${element.Name} Rutin İşlemler`,
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
      // SERVER IP VE PORTU BELLİ OLAN GATEWAY'E KOMUTU GÖNDER,
      // DURUMA GÖRE DÖNÜŞÜ SAĞLA
      return true;
    } catch (error) {
      return false;
    }
  }

  public async recieveData() {}
}
