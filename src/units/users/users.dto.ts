import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { Users } from 'src/model/users/users.entity';

export class UsersDTO implements Readonly<UsersDTO> {
  @ApiProperty({ required: false })
  ContentID: string;
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
  Name: string;
  @ApiProperty()
  @IsString()
  Surname: string;
  @ApiProperty()
  @IsString()
  Mail: string;
  @ApiProperty()
  @IsString()
  Password: string;
  @ApiProperty()
  @IsString()
  Gsm: string;
  @ApiProperty()
  @IsString()
  CitizenShipNum: string;
  @ApiProperty()
  @IsString()
  Nationality: string;
  @ApiProperty()
  @IsString()
  CompanyName: string;
  @ApiProperty()
  @IsString()
  TaxNum: string;
  @ApiProperty()
  @IsString()
  MersisNo: string;
  @ApiProperty()
  @IsString()
  Address: string;
  @ApiProperty()
  @IsBoolean()
  MailIsVerified: boolean;
  @ApiProperty()
  MailVerifiedAt: Date;
  @ApiProperty()
  @IsString()
  Country: string;
  @ApiProperty()
  @IsString()
  City: string;
  @ApiProperty()
  @IsString()
  Distinct: string;
  @ApiProperty()
  @IsString()
  DetailAddress: string;
  @ApiProperty()
  @IsString()
  PostalCode: string;
  @ApiProperty()
  @IsString()
  Phone: string;
  @ApiProperty()
  @IsString()
  CompanyPhone: string;
  @ApiProperty()
  @IsString()
  HomePhone: string;
  @ApiProperty()
  @IsString()
  UserType: string;
  @ApiProperty()
  @IsBoolean()
  IsAdmin: boolean;
  @ApiProperty()
  @IsBoolean()
  IsBusiness: boolean;
  @ApiProperty({ required: false })
  @IsBoolean()
  isDeleted: boolean;

  public static from(dto: Partial<UsersDTO>) {
    const it = new UsersDTO();
    it.ContentID = dto.ContentID;
    it.RoleID = dto.RoleID;
    it.Name = dto.Name;
    it.Surname = dto.Surname;
    it.Mail = dto.Mail;
    it.Password = dto.Password;
    it.Gsm = dto.Gsm;
    it.CitizenShipNum = dto.CitizenShipNum;
    it.Nationality = dto.Nationality;
    it.CompanyName = dto.CompanyName;
    it.TaxNum = dto.TaxNum;
    it.MersisNo = dto.MersisNo;
    it.Address = dto.Address;
    it.MailIsVerified = dto.MailIsVerified;
    it.MailVerifiedAt = dto.MailVerifiedAt;
    it.Country = dto.Country;
    it.City = dto.City;
    it.Distinct = dto.Distinct;
    it.DetailAddress = dto.DetailAddress;
    it.PostalCode = dto.PostalCode;
    it.Phone = dto.Phone;
    it.CompanyName = dto.CompanyName;
    it.HomePhone = dto.HomePhone;
    it.UserType = dto.UserType;
    it.IsAdmin = dto.IsAdmin;
    it.IsBusiness = dto.IsBusiness;

    it.createdAt = dto.createdAt;
    it.updatedAt = dto.updatedAt;
    it.lastChangedDateTime = dto.lastChangedDateTime;
    it.isDeleted = dto.isDeleted;
    return it;
  }

  public static fromEntity(entity: Users) {
    return this.from({
      ContentID: entity.ContentID,
      
      RoleID: entity.RoleID,
      Address: entity.Address,
      CitizenShipNum: entity.CitizenShipNum,
      City: entity.City,
      CompanyName: entity.CompanyName,
      CompanyPhone: entity.CompanyPhone,
      Country: entity.Country,
      DetailAddress: entity.DetailAddress,
      Distinct: entity.Distinct,
      Gsm: entity.Gsm,
      HomePhone: entity.HomePhone,
      IsAdmin: entity.IsAdmin,
      IsBusiness: entity.IsBusiness,
      Mail: entity.Mail,
      MailIsVerified: entity.MailIsVerified,
      MailVerifiedAt: entity.MailVerifiedAt,
      MersisNo: entity.MersisNo,
      Name: entity.Name,
      Nationality: entity.Nationality,
      Password: entity.Password,
      Phone: entity.Phone,
      PostalCode: entity.PostalCode,
      Surname: entity.Surname,
      TaxNum: entity.TaxNum,
      UserType: entity.UserType,

      createdAt: entity.createdAt,
      updatedAt: entity.updatedAt,
      lastChangedDateTime: entity.lastChangedDateTime,
      isDeleted: entity.isDeleted,
    });
  }

  public static toEntity(dto: Partial<UsersDTO>) {
    const givenData = new Users();
    givenData.RoleID = dto.RoleID;
    givenData.Name = dto.Name;
    givenData.Surname = dto.Surname;
    givenData.Mail = dto.Mail;
    givenData.Password = dto.Password;
    givenData.Gsm = dto.Gsm;
    givenData.CitizenShipNum = dto.CitizenShipNum;
    givenData.Nationality = dto.Nationality;
    givenData.CompanyName = dto.CompanyName;
    givenData.TaxNum = dto.TaxNum;
    givenData.MersisNo = dto.MersisNo;
    givenData.Address = dto.Address;
    givenData.MailIsVerified = dto.MailIsVerified;
    givenData.MailVerifiedAt = dto.MailVerifiedAt;
    givenData.Country = dto.Country;
    givenData.City = dto.City;
    givenData.Distinct = dto.Distinct;
    givenData.DetailAddress = dto.DetailAddress;
    givenData.PostalCode = dto.PostalCode;
    givenData.Phone = dto.Phone;
    givenData.CompanyPhone = dto.CompanyPhone;
    givenData.HomePhone = dto.HomePhone;
    givenData.UserType = dto.UserType;
    givenData.IsBusiness = dto.IsBusiness;

    givenData.updatedAt = new Date();
    givenData.lastChangedDateTime = new Date();
    givenData.isDeleted = false;
    return givenData;
  }
}
