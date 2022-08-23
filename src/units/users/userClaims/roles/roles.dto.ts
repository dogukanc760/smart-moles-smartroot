import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { Permissions } from 'src/model/users/permissions.entity';
import { Roles } from 'src/model/users/roles.entity';
import { isBoolean } from 'util';

export class RolesDTO implements Readonly<RolesDTO> {
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
  RoleName: string;
  @ApiProperty()
  @IsString()
  RoleDescription: string;


  @ApiProperty({ required: false })
  @IsBoolean()
  isDeleted: boolean;

  public static from(dto: Partial<RolesDTO>) {
    const it = new RolesDTO();
    it.contentId = dto.contentId;

    it.RoleName = dto.RoleName;
    it.RoleDescription = dto.RoleDescription;
    

    it.createdAt = dto.createdAt;
    it.updatedAt = dto.updatedAt;
    it.lastChangedDateTime = dto.lastChangedDateTime;
    it.isDeleted = dto.isDeleted;
    return it;
  }

  public static fromEntity(entity: Roles) {
    return this.from({
      contentId: entity.ContentID,

      RoleName : entity.RoleName,
      RoleDescription : entity.RoleDescription,

      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      lastChangedDateTime: entity.lastChangedDateTime,
      isDeleted: entity.isDeleted,
    });
  }

  public static toEntity(dto: Partial<RolesDTO>) {
    const givenData = new Roles();

    givenData.RoleName = dto.RoleName;
    givenData.RoleDescription = dto.RoleDescription;

    givenData.updatedAt = new Date();
    givenData.lastChangedDateTime = new Date();
    givenData.isDeleted = false;
    return givenData;
  }
}
