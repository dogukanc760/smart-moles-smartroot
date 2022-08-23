import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { SmartRootClassification } from 'src/model/SmartRoot/smartRootClassification.entity';

export class SmartRootClassificationDTO
  implements Readonly<SmartRootClassificationDTO>
{
  @ApiProperty({ required: false })
  contentId: string;
  @ApiProperty({ required: false })
  createdAt: Date;
  @ApiProperty({ required: false })
  updatedAt: Date;
  @ApiProperty({ required: false })
  lastChangedDateTime: Date;
  @ApiProperty()
  @IsString()
  SmartRootID: string;
  @ApiProperty()
  @IsString()
  GatewayID: string;
  @ApiProperty()
  @IsString()
  Sensors: string[];
  @ApiProperty()
  @IsString()
  SensorDatas: string[];
  @ApiProperty()
  @IsString()
  SensorClasses: string[];
  @ApiProperty({ required: false })
  @IsBoolean()
  isDeleted: boolean;

  public static from(dto: Partial<SmartRootClassificationDTO>) {
    const it = new SmartRootClassificationDTO();
    it.contentId = dto.contentId;

    it.SmartRootID = dto.SmartRootID;
    it.Sensors = dto.Sensors;
    it.GatewayID = dto.GatewayID;
    it.SensorClasses = dto.SensorClasses;
    it.SensorDatas = dto.SensorDatas;
    it.createdAt = dto.createdAt;
    it.updatedAt = dto.updatedAt;
    it.lastChangedDateTime = dto.lastChangedDateTime;
    it.isDeleted = dto.isDeleted;
    return it;
  }

  public static fromEntity(entity: SmartRootClassification) {
    return this.from({
      contentId: entity.ContentID,
      Sensors: entity.Sensors,
      GatewayID: entity.GatewayID,
      SensorClasses: entity.SensorClasses,
      SensorDatas: entity.SensorDatas,
      SmartRootID: entity.SmartRootID,
      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      lastChangedDateTime: entity.lastChangedDateTime,
      isDeleted: entity.isDeleted,
    });
  }

  public static toEntity(dto: Partial<SmartRootClassificationDTO>) {
    const givenData = new SmartRootClassification();
    givenData.SmartRootID = dto.SmartRootID;
    givenData.ContentID = dto.contentId;
    givenData.SensorClasses = dto.SensorClasses;
    givenData.SensorDatas = dto.SensorDatas;
    givenData.Sensors = dto.Sensors;

    givenData.updatedAt = new Date();
    givenData.lastChangedDateTime = new Date();
    givenData.isDeleted = false;
    return givenData;
  }
}
