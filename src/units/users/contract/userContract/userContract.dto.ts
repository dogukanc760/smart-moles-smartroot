import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { ContractType } from 'src/model/users/contractType.entity';
import { UserContract } from 'src/model/users/userContract.entity';
import { isBoolean } from 'util';

export class UserContractDTO implements Readonly<UserContractDTO> {
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
  UserID: string;
  @ApiProperty()
  @IsString()
  ContractID: string;
  @ApiProperty()
  @IsString()
  ContractTypeID: string;
  @ApiProperty()
  @IsString()
  ContractName: string;
  

  @ApiProperty({ required: false })
  @IsBoolean()
  isDeleted: boolean;

  public static from(dto: Partial<UserContractDTO>) {
    const it = new UserContractDTO();
    it.contentId = dto.contentId;

    it.UserID = dto.UserID;
    it.ContractID = dto.ContractID;
    it.ContractTypeID = dto.ContractTypeID;
    it.ContractName = dto.ContractName;

    it.createdAt = dto.createdAt;
    it.updatedAt = dto.updatedAt;
    it.lastChangedDateTime = dto.lastChangedDateTime;
    it.isDeleted = dto.isDeleted;
    return it;
  }

  public static fromEntity(entity: UserContract) {
    return this.from({
      contentId: entity.ContentID,

      UserID: entity.UserID,
      ContractID : entity.ContractID,
      ContractTypeID: entity.ContractTypeID,
      ContractName: entity.ContractName,

      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      lastChangedDateTime: entity.lastChangedDateTime,
      isDeleted: entity.isDeleted,
    });
  }

  public static toEntity(dto: Partial<UserContractDTO>) {
    const givenData = new UserContract();
   
    givenData.UserID = dto.UserID;
    givenData.ContractID = dto.ContractID;
    givenData.ContractTypeID = dto.ContractTypeID;
    givenData.ContractName = dto.ContractName;

    givenData.updatedAt = new Date();
    givenData.lastChangedDateTime = new Date();
    givenData.isDeleted = false;
    return givenData;
  }
}
