import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { ContractType } from 'src/model/users/contractType.entity';
import { isBoolean } from 'util';

export class ContractTypeDTO implements Readonly<ContractTypeDTO> {
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
  name: string;
  @ApiProperty()
  @IsString()
  title: string;
  @ApiProperty()
  @IsString()
  subMainTitle: string;
  @ApiProperty()
  @IsString()
  subContTitle: string;
  @ApiProperty()
  @IsString()
  description: string;
  @ApiProperty()
  @IsString()
  mainDescription: string;
  @ApiProperty()
  @IsString()
  content: string;
  @ApiProperty()
  @IsString()
  mainContent: string;
  @ApiProperty()
  @IsString()
  subContent: string;
  @ApiProperty()
  @IsString()
  altText: string;
  @ApiProperty()
  @IsString()
  altMainText: string;
  @ApiProperty()
  @IsString()
  altContentText: string;
  @ApiProperty()
  @IsString()
  contractTime: string;

  @ApiProperty({ required: false })
  @IsBoolean()
  isDeleted: boolean;

  public static from(dto: Partial<ContractTypeDTO>) {
    const it = new ContractTypeDTO();
    it.contentId = dto.contentId;

    it.name = dto.name;
    it.title = dto.title;
    it.subMainTitle = dto.subMainTitle;
    it.subContTitle = dto.subContTitle;
    it.description = dto.description;
    it.mainDescription = dto.mainDescription;
    it.content = dto.content;
    it.mainContent = dto.mainContent;
    it.subContent = dto.subContent;
    it.altText = dto.altText;
    it.altMainText = dto.altMainText;
    it.altContentText = dto.altContentText;
    it.contractTime = dto.contractTime;

    it.createdAt = dto.createdAt;
    it.updatedAt = dto.updatedAt;
    it.lastChangedDateTime = dto.lastChangedDateTime;
    it.isDeleted = dto.isDeleted;
    return it;
  }

  public static fromEntity(entity: ContractType) {
    return this.from({
      contentId: entity.ContentID,

      name: entity.name,
      title: entity.title,
      subMainTitle: entity.subMainTitle,
      subContTitle: entity.subContTitle,
      description: entity.description,
      mainDescription: entity.mainDescription,
      content: entity.content,
      mainContent: entity.mainContent,
      subContent: entity.subContent,
      altText: entity.altText,
      altMainText: entity.altMainText,
      altContentText: entity.altContentText,
      contractTime: entity.contractTime,

      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      lastChangedDateTime: entity.lastChangedDateTime,
      isDeleted: entity.isDeleted,
    });
  }

  public static toEntity(dto: Partial<ContractTypeDTO>) {
    const givenData = new ContractType();
   
    givenData.name = dto.name;
    givenData.title = dto.title;
    givenData.subMainTitle = dto.subMainTitle;
    givenData.subContTitle = dto.subContTitle;
    givenData.description = dto.description;
    givenData.mainDescription = dto.mainDescription;
    givenData.content = dto.content;
    givenData.mainContent = dto.mainContent;
    givenData.subContent = dto.subContent;
    givenData.altText = dto.altText;
    givenData.altMainText = dto.altMainText;
    givenData.altContentText = dto.altContentText;
    givenData.contractTime = dto.contractTime;

    givenData.updatedAt = new Date();
    givenData.lastChangedDateTime = new Date();
    givenData.isDeleted = false;
    return givenData;
  }
}
