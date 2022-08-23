import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString, IsBoolean } from 'class-validator';
import { Users } from 'src/model/users/users.entity';

export class LoginUsersDTO implements Readonly<LoginUsersDTO> {
  @ApiProperty({ required: false })
  Mail: string;
  @ApiProperty()
  @IsString()
  Password: string;
  // @ApiProperty()
  // @IsString()
  // Gsm: string;

  public static from(dto: Partial<LoginUsersDTO>) {
    const it = new LoginUsersDTO();

    it.Mail = dto.Mail;
    it.Password = dto.Password;
    //it.Gsm = dto.Gsm;

    return it;
  }

  public static fromEntity(entity: Users) {
    return this.from({
      //Gsm: entity.Gsm,

     Mail: entity.Mail,

      Password: entity.Password,
    });
  }

  public static toEntity(dto: Partial<LoginUsersDTO>) {
    const givenData = new Users();

    givenData.Mail = dto.Mail;
    givenData.Password = dto.Password;
    //givenData.Gsm = dto.Gsm;

    return givenData;
  }
}
