import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { readFileSync } from 'fs';
import { diskStorage } from 'multer';
import { TransformInterceptor } from 'src/libs/api-results/standart-results';
import { SmartRootDetailSecondDTO } from './smartRootDetailSecond.dto';
import { SmartRootDetailSecondService } from './smartRootDetailSecond.service';
import * as fs from 'fs';
import * as path from 'path';
import { parse } from 'csv-parse';
import { SmartRootDetailSecond } from 'src/model/SmartRoot/smartRootDetailSecond.entity';

@Controller('smart-root-second')
@ApiTags('Smart Root Detail Second Endpoints')
@UseInterceptors(TransformInterceptor)
export class SmartRootDetailSecondController {
  constructor(
    private smartRootDetailSecondService: SmartRootDetailSecondService,
  ) {}

  @Get()
  public async getAll(): Promise<SmartRootDetailSecondDTO[]> {
    return await this.smartRootDetailSecondService.getAll();
  }

  // @Get(':id')
  // public async get(@Param('id') id: string): Promise<SmartRootDetailSecondDTO> {
  //   return await this.smartRootDetailSecondService.get(id);
  // }

  @Get('/get-by-smartroot/:id')
  public async getBySmartRoot(
    @Param('id') id: string,
  ): Promise<SmartRootDetailSecondDTO[]> {
    return await this.smartRootDetailSecondService.getBySmartRoot(id);
  }

  @Get('/setData/dataset')
  //@Post()
  // @UseInterceptors(
  //   FileInterceptor('file_asset', {
  //     storage:diskStorage({
  //       destination:'../../../files',
  //     })
  //   })
  // )
  // ESKİ SİSTEMDE Kİ SMARTROOT DATALARINI EXCEL OLARAK EXPORT ETTIK VE CSV FİLE DAN OKUYUP KENDI DBMIZE YAZDIK
  async setSmartRootData(): Promise<any> {
    try {
      // const csvFile = readFileSync('src/data-1661165451625.csv', {
      //   encoding: 'utf8',
      // });
      // console.log(csvFile.normalize('NFC'));
      const csvFilePath = 'src/data-1661165451625.csv';

      const headers = ['id', 'sc_id', 'device_id'];
      const sensorHeaders = [];
      const sendorName = [];
      const dataArray = Array<any>();
      for (let index = 1; index <= 32; index++) {
        headers.push('sensor' + index);
        sendorName.push('sensor' + index);
        sensorHeaders.push(index);
      }

      headers.push('state', 'day', 'created_date', 'created_at', 'updated_at');
      const fileContent = fs.readFileSync(csvFilePath, 'utf8');
      parse(
        fileContent,
        {
          delimiter: ',',
          columns: headers,
        },
        (error, result: SmartRootDetailSecond[]) => {
          if (error) {
            console.error(error);
          }

          console.log('Result', result.length);
          result.map(async (result, index) => {
            dataArray.push(result);
          });
          dataArray.map(async (result, index) => {
            let sensorAray = Array<string>();
            sensorAray.push(
              result.sensor1,
              result.sensor2,
              result.sensor3,
              result.sensor4,
              result.sensor5,
              result.sensor6,
              result.sensor7,
              result.sensor8,
              result.sensor9,
              result.sensor10,
              result.sensor11,
              result.sensor12,
              result.sensor13,
              result.sensor14,
              result.sensor15,
              result.sensor16,
              result.sensor17,
              result.sensor18,
              result.sensor19,
              result.sensor20,
              result.sensor21,
              result.sensor22,
              result.sensor23,
              result.sensor24,
              result.sensor25,
              result.sensor26,
              result.sensor27,
              result.sensor28,
              result.sensor29,
              result.sensor30,
              result.sensor31,
              result.sensor32,
            );
            const record = await this.smartRootDetailSecondService.create({
              contentId: '',
              createdAt: new Date(),
              isDeleted: false,
              lastChangedDateTime: new Date(),
              SensorDatas: sensorAray,
              Sensors: sensorHeaders,
              SmartRootID: 'bb89daa7-d7f4-4936-bc25-faeddf13abb6',
              updatedAt: new Date(),
            });
          });
          //console.log(dataArray);
        },
      );
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  @Post()
  public async create(
    @Body() dto: SmartRootDetailSecondDTO,
  ): Promise<SmartRootDetailSecondDTO> {
    return await this.smartRootDetailSecondService.create(dto);
  }

  @Put(':id')
  public async update(
    @Param('id') id: string,
    @Body() dto: SmartRootDetailSecondDTO,
  ): Promise<SmartRootDetailSecondDTO> {
    return await this.smartRootDetailSecondService.update(id, dto);
  }

  @Delete(':id')
  public async delete(
    @Param('id') id: string,
  ): Promise<SmartRootDetailSecondDTO> {
    return await this.smartRootDetailSecondService.delete(id);
  }
}
