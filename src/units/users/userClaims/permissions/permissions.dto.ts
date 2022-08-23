import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { ContractType } from 'src/model/users/contractType.entity';
import { Permissions } from 'src/model/users/permissions.entity';
import { UserContract } from 'src/model/users/userContract.entity';
import { isBoolean } from 'util';

export class PermissionsDTO implements Readonly<PermissionsDTO> {
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
  RoleID: string;
  @ApiProperty()
  @IsString()
  PermissionName: string;
  @ApiProperty()
  @IsString()
  PermissionDescription: string;
  @ApiProperty()
  @IsString()
  PermissionEvent: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  isDeleted: boolean;

  public static from(dto: Partial<PermissionsDTO>) {
    const it = new PermissionsDTO();
    it.contentId = dto.contentId;

    it.RoleID = dto.RoleID;
    it.PermissionName = dto.PermissionName;
    it.PermissionDescription = dto.PermissionDescription;
    it.PermissionEvent = dto.PermissionEvent;

    it.createdAt = dto.createdAt;
    it.updatedAt = dto.updatedAt;
    it.lastChangedDateTime = dto.lastChangedDateTime;
    it.isDeleted = dto.isDeleted;
    return it;
  }

  public static fromEntity(entity: Permissions) {
    return this.from({
      contentId: entity.ContentID,

      RoleID : entity.RoleID,
      PermissionName : entity.PermissionName,
      PermissionDescription : entity.PermissionDescription,
      PermissionEvent : entity.PermissionEvent,

      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      lastChangedDateTime: entity.lastChangedDateTime,
      isDeleted: entity.isDeleted,
    });
  }

  public static toEntity(dto: Partial<PermissionsDTO>) {
    const givenData = new Permissions();

    givenData.RoleID = dto.RoleID;
    givenData.PermissionName = dto.PermissionName;
    givenData.PermissionDescription = dto.PermissionDescription;
    givenData.PermissionEvent = dto.PermissionEvent;

    givenData.updatedAt = new Date();
    givenData.lastChangedDateTime = new Date();
    givenData.isDeleted = false;
    return givenData;
  }
}
