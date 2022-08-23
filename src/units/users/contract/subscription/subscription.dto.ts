import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { Subscription } from 'src/model/users/subscription.entity';
import { isBoolean } from 'util';

export class SubscriptionDTO implements Readonly<SubscriptionDTO> {
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
  userId: string;
  @ApiProperty()
  @IsString()
  contractId: string;
  @ApiProperty()
  @IsString()
  country: string;
  @ApiProperty()
  @IsString()
  city: string;
  @ApiProperty()
  @IsString()
  distinct: string;
  @ApiProperty()
  @IsString()
  street: string;
  @ApiProperty()
  @IsString()
  postalCode: string;
  @ApiProperty()
  @IsString()
  coordinates: string;
  @ApiProperty()
  @IsString()
  detailedAddress: string;
  @ApiProperty()
  @IsString()
  creatorCompany: string;
  @ApiProperty()
  @IsString()
  creatorCompanyCode: string;
  @ApiProperty()
  @IsString()
  creatorStaffName: string;
  @ApiProperty()
  @IsString()
  simCardNo: string;
  @ApiProperty()
  @IsString()
  simCardIp: string;
  @ApiProperty()
  @IsString()
  modemImei: string;
  @ApiProperty()
  @IsString()
  sensorIds: string[];
  @ApiProperty()
  @IsString()
  softwareVersion: string;
  @ApiProperty()
  @IsString()
  serverIP: string;
  @ApiProperty()
  @IsString()
  deliveredProductIDs: string[];

  @ApiProperty({ required: false })
  @IsBoolean()
  isDeleted: boolean;

  public static from(dto: Partial<SubscriptionDTO>) {
    const it = new SubscriptionDTO();
    it.contentId = dto.contentId;

    it.userId = dto.userId;
    it.contractId = dto.contractId;
    it.country = dto.country;
    it.city = dto.city;
    it.distinct = dto.distinct;
    it.street = dto.street;
    it.postalCode = dto.postalCode;
    it.coordinates = dto.coordinates;
    it.detailedAddress = dto.detailedAddress;
    it.creatorCompany = dto.creatorCompany;
    it.creatorCompanyCode = dto.creatorCompanyCode;
    it.creatorStaffName = dto.creatorStaffName;
    it.simCardNo = dto.simCardNo;
    it.simCardIp = dto.simCardIp;
    it.modemImei = dto.modemImei;
    it.sensorIds = dto.sensorIds;

    it.createdAt = dto.createdAt;
    it.updatedAt = dto.updatedAt;
    it.lastChangedDateTime = dto.lastChangedDateTime;
    it.isDeleted = dto.isDeleted;
    return it;
  }

  public static fromEntity(entity: Subscription) {
    return this.from({
      contentId: entity.ContentID,

      userId: entity.userId,
      contractId: entity.contractId,
      country: entity.country,
      city: entity.city,
      distinct: entity.distinct,
      street: entity.street,
      postalCode: entity.postalCode,
      coordinates: entity.coordinates,
      detailedAddress: entity.detailedAddress,
      creatorCompany: entity.creatorCompany,
      creatorCompanyCode: entity.creatorCompanyCode,
      creatorStaffName: entity.creatorStaffName,
      simCardNo: entity.simCardNo,
      simCardIp: entity.simCardIp,
      modemImei: entity.modemImei,
      sensorIds: entity.sensorIds,
      softwareVersion: entity.softwareVersion,
      serverIP: entity.serverIp,
      deliveredProductIDs: entity.deliveredProductIDs,

      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      lastChangedDateTime: entity.lastChangedDateTime,
      isDeleted: entity.isDeleted,
    });
  }

  public static toEntity(dto: Partial<SubscriptionDTO>) {
    const givenData = new Subscription();

    givenData.userId = dto.userId;
    givenData.contractId = dto.contractId;
    givenData.country = dto.country;
    givenData.city = dto.city;
    givenData.distinct = dto.distinct;
    givenData.street = dto.street;
    givenData.postalCode = dto.postalCode;
    givenData.coordinates = dto.coordinates;
    givenData.detailedAddress = dto.detailedAddress;
    givenData.creatorCompany = dto.creatorCompany;
    givenData.creatorCompanyCode = dto.creatorCompanyCode;
    givenData.creatorStaffName = dto.creatorStaffName;
    givenData.simCardNo = dto.simCardNo;
    givenData.simCardIp = dto.simCardIp;
    givenData.modemImei = dto.modemImei;
    givenData.sensorIds = dto.sensorIds;
    givenData.softwareVersion = dto.softwareVersion;
    givenData.serverIp = dto.serverIP;
    givenData.deliveredProductIDs = dto.deliveredProductIDs;

    givenData.updatedAt = new Date();
    givenData.lastChangedDateTime = new Date();
    givenData.isDeleted = false;
    return givenData;
  }
}
